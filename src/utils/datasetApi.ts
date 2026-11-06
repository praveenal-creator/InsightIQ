
import { Dataset } from '../types';
import { supabase } from '../lib/supabase';

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
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error('Could not retrieve your login session.');
  }

  if (!data.session?.access_token) {
    throw new Error('Please sign in again to continue.');
  }

  return {
    Authorization: `Bearer ${data.session.access_token}`
  };
}

function mapDataset(d: any): Dataset {
  return {
    id: d.id,
    name: d.name,
    description: d.description || '',
    format: d.format as Dataset['format'],
    rows: d.rows ?? 0,
    columns: d.columns ?? 0,
    size: d.size || '',
    updatedAt: d.uploaded_at || '',
    healthScore: d.health_score ?? null,
    tags: d.tags || [],
    schema: (d.schema || d.schema_def || []).map((col: any) => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      uniqueCount: col.unique_count ?? 0
    })),
    sampleData: []
  };
}

export function validateDatasetFile(
  file: File
): { valid: boolean; error?: string } {
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

  const authHeaders = await getAuthHeaders();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);

    if (customName?.trim()) {
      formData.append('name', customName.trim());
    }

    if (customDescription?.trim()) {
      formData.append('description', customDescription.trim());
    }

    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.open('POST', '/api/datasets/upload');
    xhr.setRequestHeader('Authorization', authHeaders.Authorization);

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText || '{}');

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(mapDataset(response));
        } else {
          reject(new Error(
            response.detail ||
            response.message ||
            `Upload failed with HTTP ${xhr.status}`
          ));
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

export async function listDatasetsFromApi(
  search?: string
): Promise<Dataset[]> {
  const url = search?.trim()
    ? `/api/datasets?search=${encodeURIComponent(search.trim())}`
    : '/api/datasets';

  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to fetch datasets (${res.status})`);
  }

  const data = await res.json();
  return data.map(mapDataset);
}

export async function fetchDatasetPreview(
  datasetId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<DatasetPreviewData> {
  const headers = await getAuthHeaders();

  const res = await fetch(
    `/api/datasets/${encodeURIComponent(datasetId)}/preview?page=${page}&page_size=${pageSize}`,
    { headers }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to load preview (${res.status})`);
  }

  return await res.json();
}

export async function renameDatasetApi(
  datasetId: string,
  newName: string,
  newDescription?: string
): Promise<Dataset> {
  const authHeaders = await getAuthHeaders();

  const res = await fetch(
    `/api/datasets/${encodeURIComponent(datasetId)}/rename`,
    {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newName,
        description: newDescription
      })
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to rename dataset (${res.status})`);
  }

  return mapDataset(await res.json());
}

export async function deleteDatasetApi(
  datasetId: string
): Promise<boolean> {
  const headers = await getAuthHeaders();

  const res = await fetch(
    `/api/datasets/${encodeURIComponent(datasetId)}`,
    {
      method: 'DELETE',
      headers
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Failed to delete dataset (${res.status})`);
  }

  return true;
}
