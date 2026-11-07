
from typing import List, Optional

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    Query,
    status,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    DatasetMetadata,
    RenameDatasetRequest,
    DatasetPreviewResponse,
)
from backend.auth import get_current_user
from backend import supabase_storage, storage


app = FastAPI(
    title="InsightIQ Dataset API",
    description="Authenticated dataset upload, storage, and exploration API.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://insightiq.praveenaloganathan58.workers.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "InsightIQ Dataset API",
        "supported_formats": list(storage.ALLOWED_EXTENSIONS.values()),
    }


@app.post(
    "/api/datasets/upload",
    response_model=DatasetMetadata,
    status_code=status.HTTP_201_CREATED,
)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing.",
        )

    extension = storage.get_file_extension(file.filename)

    if extension not in storage.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format.",
        )

    content = await file.read()
    await file.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(content) > storage.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 50 MB limit.",
        )

    try:
        result = await supabase_storage.upload_dataset(
            filename=file.filename,
            content=content,
            user_id=user["id"],
            access_token=user["_access_token"],
            custom_name=name,
            description=description,
        )
        return result

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Dataset upload failed. Please try again.",
        )


@app.get(
    "/api/datasets",
    response_model=List[DatasetMetadata],
)
async def list_datasets(
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    try:
        datasets = await supabase_storage.list_datasets(
            user_id=user["id"],
            access_token=user["_access_token"],
        )

        if search and search.strip():
            query = search.strip().lower()
            datasets = [
                dataset
                for dataset in datasets
                if query in dataset["name"].lower()
                or query in dataset["description"].lower()
                or any(
                    query in tag.lower()
                    for tag in dataset["tags"]
                )
            ]

        return datasets

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not load datasets.",
        )


@app.get(
    "/api/datasets/{dataset_id}",
    response_model=DatasetMetadata,
)
async def get_dataset_details(
    dataset_id: str,
    user: dict = Depends(get_current_user),
):
    try:
        record = await supabase_storage.get_dataset(
            dataset_id=dataset_id,
            user_id=user["id"],
            access_token=user["_access_token"],
        )

        return supabase_storage._dataset_from_record(record)

    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve dataset.",
        )


@app.get(
    "/api/datasets/{dataset_id}/preview",
    response_model=DatasetPreviewResponse,
)
async def preview_dataset(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    try:
        return await supabase_storage.preview_dataset(
            dataset_id=dataset_id,
            user_id=user["id"],
            access_token=user["_access_token"],
            page=page,
            page_size=page_size,
        )

    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not load dataset preview.",
        )


@app.patch(
    "/api/datasets/{dataset_id}/rename",
    response_model=DatasetMetadata,
)
async def rename_dataset_endpoint(
    dataset_id: str,
    payload: RenameDatasetRequest,
    user: dict = Depends(get_current_user),
):
    try:
        return await supabase_storage.rename_dataset(
            dataset_id=dataset_id,
            user_id=user["id"],
            access_token=user["_access_token"],
            new_name=payload.name,
            new_description=payload.description,
        )

    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not rename dataset.",
        )


@app.delete("/api/datasets/{dataset_id}")
async def delete_dataset_endpoint(
    dataset_id: str,
    user: dict = Depends(get_current_user),
):
    try:
        await supabase_storage.delete_dataset(
            dataset_id=dataset_id,
            user_id=user["id"],
            access_token=user["_access_token"],
        )

        return {
            "success": True,
            "message": "Dataset deleted successfully.",
        }

    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not delete dataset.",
        )
