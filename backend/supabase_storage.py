import io
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx
import pandas as pd
from dotenv import load_dotenv

from backend.storage import (
    get_file_extension,
    format_file_size,
    sanitize_filename,
    map_pandas_dtype_to_standard,
    clean_dataframe_for_json,
)

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
BUCKET = "insightiq-datasets"


def _headers(access_token: str) -> dict:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError("Supabase is not configured.")

    return {
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": f"Bearer {access_token}",
    }


def _parse_dataframe(content: bytes, extension: str) -> pd.DataFrame:
    buffer = io.BytesIO(content)

    if extension == ".csv":
        try:
            return pd.read_csv(buffer, low_memory=False)
        except UnicodeDecodeError:
            buffer.seek(0)
            return pd.read_csv(buffer, encoding="latin1", low_memory=False)

    if extension == ".xlsx":
        return pd.read_excel(buffer, engine="openpyxl")

    if extension == ".xls":
        return pd.read_excel(buffer, engine="xlrd")

    if extension == ".json":
        return pd.DataFrame(json.loads(content.decode("utf-8")))

    raise ValueError("Unsupported file format.")


def _dataset_from_record(record: dict) -> dict:
    return {
        "id": record["id"],
        "name": record["name"],
        "description": record.get("description") or "",
        "filename": record["filename"],
        "format": record["format"],
        "rows": record.get("row_count", 0),
        "columns": record.get("column_count", 0),
        "size_bytes": record.get("size_bytes", 0),
        "size": record.get("size", ""),
        "uploaded_at": record["uploaded_at"],
        "health_score": record.get("health_score"),
        "tags": record.get("tags") or [],
        "schema": record.get("schema") or [],
    }


async def upload_dataset(
    filename: str,
    content: bytes,
    user_id: str,
    access_token: str,
    custom_name: str | None = None,
    description: str | None = None,
) -> dict:
    extension = get_file_extension(filename)

    if extension not in {".csv", ".xlsx", ".xls", ".json"}:
        raise ValueError("Unsupported file format.")

    if not content:
        raise ValueError("Uploaded file is empty.")

    if len(content) > 50 * 1024 * 1024:
        raise ValueError("File exceeds the 50 MB limit.")

    dataframe = _parse_dataframe(content, extension)

    if dataframe.empty:
        raise ValueError("Dataset contains no rows.")

    dataset_id = f"ds-{uuid.uuid4().hex[:12]}"
    safe_filename = sanitize_filename(filename)
    storage_path = f"{user_id}/{dataset_id}/{safe_filename}"

    schema = []
    for column in dataframe.columns:
        series = dataframe[column]
        schema.append({
            "name": str(column),
            "type": map_pandas_dtype_to_standard(series.dtype),
            "nullable": bool(series.isnull().any()),
            "unique_count": int(series.nunique()),
        })

    health_score = round(
        100 * (1 - dataframe.isnull().sum().sum() /
        max(1, dataframe.size))
    )

    now = datetime.now(timezone.utc).isoformat()
    format_label = extension.lstrip(".").upper()

    headers = _headers(access_token)

    async with httpx.AsyncClient(timeout=60.0) as client:
        upload_response = await client.post(
            f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}",
            headers={
                **headers,
                "Content-Type": "application/octet-stream",
                "x-upsert": "false",
            },
            content=content,
        )

        if upload_response.status_code not in (200, 201):
            raise RuntimeError("Dataset file upload failed.")

        record = {
            "id": dataset_id,
            "owner_id": user_id,
            "name": custom_name or filename,
            "description": description or "",
            "filename": safe_filename,
            "format": format_label,
            "row_count": len(dataframe),
            "column_count": len(dataframe.columns),
            "size_bytes": len(content),
            "size": format_file_size(len(content)),
            "uploaded_at": now,
            "health_score": health_score,
            "tags": [format_label],
            "schema": schema,
            "storage_path": storage_path,
        }

        db_response = await client.post(
            f"{SUPABASE_URL}/rest/v1/insightiq_datasets",
            headers={
                **headers,
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=record,
        )

        if db_response.status_code not in (200, 201):
            await client.delete(
                f"{SUPABASE_URL}/storage/v1/object/{BUCKET}",
                headers={
                    **headers,
                    "Content-Type": "application/json",
                },
                json={"prefixes": [storage_path]},
            )
            raise RuntimeError("Dataset metadata could not be saved.")

    return _dataset_from_record(db_response.json()[0])


async def list_datasets(user_id: str, access_token: str) -> list:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/insightiq_datasets",
            headers=_headers(access_token),
            params={
                "select": "*",
                "owner_id": f"eq.{user_id}",
                "order": "created_at.desc",
            },
        )

    if response.status_code != 200:
        raise RuntimeError("Could not load datasets.")

    return [_dataset_from_record(item) for item in response.json()]


