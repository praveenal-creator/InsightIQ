import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  FileText, 
  X, 
  Loader2, 
  Layers, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Modal } from './Modal';
import { Dataset } from '../../types';
import { 
  uploadDatasetFile, 
  validateDatasetFile, 
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES
} from '../../utils/datasetApi';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDataset: (newDataset: Dataset) => void;
  isDemoMode?: boolean;
}

export const UploadDatasetModal: React.FC<UploadDatasetModalProps> = ({
  isOpen,
  onClose,
  onAddDataset,
  isDemoMode = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadSuccessMeta, setUploadSuccessMeta] = useState<Dataset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setName('');
    setDescription('');
    setIsDragging(false);
    setIsUploading(false);
    setUploadProgress(0);
    setValidationError(null);
    setUploadSuccessMeta(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    resetForm();
    onClose();
  };

  const processFileSelection = (file: File) => {
    setValidationError(null);
    setUploadSuccessMeta(null);

    const validation = validateDatasetFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file format or size.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!name.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFileSelection(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select or drop a valid file (.csv, .xlsx, .xls, .json).');
      return;
    }

    setIsUploading(true);
    setValidationError(null);
    setUploadProgress(10);

    try {
      const createdDataset = await uploadDatasetFile(
        selectedFile,
        name.trim() || undefined,
        description.trim() || undefined,
        (percent) => {
          setUploadProgress(percent);
        }
      );

      setUploadSuccessMeta(createdDataset);
      onAddDataset(createdDataset);
      setUploadProgress(100);

      // Auto close after brief success confirmation
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setValidationError(err.message || 'File upload failed. Ensure the server is reachable.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload & Ingest Dataset (Module 2)"
      description="Connect real tabular files via FastAPI & Pandas parser. Supports CSV, Excel (XLSX, XLS), and JSON."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Drag and Drop Zone */}
        <div>
          <label className="block font-medium text-slate-300 mb-1.5">
            Select Data File <span className="text-cyan-400">(.csv, .xlsx, .xls, .json)</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer group ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30'
                : selectedFile
                ? 'border-emerald-500/70 bg-emerald-950/10'
                : 'border-slate-700 hover:border-cyan-400/80 bg-[#080D1A]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-100 text-sm">
                  {selectedFile.name}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {(selectedFile.size / (1024 * 1024) >= 1)
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(selectedFile.size / 1024).toFixed(1)} KB`} · Ready for Pandas parsing
                </div>
                <span className="text-[10px] text-cyan-400 hover:text-cyan-300 underline mt-2">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 mb-2 transition-transform" />
                <p className="text-slate-200 font-medium text-sm">
                  Drag and drop your dataset file here, or <span className="text-cyan-400 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: CSV, XLSX, XLS, JSON (Max limit: 50 MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-200">Validation Error</span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-lg bg-[#090E1A] border border-cyan-900/60">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Uploading & Parsing with Pandas...</span>
              </span>
              <span className="font-mono text-cyan-400 font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Success Indicator */}
        {uploadSuccessMeta && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">{uploadSuccessMeta.name} indexed successfully!</span>
            </div>
            <span className="font-mono text-[11px]">
              {uploadSuccessMeta.rows.toLocaleString()} rows · {uploadSuccessMeta.columns} columns
            </span>
          </div>
        )}

        {/* Dataset Name */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Dataset Name <span className="text-slate-500">(Optional override)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isUploading}
            placeholder="e.g. Q4 Regional Transaction Ledger"
            className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">
            Description <span className="text-slate-500">(Optional context)</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            placeholder="Briefly describe the dataset contents, business domain, or grain..."
            className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="flex items-center gap-1.5 px-4 py-2 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Stream...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to InsightIQ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
