import os
import re
import json
import uuid
import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
from backend.models import DatasetMetadata, ColumnSchema, DatasetPreviewResponse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")
METADATA_FILE = os.path.join(DATA_DIR, "datasets.json")

# Ensure required directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# 50 MB limit
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".csv": "CSV",
    ".xlsx": "XLSX",
    ".xls": "XLS",
    ".json": "JSON"
}

ALLOWED_MIME_TYPES = {
    "text/csv",
    "text/plain",
    "application/csv",
    "application/x-csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json",
    "application/octet-stream"  # Browser fallbacks for csv/xlsx
}

def get_file_extension(filename: str) -> str:
    _, ext = os.path.splitext(filename.lower())
    return ext

def format_file_size(size_bytes: int) -> str:
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes} B"

def sanitize_filename(filename: str) -> str:
    """Protect against directory traversal and dangerous characters."""
    base = os.path.basename(filename)
    # Remove any non-alphanumeric or standard characters
    sanitized = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', base)
    if not sanitized or sanitized.startswith('.'):
        sanitized = f"dataset_{uuid.uuid4().hex[:8]}" + get_file_extension(filename)
    return sanitized

def map_pandas_dtype_to_standard(dtype) -> str:
    s_dtype = str(dtype).lower()
    if "int" in s_dtype:
        return "INTEGER"
    if "float" in s_dtype or "decimal" in s_dtype or "numeric" in s_dtype:
        return "DECIMAL"
    if "bool" in s_dtype:
        return "BOOLEAN"
    if "datetime" in s_dtype or "timestamp" in s_dtype:
        return "DATETIME"
    return "VARCHAR"

