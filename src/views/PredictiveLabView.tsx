
import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  BarChart2,
  Database,
  Plus,
  AlertCircle,
  ShieldCheck,
  Info,
  ArrowRight
} from 'lucide-react';

import { PredictiveModel, Dataset, NavigationId } from '../types';
import { EmptyState } from '../components/common/EmptyState';

interface PredictiveLabViewProps {
  models: PredictiveModel[];
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  onSaveModel?: (newModel: PredictiveModel) => void;
  onOpenUploadModal?: () => void;
}

export const PredictiveLabView: React.FC<PredictiveLabViewProps> = ({
  models,
  datasets,
  onNavigate,
  onNotify,
  onOpenUploadModal
}) => {
  const [selectedModelId, setSelectedModelId] = useState(
    models[0]?.id || ''
  );

  const activeModel =
    models.find(model => model.id === selectedModelId) || models[0];

  const handleTrainingRequest = () => {
    onNotify(
      'Model Training Not Connected',
      'The machine learning training backend is not integrated yet. No model has been trained or fabricated.',
      'info'
    );
  };

  // Empty state
  if (!models || models.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Predictive Lab
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Machine learning model management and evaluation workspace.
          </p>
        </div>

        <EmptyState
          icon={Cpu}
          title="No saved predictive models"
          description={
            datasets.length > 0
              ? 'Your workspace contains datasets, but no trained predictive models are available yet. Connect a real machine learning training backend to create models.'
              : 'Upload a dataset before starting your machine learning workflow.'
          }
          actionLabel={
            datasets.length > 0 ? 'Explore Datasets' : 'Upload Dataset'
          }
          onAction={
            datasets.length > 0
              ? () => onNavigate('datasets')
              : onOpenUploadModal
          }
        />

        <div className="bg-[#0D1424] border border-amber-800/40 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-amber-300">
              Training integration pending
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Model training, validation metrics, confusion matrices and
              prediction inference will be enabled after connecting the
              Python machine learning backend. This workspace does not
              generate simulated training results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeModel) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">

        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Predictive Lab
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Saved model records and evaluation metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <select
            value={activeModel.id}
            onChange={e => setSelectedModelId(e.target.value)}
            className="px-3 py-2 bg-[#090E1A] border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none"
          >
            {models.map(model => (
              <option
                key={model.id}
                value={model.id}
                className="bg-[#0D1424]"
              >
                {model.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleTrainingRequest}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg cursor-not-allowed"
            title="Requires machine learning backend integration"
          >
            <Plus className="w-3.5 h-3.5" />
            Training unavailable
          </button>

        </div>
      </div>

      {/* Data provenance notice */}
      <div className="bg-[#0D1424] border border-amber-800/40 rounded-xl p-4 flex gap-3">

        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />

        <div>
          <h3 className="text-xs font-semibold text-amber-300">
            Evaluation metadata notice
          </h3>

          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            The following values are stored model metadata. This interface
            does not independently verify training provenance or reproduce
            model evaluation. Do not interpret these values as newly
            validated training results.
          </p>
        </div>

      </div>

      {/* Model information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Model Name
          </span>

          <p className="text-sm font-bold text-white mt-2 break-words">
            {activeModel.name}
          </p>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Algorithm
          </span>

          <p className="text-sm font-bold text-white mt-2 break-words">
            {activeModel.algorithm}
          </p>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Dataset Source
          </span>

          <p className="text-sm font-bold text-white mt-2">
            {activeModel.datasetName || 'Not specified'}
          </p>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Metric
          </span>

          <p className="text-sm font-bold text-white mt-2">
            {activeModel.targetMetric || 'Not specified'}
          </p>
        </div>

      </div>

      {/* Stored evaluation metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Recorded ROC-AUC
            </span>
          </div>

          <p className="text-2xl font-bold text-cyan-400 font-mono mt-3">
            {Number.isFinite(activeModel.rocAuc)
              ? activeModel.rocAuc.toFixed(3)
              : 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Recorded Accuracy
            </span>
          </div>

          <p className="text-2xl font-bold text-white font-mono mt-3">
            {Number.isFinite(activeModel.accuracy)
              ? `${activeModel.accuracy}%`
              : 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Recorded F1 Score
            </span>
          </div>

          <p className="text-2xl font-bold text-white font-mono mt-3">
            {Number.isFinite(activeModel.f1Score)
              ? activeModel.f1Score.toFixed(3)
              : 'N/A'}
          </p>
        </div>

      </div>

      {/* Feature metadata */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">

          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />

            <h3 className="text-sm font-semibold text-slate-100">
              Stored Feature Metadata
            </h3>
          </div>

          <span className="text-[10px] text-slate-500">
            {activeModel.features.length} features
          </span>

        </div>

        {activeModel.features.length === 0 ? (

          <p className="text-xs text-slate-500 py-4">
            No feature metadata is available for this model.
          </p>

        ) : (

          <div className="space-y-4">

            {activeModel.features.map(feature => (

              <div key={feature.name} className="space-y-1">

                <div className="flex items-center justify-between text-xs">

                  <span className="text-slate-300 font-mono">
                    {feature.name}
                  </span>

                  <span className="text-cyan-400 font-semibold font-mono">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>

                </div>

                <div className="w-full h-2 bg-[#090E1A] rounded-full overflow-hidden border border-slate-800">

                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, feature.importance * 100)
                      )}%`
                    }}
                  />

                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Minimum: {feature.min ?? 'N/A'}</span>
                  <span>Maximum: {feature.max ?? 'N/A'}</span>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Stored confusion matrix */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">

        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-purple-400" />

          <h3 className="text-sm font-semibold text-slate-100">
            Stored Confusion Matrix
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">

          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
            <span className="text-[10px] text-emerald-300 uppercase block">
              True Negative
            </span>

            <span className="text-xl font-bold text-white font-mono">
              {activeModel.confusionMatrix.trueNegative.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-lg">
            <span className="text-[10px] text-rose-300 uppercase block">
              False Positive
            </span>

            <span className="text-xl font-bold text-white font-mono">
              {activeModel.confusionMatrix.falsePositive.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-lg">
            <span className="text-[10px] text-rose-300 uppercase block">
              False Negative
            </span>

            <span className="text-xl font-bold text-white font-mono">
              {activeModel.confusionMatrix.falseNegative.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-lg">
            <span className="text-[10px] text-cyan-300 uppercase block">
              True Positive
            </span>

            <span className="text-xl font-bold text-white font-mono">
              {activeModel.confusionMatrix.truePositive.toLocaleString()}
            </span>
          </div>

        </div>

      </div>

      {/* Training integration status */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-lg bg-cyan-950/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">
              Machine Learning Backend
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Real model training and prediction integration is pending.
            </p>
          </div>

          <span className="text-[10px] px-2 py-1 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
            Not Connected
          </span>

        </div>

        <button
          onClick={() => onNavigate('datasets')}
          className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          View available datasets
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>

    </div>
  );
};
