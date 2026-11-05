from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.models import (
    DatasetMetadata,
    RenameDatasetRequest,
    DatasetPreviewResponse
)
from backend import storage

app = FastAPI(
    title="InsightIQ Dataset API",
    description="Enterprise dataset upload, pandas parsing, schema inference, and exploration engine.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InsightIQ Dataset API",
        "supported_formats": list(storage.ALLOWED_EXTENSIONS.values())
    }

@app.post(
    "/api/datasets/upload",
    response_model=DatasetMetadata,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest a new dataset"
)
async def upload_dataset(
    file: UploadFile = File(..., description="The dataset file (.csv, .xlsx, .xls, .json)"),
    name: Optional[str] = Form(None, description="Custom dataset name"),
    description: Optional[str] = Form(None, description="Custom dataset description")
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing from upload."
        )

    # Validate extension
    ext = storage.get_file_extension(file.filename)
    if ext not in storage.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions are: {', '.join(storage.ALLOWED_EXTENSIONS.keys())}."
        )

    # Validate MIME type if provided and not generic
    if file.content_type and file.content_type.lower() not in storage.ALLOWED_MIME_TYPES:
        # Don't strictly reject if extension is valid, but verify readability
        pass

    try:
        content_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file stream: {str(e)}"
        )

    if len(content_bytes) > storage.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowable size of 50 MB ({storage.format_file_size(len(content_bytes))} uploaded)."
        )

    try:
        metadata = storage.save_and_process_dataset(
            original_filename=file.filename,
            content_bytes=content_bytes,
            custom_name=name,
            custom_description=description
        )
        return metadata
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during dataset processing: {str(e)}"
        )

@app.get(
    "/api/datasets",
    response_model=List[DatasetMetadata],
    summary="List all uploaded datasets"
)
def list_datasets(search: Optional[str] = None):
    all_datasets = storage.load_all_metadata()
    if search and search.strip():
        q = search.strip().lower()
        all_datasets = [
            d for d in all_datasets 
            if q in d.name.lower() or q in d.description.lower() or any(q in t.lower() for t in d.tags)
        ]
    return all_datasets

@app.get(
    "/api/datasets/{dataset_id}",
    response_model=DatasetMetadata,
    summary="Get single dataset metadata and schema"
)
def get_dataset_details(dataset_id: str):
    all_datasets = storage.load_all_metadata()
    target = next((d for d in all_datasets if d.id == dataset_id), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' was not found."
        )
    return target

@app.get(
    "/api/datasets/{dataset_id}/preview",
    response_model=DatasetPreviewResponse,
    summary="Preview dataset rows, schema, and statistics with pagination"
)
def preview_dataset(
    dataset_id: str,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of rows per page (max 100)")
):
    try:
        preview = storage.get_dataset_preview(dataset_id=dataset_id, page=page, page_size=page_size)
        return preview
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' was not found."
        )
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(fnf)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load preview: {str(e)}"
        )

@app.patch(
    "/api/datasets/{dataset_id}/rename",
    response_model=DatasetMetadata,
    summary="Rename a dataset"
)
def rename_dataset_endpoint(dataset_id: str, payload: RenameDatasetRequest):
    try:
        updated = storage.rename_dataset(
            dataset_id=dataset_id,
            new_name=payload.name,
            new_description=payload.description
        )
        return updated
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' was not found."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rename dataset: {str(e)}"
        )

@app.delete(
    "/api/datasets/{dataset_id}",
    summary="Delete a dataset and its underlying file"
)
def delete_dataset_endpoint(dataset_id: str):
    try:
        storage.delete_dataset(dataset_id)
        return {"success": True, "message": f"Dataset '{dataset_id}' deleted successfully."}
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' was not found."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dataset: {str(e)}"
        )