async def get_dataset(
    dataset_id: str,
    user_id: str,
    access_token: str,
) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/insightiq_datasets",
            headers=_headers(access_token),
            params={
                "select": "*",
                "id": f"eq.{dataset_id}",
                "owner_id": f"eq.{user_id}",
            },
        )

    if response.status_code != 200:
        raise RuntimeError("Could not retrieve dataset.")

    records = response.json()
    if not records:
        raise KeyError("Dataset not found.")

    return records[0]


async def preview_dataset(
    dataset_id: str,
    user_id: str,
    access_token: str,
    page: int = 1,
    page_size: int = 10,
) -> dict:
    if page < 1 or page_size < 1 or page_size > 100:
        raise ValueError("Invalid pagination values.")

    record = await get_dataset(dataset_id, user_id, access_token)
    storage_path = record["storage_path"]

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(
            f"{SUPABASE_URL}/storage/v1/object/authenticated/{BUCKET}/{storage_path}",
            headers=_headers(access_token),
        )

    if response.status_code != 200:
        raise RuntimeError("Could not download dataset for preview.")

    extension = get_file_extension(record["filename"])
    dataframe = _parse_dataframe(response.content, extension)

    total_rows = len(dataframe)
    total_pages = max(1, (total_rows + page_size - 1) // page_size)
    start = (page - 1) * page_size
    preview = dataframe.iloc[start:start + page_size]

    return {
        "dataset_id": dataset_id,
        "name": record["name"],
        "total_rows": total_rows,
        "total_columns": len(dataframe.columns),
        "columns": [str(column) for column in dataframe.columns],
        "column_types": {
            str(column): map_pandas_dtype_to_standard(dataframe[column].dtype)
            for column in dataframe.columns
        },
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "rows": clean_dataframe_for_json(preview),
    }


async def rename_dataset(
    dataset_id: str,
    user_id: str,
    access_token: str,
    new_name: str,
    new_description: str | None = None,
) -> dict:
    headers = {
        **_headers(access_token),
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload: dict[str, Any] = {"name": new_name}
    if new_description is not None:
        payload["description"] = new_description

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/insightiq_datasets",
            headers=headers,
            params={
                "id": f"eq.{dataset_id}",
                "owner_id": f"eq.{user_id}",
            },
            json=payload,
        )

    if response.status_code not in (200, 204):
        raise RuntimeError("Could not rename dataset.")

    records = response.json()
    if not records:
        raise KeyError("Dataset not found.")

    return _dataset_from_record(records[0])


async def delete_dataset(
    dataset_id: str,
    user_id: str,
    access_token: str,
) -> None:
    record = await get_dataset(dataset_id, user_id, access_token)
    headers = _headers(access_token)

    async with httpx.AsyncClient(timeout=60.0) as client:
        storage_response = await client.delete(
            f"{SUPABASE_URL}/storage/v1/object/{BUCKET}",
            headers={
                **headers,
                "Content-Type": "application/json",
            },
            json={"prefixes": [record["storage_path"]]},
        )

        if storage_response.status_code not in (200, 204):
            raise RuntimeError("Could not delete dataset file.")

        db_response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/insightiq_datasets",
            headers=headers,
            params={
                "id": f"eq.{dataset_id}",
                "owner_id": f"eq.{user_id}",
            },
        )

    if db_response.status_code not in (200, 204):
        raise RuntimeError("File deleted, but dataset metadata could not be deleted.")