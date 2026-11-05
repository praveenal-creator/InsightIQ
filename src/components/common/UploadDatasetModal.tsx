import React, { useState } from 'react';
import { Upload, Database, FileText, Check, AlertCircle, Plus, FileSpreadsheet } from 'lucide-react';
import { Modal } from './Modal';
import { Dataset } from '../../types';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDataset: (newDataset: Dataset) => void;
}

export const UploadDatasetModal: React.FC<UploadDatasetModalProps> = ({
  isOpen,
  onClose,
  onAddDataset
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<Dataset['format']>('CSV');
  const [isUploading, setIsUploading] = useState(false);

  const sampleTemplates = [
    {
      name: 'AdTech Real-Time Bidding Logs',
      desc: 'Auction latency, floor price clearance, and win rate telemetry across programmatic DSP exchanges.',
      format: 'Parquet' as const,
      rows: 890400,
      columns: 6,
      size: '74.2 MB'
    },
    {
      name: 'Healthcare Clinic Patient Triage',
      desc: 'Inpatient admission velocity, emergency room wait times, and readmission risk indicators.',
      format: 'CSV' as const,
      rows: 52100,
      columns: 5,
      size: '8.4 MB'
    }
  ];

  const handleSelectTemplate = (tpl: typeof sampleTemplates[0]) => {
    setName(tpl.name);
    setDescription(tpl.desc);
    setFormat(tpl.format);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const newDs: Dataset = {
        id: `ds-${Date.now()}`,
        name: name.trim(),
        description: description.trim() || 'Synthetic enterprise dataset uploaded via ingestion workbench.',
        format,
        rows: Math.floor(Math.random() * 200000) + 25000,
        columns: 6,
        size: `${(Math.random() * 40 + 5).toFixed(1)} MB`,
        updatedAt: 'Just now',
        healthScore: Math.floor(Math.random() * 10) + 90,
        tags: ['New', 'Uploaded', format],
        schema: [
          { name: 'record_id', type: 'VARCHAR', nullable: false, uniqueCount: 50000 },
          { name: 'segment_type', type: 'VARCHAR', nullable: false, uniqueCount: 4 },
          { name: 'metric_value', type: 'DECIMAL', nullable: false, uniqueCount: 1200 },
          { name: 'score_coefficient', type: 'FLOAT', nullable: true, uniqueCount: 300 },
          { name: 'status_code', type: 'INTEGER', nullable: false, uniqueCount: 5 },
          { name: 'sync_timestamp', type: 'TIMESTAMP', nullable: false, uniqueCount: 50000 }
        ],
        sampleData: [
          { record_id: 'REC-101', segment_type: 'Alpha', metric_value: 1420.50, score_coefficient: 0.88, status_code: 200, sync_timestamp: '2026-11-05 04:30:00' },
          { record_id: 'REC-102', segment_type: 'Beta', metric_value: 950.00, score_coefficient: 0.42, status_code: 200, sync_timestamp: '2026-11-05 04:31:00' },
          { record_id: 'REC-103', segment_type: 'Gamma', metric_value: 3800.75, score_coefficient: 0.95, status_code: 200, sync_timestamp: '2026-11-05 04:32:00' }
        ]
      };

      onAddDataset(newDs);
      setIsUploading(false);
      setName('');
      setDescription('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect & Ingest New Dataset"
      description="Upload local files or connect cloud data lake endpoints (CSV, Parquet, Snowflake, BigQuery, JSON)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Preset quick templates */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick-Fill Demonstration Templates:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleTemplates.map((tpl, i) => (
              <button
                type="button"
                key={i}
                onClick={() => handleSelectTemplate(tpl)}
                className="p-2.5 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-slate-800 hover:border-cyan-800/80 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-200">{tpl.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{tpl.format} · {tpl.rows.toLocaleString()} rows</div>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">Dataset Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Supply Chain Routing Logs"
            className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Format & Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Source Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as Dataset['format'])}
              className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="CSV">CSV Delimited (.csv)</option>
              <option value="Parquet">Apache Parquet (.parquet)</option>
              <option value="Snowflake">Snowflake Database</option>
              <option value="BigQuery">Google BigQuery Table</option>
              <option value="JSON">JSON Records (.json)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Auto-Clean Pipeline</label>
            <input
              type="text"
              readOnly
              value="Standard Imputation + Deduplication"
              className="w-full bg-[#080C16] border border-slate-800 rounded-lg px-3 py-2 text-slate-400"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-slate-300 mb-1">Description / Business Context</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key metrics, grain of the table, schema version..."
            className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Drag and Drop Box */}
        <div className="p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl bg-[#080D1A] text-center transition-colors">
          <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-slate-300 font-medium">Drag and drop file here, or click to simulate ingestion</p>
          <p className="text-[11px] text-slate-500 mt-1">Supports up to 2GB per file · Automated columnar schema inference</p>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || !name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Ingesting Table...' : 'Confirm Ingestion'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
