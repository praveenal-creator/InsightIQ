import { Dataset } from '../types';

export interface DatasetPreviewData {
  dataset_id: string;
  name: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  column_types: Record<string, string>;
  page: number;
  page_size: number;
  total_pages: number;
  rows: Record<string, any>[];
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json'];
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export function validateDatasetFile(file: File): { valid: boolean; error?: string } {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file extension. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}.`
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum limit of 50 MB.`
    };
  }
  return { valid: true };
}

/**
 * Upload dataset to real FastAPI endpoint with upload progress callback.
 */
export async function uploadDatasetFile(
  file: File,
  customName?: string,
  customDescription?: string,
  onProgress?: (percent: number) => void
): Promise<Dataset> {
  const validation = validateDatasetFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    if (customName && customName.trim()) {
      formData.append('name', customName.trim());
    }
    if (customDescription && customDescription.trim()) {
      formData.append('description', customDescription.trim());
    }

    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.open('POST', '/api/datasets/upload');

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300) {
          // Adapt backend metadata to frontend Dataset interface
          const dataset: Dataset = {
            id: response.id,
            name: response.name,
            description: response.description,
            format: response.format,
            rows: response.rows,
            columns: response.columns,
            size: response.size,
            updatedAt: response.uploaded_at || 'Just now',
            healthScore: response.health_score || 98,
            tags: response.tags || [response.format, 'Production'],
            isDemo: false,
            schema: (response.schema || response.schema_def || []).map((col: any) => ({
              name: col.name,
              type: col.type,
              nullable: col.nullable,
              uniqueCount: col.unique_count || 0
            })),
            sampleData: []
          };
          resolve(dataset);
        } else {
          const errMsg = response.detail || response.message || `Upload failed with HTTP ${xhr.status}`;
          reject(new Error(errMsg));
        }
      } catch (err: any) {
        reject(new Error(`Failed to parse server response: ${err.message}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload. Check backend connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * List all uploaded datasets from FastAPI backend.
 */
export async function listDatasetsFromApi(search?: string): Promise<Dataset[]> {
  const url = search ? `/api/datasets?search=${encodeURIComponent(search)}` : '/api/datasets';
  const res = await fetch(url);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to fetch datasets (${res.status})`);
  }
  const data = await res.json();
  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    format: d.format,
    rows: d.rows,
    columns: d.columns,
    size: d.size,
    updatedAt: d.uploaded_at || 'Recently',
    healthScore: d.health_score || 98,
    tags: d.tags || [d.format, 'Production'],
    isDemo: false,
    schema: (d.schema || d.schema_def || []).map((col: any) => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      uniqueCount: col.unique_count || 0
    })),
    sampleData: []
  }));
}

/**
 * Fetch paginated preview from FastAPI backend.
 */
export async function fetchDatasetPreview(
  datasetId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<DatasetPreviewData> {
  const res = await fetch(`/api/datasets/${datasetId}/preview?page=${page}&page_size=${pageSize}`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to load preview (${res.status})`);
  }
  return await res.json();
}

/**
 * Rename a dataset in FastAPI backend.
 */
export async function renameDatasetApi(
  datasetId: string,
  newName: string,
  newDescription?: string
): Promise<Dataset> {
  const res = await fetch(`/api/datasets/${datasetId}/rename`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName, description: newDescription })
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to rename dataset (${res.status})`);
  }
  const d = await res.json();
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    format: d.format,
    rows: d.rows,
    columns: d.columns,
    size: d.size,
    updatedAt: d.uploaded_at || 'Just now',
    healthScore: d.health_score || 98,
    tags: d.tags || [d.format, 'Production'],
    isDemo: false,
    schema: (d.schema || d.schema_def || []).map((col: any) => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      uniqueCount: col.unique_count || 0
    })),
    sampleData: []
  };
}

/**
 * Delete dataset from FastAPI backend and disk.
 */
export async function deleteDatasetApi(datasetId: string): Promise<boolean> {
  const res = await fetch(`/api/datasets/${datasetId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to delete dataset (${res.status})`);
  }
  return true;
}
