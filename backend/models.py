from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices


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
    format: str

    rows: int = Field(
        validation_alias=AliasChoices("rows", "row_count")
    )
    columns: int = Field(
        validation_alias=AliasChoices("columns", "column_count")
    )

    size_bytes: int
    size: str
    uploaded_at: str
    health_score: Optional[int] = None

    tags: List[str] = Field(default_factory=list)
    schema_def: List[ColumnSchema] = Field(
        default_factory=list,
        validation_alias=AliasChoices("schema_def", "schema")
    )

    # Internal legacy field; never expose it in API responses.
    file_path: Optional[str] = Field(default=None, exclude=True)


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
