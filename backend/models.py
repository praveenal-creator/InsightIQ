from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict

class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool = True
    unique_count: int = 0

class DatasetMetadata(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    description: str = ""
    filename: str
    format: str  # CSV, XLSX, XLS, JSON
    rows: int
    columns: int
    size_bytes: int
    size: str
    uploaded_at: str
    health_score: int = 98
    tags: List[str] = Field(default_factory=list)
    schema_def: List[ColumnSchema] = Field(default_factory=list, alias="schema")
    file_path: str

class RenameDatasetRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=500)

class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    name: str
    total_rows: int
    total_columns: int
    columns: List[str]
    column_types: Dict[str, str]
    page: int
    page_size: int
    total_pages: int
    rows: List[Dict[str, Any]]