def clean_dataframe_for_json(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Converts a DataFrame to JSON-compliant records, replacing NaN/NaT/inf with None."""
    # Replace non-finite values
    df_clean = df.copy()
    # Fill NaN and convert to dict
    records = []
    for _, row in df_clean.iterrows():
        row_dict = {}
        for col, val in row.items():
            if pd.isna(val):
                row_dict[str(col)] = None
            elif isinstance(val, (pd.Timestamp, datetime.date, datetime.datetime)):
                row_dict[str(col)] = str(val)
            elif isinstance(val, (int, float, bool, str)):
                # Check for float inf
                if isinstance(val, float) and (val == float('inf') or val == float('-inf')):
                    row_dict[str(col)] = None
                else:
                    row_dict[str(col)] = val
            else:
                row_dict[str(col)] = str(val)
        records.append(row_dict)
    return records

def load_all_metadata() -> List[DatasetMetadata]:
    if not os.path.exists(METADATA_FILE):
        return []
    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [DatasetMetadata(**item) for item in data]
    except Exception:
        return []

def save_all_metadata(metadata_list: List[DatasetMetadata]) -> None:
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump([item.model_dump() for item in metadata_list], f, indent=2)

def read_file_as_dataframe(file_path: str, ext: str) -> pd.DataFrame:
    """Reads a supported file format into a Pandas DataFrame with safe defaults."""
    if ext == ".csv":
        # Try utf-8 first, fallback to latin-1
        try:
            return pd.read_csv(file_path, low_memory=False)
        except UnicodeDecodeError:
            return pd.read_csv(file_path, encoding="latin-1", low_memory=False)
    elif ext == ".xlsx":
        return pd.read_excel(file_path, engine="openpyxl")
    elif ext == ".xls":
        return pd.read_excel(file_path, engine="xlrd")
    elif ext == ".json":
        try:
            # Try orient="records"
            return pd.read_json(file_path)
        except ValueError:
            with open(file_path, "r", encoding="utf-8") as f:
                content = json.load(f)
            if isinstance(content, list):
                return pd.DataFrame(content)
            elif isinstance(content, dict):
                # Try finding list inside dict
                for val in content.values():
                    if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                        return pd.DataFrame(val)
                return pd.DataFrame([content])
            raise ValueError("Unsupported JSON layout. Must be a list of records or key-value object.")
    else:
        raise ValueError(f"Unsupported file format: {ext}")

def save_and_process_dataset(
    original_filename: str,
    content_bytes: bytes,
    custom_name: Optional[str] = None,
    custom_description: Optional[str] = None
) -> DatasetMetadata:
    ext = get_file_extension(original_filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension '{ext}'. Allowed extensions are: {', '.join(ALLOWED_EXTENSIONS.keys())}")

    size_bytes = len(content_bytes)
    if size_bytes == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")
    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size ({format_file_size(size_bytes)}) exceeds maximum limit of 50 MB.")

    dataset_id = f"ds-{uuid.uuid4().hex[:10]}"
    safe_name = sanitize_filename(original_filename)
    stored_filename = f"{dataset_id}_{safe_name}"
    stored_path = os.path.join(UPLOADS_DIR, stored_filename)

    # Save physical file to disk
    with open(stored_path, "wb") as f:
        f.write(content_bytes)

    # Parse file using Pandas
    try:
        df = read_file_as_dataframe(stored_path, ext)
    except Exception as e:
        # Clean up saved file if parsing fails
        if os.path.exists(stored_path):
            os.remove(stored_path)
        raise ValueError(f"Failed to read and parse file with Pandas: {str(e)}")

    if df.empty and len(df.columns) == 0:
        if os.path.exists(stored_path):
            os.remove(stored_path)
        raise ValueError("The uploaded dataset contains no columns or data.")

    # Generate schema
    schema: List[ColumnSchema] = []
    for col in df.columns:
        col_str = str(col)
        col_dtype = df[col].dtype
        standard_type = map_pandas_dtype_to_standard(col_dtype)
        is_nullable = bool(df[col].isna().any())
        unique_count = int(df[col].nunique(dropna=True))
        schema.append(ColumnSchema(
            name=col_str,
            type=standard_type,
            nullable=is_nullable,
            unique_count=unique_count
        ))

    # Infer health score based on completeness
    total_cells = df.size
    null_cells = df.isna().sum().sum()
    completeness_ratio = (total_cells - null_cells) / total_cells if total_cells > 0 else 1.0
    health_score = max(50, min(100, int(completeness_ratio * 100)))

    format_label = ALLOWED_EXTENSIONS[ext]
    dataset_name = custom_name.strip() if custom_name and custom_name.strip() else original_filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
    now_str = datetime.datetime.now().strftime("%b %d, %Y · %I:%M %p")

    metadata = DatasetMetadata(
        id=dataset_id,
        name=dataset_name,
        description=custom_description.strip() if custom_description else f"Ingested from {original_filename} ({format_label}).",
        filename=original_filename,
        format=format_label,
        rows=int(len(df)),
        columns=int(len(df.columns)),
        size_bytes=size_bytes,
        size=format_file_size(size_bytes),
        uploaded_at=now_str,
        health_score=health_score,
        tags=[format_label, "Production"],
        schema_def=schema,
        file_path=stored_path
    )

    # Persist metadata
    all_datasets = load_all_metadata()
    all_datasets.insert(0, metadata)
    save_all_metadata(all_datasets)

    return metadata

def get_dataset_preview(dataset_id: str, page: int = 1, page_size: int = 10) -> DatasetPreviewResponse:
    all_datasets = load_all_metadata()
    meta = next((d for d in all_datasets if d.id == dataset_id), None)
    if not meta:
        raise KeyError(f"Dataset with ID '{dataset_id}' not found.")

    if not os.path.exists(meta.file_path):
        raise FileNotFoundError(f"Underlying dataset file for '{meta.name}' does not exist on disk.")

    ext = get_file_extension(meta.file_path)
    df = read_file_as_dataframe(meta.file_path, ext)

    total_rows = len(df)
    total_columns = len(df.columns)
    page_size = max(1, min(page_size, 100))  # Max 100 rows per preview page
    total_pages = max(1, (total_rows + page_size - 1) // page_size)
    page = max(1, min(page, total_pages))

    start_idx = (page - 1) * page_size
    end_idx = min(start_idx + page_size, total_rows)

    sliced_df = df.iloc[start_idx:end_idx]
    clean_rows = clean_dataframe_for_json(sliced_df)

    column_types = {col.name: col.type for col in meta.schema_def}

    return DatasetPreviewResponse(
        dataset_id=meta.id,
        name=meta.name,
        total_rows=total_rows,
        total_columns=total_columns,
        columns=[str(c) for c in df.columns],
        column_types=column_types,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        rows=clean_rows
    )

def rename_dataset(dataset_id: str, new_name: str, new_description: Optional[str] = None) -> DatasetMetadata:
    all_datasets = load_all_metadata()
    found = False
    updated_meta = None
    for d in all_datasets:
        if d.id == dataset_id:
            d.name = new_name.strip()
            if new_description is not None:
                d.description = new_description.strip()
            updated_meta = d
            found = True
            break
    if not found or not updated_meta:
        raise KeyError(f"Dataset with ID '{dataset_id}' not found.")

    save_all_metadata(all_datasets)
    return updated_meta

def delete_dataset(dataset_id: str) -> bool:
    all_datasets = load_all_metadata()
    target = next((d for d in all_datasets if d.id == dataset_id), None)
    if not target:
        raise KeyError(f"Dataset with ID '{dataset_id}' not found.")

    # Remove physical file
    if os.path.exists(target.file_path):
        try:
            os.remove(target.file_path)
        except Exception:
            pass

    # Remove metadata
    remaining = [d for d in all_datasets if d.id != dataset_id]
    save_all_metadata(remaining)
    return True
