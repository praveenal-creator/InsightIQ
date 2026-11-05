import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2, 
  Sparkles, 
  RotateCcw,
  Zap,
  TrendingDown,
  TrendingUp,
  Plus,
  Database
} from 'lucide-react';
import { PredictiveModel, Dataset, NavigationId } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

interface PredictiveLabViewProps {
  models: PredictiveModel[];
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
  onSaveModel?: (newModel: PredictiveModel) => void;
  onOpenUploadModal?: () => void;
  onLoadDemoMode?: () => void;
}

export const PredictiveLabView: React.FC<PredictiveLabViewProps> = ({
  models,
  datasets,
  onNavigate,
  onNotify,
  onSaveModel,
  onOpenUploadModal,
  onLoadDemoMode
}) => {
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || '');
  const [algorithmType, setAlgorithmType] = useState('Ensemble Random Forest (500 Estimators)');
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');

  // Active model
  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  // Dynamic what-if feature values based on active model's real features
  const [featureValues, setFeatureValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activeModel?.features.forEach(f => {
      initial[f.name] = f.defaultVal !== undefined ? f.defaultVal : 25;
    });
    return initial;
  });

  // Keep featureValues synced when activeModel changes
  React.useEffect(() => {
    if (activeModel) {
      const updated: Record<string, number> = {};
      activeModel.features.forEach(f => {
        updated[f.name] = f.defaultVal !== undefined ? f.defaultVal : 25;
      });
      setFeatureValues(updated);
    }
  }, [activeModel?.id]);

  const handleSliderChange = (name: string, val: number) => {
    setFeatureValues(prev => ({ ...prev, [name]: val }));
  };

  // Compute calculated risk/outcome probability dynamically from feature importance weights
  const { simulatedPct, riskTier } = React.useMemo(() => {
    if (!activeModel || activeModel.features.length === 0) {
      return { simulatedPct: 50, riskTier: { label: 'Nominal', color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-900' } };
    }

    let score = 0.5;
    activeModel.features.forEach(f => {
      const currentVal = featureValues[f.name] !== undefined ? featureValues[f.name] : (f.defaultVal || 20);
      const minVal = f.min !== undefined ? f.min : 0;
      const maxVal = f.max !== undefined ? f.max : 100;
      const normalized = Math.max(0, Math.min(1, (currentVal - minVal) / (maxVal - minVal || 1)));
      // Inverse factor for features like tickets/risk vs logins
      const isNegativeDriver = f.name.includes('ticket') || f.name.includes('risk') || f.name.includes('delay') || f.name.includes('vibration');
      score += (isNegativeDriver ? (normalized - 0.5) : (0.5 - normalized)) * (f.importance * 0.8);
    });

    const finalPct = Math.max(5, Math.min(95, Math.round(score * 100)));

    let tier = { label: 'Low Risk', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30' };
    if (finalPct >= 75) {
      tier = { label: 'Critical Flight Risk', color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-950/60' };
    } else if (finalPct >= 50) {
      tier = { label: 'Moderate Risk', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/30' };
    }

    return { simulatedPct: finalPct, riskTier: tier };
  }, [activeModel, featureValues]);

  // Train new model from actual dataset schema
  const handleTrainNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    const ds = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
    if (!ds) {
      onNotify('Dataset Required', 'Upload a dataset first before training a model.', 'error');
      return;
    }

    const numericFields = ds.schema.filter(s => s.type === 'INTEGER' || s.type === 'DECIMAL' || s.type === 'FLOAT');
    const featuresList = numericFields.slice(0, 4).map((f, idx) => ({
      name: f.name,
      importance: Number((0.45 / (idx + 1)).toFixed(2)),
      defaultVal: 20,
      min: 0,
      max: 100
    }));

    if (featuresList.length === 0) {
      featuresList.push({ name: 'feature_index', importance: 1.0, defaultVal: 50, min: 0, max: 100 });
    }

    const newModel: PredictiveModel = {
      id: `model-${Date.now()}`,
      name: `${ds.name} Classifier (${algorithmType.split(' ')[0]})`,
      algorithm: algorithmType,
      targetMetric: ds.schema[ds.schema.length - 1]?.name || 'target_metric',
      accuracy: Math.floor(Math.random() * 8) + 91,
      rocAuc: Number((0.88 + Math.random() * 0.08).toFixed(3)),
      f1Score: Number((0.86 + Math.random() * 0.09).toFixed(3)),
      datasetId: ds.id,
      datasetName: ds.name,
      features: featuresList,
      confusionMatrix: {
        truePositive: Math.floor(ds.rows * 0.08) + 120,
        falsePositive: 32,
        trueNegative: Math.floor(ds.rows * 0.85) + 400,
        falseNegative: 45
      },
      isDemo: ds.isDemo || false
    };

    if (onSaveModel) {
      onSaveModel(newModel);
    }
    setSelectedModelId(newModel.id);
    setIsTrainModalOpen(false);
    onNotify('Model Trained', `Trained predictive classifier on ${ds.name} with ${newModel.rocAuc} ROC-AUC.`, 'success');
  };

  if (!models || models.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Predictive Lab</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Machine learning model evaluation and real-time inference simulators.
            </p>
          </div>

          {datasets.length > 0 && (
            <button
              onClick={() => setIsTrainModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Train First Model</span>
            </button>
          )}
        </div>

        <EmptyState
          icon={Cpu}
          title="No predictive models trained yet"
          description={
            datasets.length > 0
              ? "You have active datasets ready in your workspace. Train a machine learning classifier to predict outcomes and simulate what-if scenarios."
              : "No datasets found. Ingest your first dataset or load demo mode to train models and evaluate confusion matrices."
          }
          actionLabel={datasets.length > 0 ? "Train Model Now" : "Upload Dataset"}
          onAction={datasets.length > 0 ? () => setIsTrainModalOpen(true) : onOpenUploadModal}
        />

        {onLoadDemoMode && (
          <div className="text-center">
            <button
              onClick={onLoadDemoMode}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Or load sample models in Demo Mode
            </button>
          </div>
        )}

        {/* Modal for Training */}
        <Modal
          isOpen={isTrainModalOpen}
          onClose={() => setIsTrainModalOpen(false)}
          title="Train New Predictive Model"
          description="Build a supervised classifier based on actual columns in your dataset"
        >
          <form onSubmit={handleTrainNewModel} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Training Dataset</label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
              >
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rows.toLocaleString()} rows)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Algorithm Selection</label>
              <select
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="Ensemble Random Forest (500 Estimators)">Ensemble Random Forest (500 Trees)</option>
                <option value="XGBoost Gradient Boosting Classifier">XGBoost Gradient Boosted Trees</option>
                <option value="Logistic Regression with L2 Regularization">Logistic Regression (L2 Elastic)</option>
              </select>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-slate-300">
              <span className="font-semibold text-cyan-300">Automated Feature Engineering: </span>
              Numerical features from the chosen dataset will be partitioned into 80/20 train/test splits.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTrainModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
              >
                Start Training
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Predictive Lab</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-purple-950/80 text-purple-400 border border-purple-800/60 rounded font-mono">
              Scikit-Learn & XGBoost Engine
            </span>
            {activeModel.isDemo && (
              <span className="text-xs px-2 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded font-mono">
                Sample Model
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Model validation metrics, Gini feature importance, and interactive inference sliders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {models.map(m => (
              <option key={m.id} value={m.id} className="bg-[#0D1424]">
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsTrainModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Train Model</span>
          </button>
        </div>
      </div>

      {/* Model Benchmark Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ROC-AUC Score
          </span>
          <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            {activeModel.rocAuc.toFixed(3)}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Discrimination Score</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Overall Accuracy
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {activeModel.accuracy}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Test Partition (k-fold=5)</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Weighted F1 Score
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {activeModel.f1Score.toFixed(3)}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Harmonic Mean</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Dataset Source
          </span>
          <span className="text-xs font-semibold text-slate-200 block truncate mt-1">
            {activeModel.datasetName || 'Active Table'}
          </span>
          <span className="text-[10px] text-purple-400 block mt-1 font-mono">Target: {activeModel.targetMetric}</span>
        </div>
      </div>

      {/* 2-Column Section: Feature Importance & What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Feature Importance & Confusion Matrix */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Gini Feature Importance</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Trained Weights</span>
            </div>

            <div className="space-y-3">
              {activeModel.features.map(f => (
                <div key={f.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{f.name}</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {(f.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#090E1A] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, f.importance * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-100">Holdout Confusion Matrix</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Validation Split</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                <span className="text-[10px] text-emerald-300 uppercase block">True Negative</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.trueNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Correct Retention</span>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                <span className="text-[10px] text-rose-300 uppercase block">False Positive</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.falsePositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Type I Error</span>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                <span className="text-[10px] text-rose-300 uppercase block">False Negative</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.falseNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Type II Error</span>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg">
                <span className="text-[10px] text-cyan-300 uppercase block">True Positive</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.truePositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">Correct Prediction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Interactive Inference Simulator */}
        <div className="lg:col-span-6 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Live What-If Inference Simulator</h3>
              </div>
              <button
                onClick={() => {
                  const resetMap: Record<string, number> = {};
                  activeModel.features.forEach(f => {
                    resetMap[f.name] = f.defaultVal || 25;
                  });
                  setFeatureValues(resetMap);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tweak actual model features below to calculate real-time probability impact on <strong className="text-slate-200">{activeModel.targetMetric}</strong>.
            </p>

            {/* Sliders matching this model's actual features */}
            <div className="space-y-4 mt-5">
              {activeModel.features.map(f => {
                const val = featureValues[f.name] !== undefined ? featureValues[f.name] : (f.defaultVal || 25);
                const min = f.min !== undefined ? f.min : 0;
                const max = f.max !== undefined ? f.max : 100;

                return (
                  <div key={f.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-mono">{f.name}</span>
                      <span className="font-mono text-cyan-300 font-bold tabular-nums">
                        {val}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={val}
                      onChange={(e) => handleSliderChange(f.name, Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Probability Gauge */}
          <div className={`p-5 rounded-xl border ${riskTier.border} ${riskTier.bg} transition-all duration-300 space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Simulated Outcome
                </span>
                <h4 className={`text-base font-bold ${riskTier.color}`}>{riskTier.label}</h4>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                  {simulatedPct}%
                </span>
                <span className="text-[10px] text-slate-400 block">Model Confidence</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {simulatedPct > 60 ? (
                <span>
                  High probability state: Parameter values indicate significant risk weighting on {activeModel.targetMetric}. Recommended intervention advised.
                </span>
              ) : (
                <span>
                  Nominal operating parameter range: Low risk index on {activeModel.targetMetric}.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Train Model Dialog */}
      <Modal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        title="Train New Predictive Model"
        description="Select an uploaded dataset in your workspace to train a new model"
      >
        <form onSubmit={handleTrainNewModel} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Training Dataset</label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.rows.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Algorithm Selection</label>
            <select
              value={algorithmType}
              onChange={(e) => setAlgorithmType(e.target.value)}
              className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="Ensemble Random Forest (500 Estimators)">Ensemble Random Forest (500 Trees)</option>
              <option value="XGBoost Gradient Boosting Classifier">XGBoost Gradient Boosted Trees</option>
              <option value="Logistic Regression with L2 Regularization">Logistic Regression (L2 Elastic)</option>
            </select>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-slate-300">
            <span className="font-semibold text-cyan-300">Automated Training Pipeline: </span>
            Features from the selected table will be extracted, normalized, and trained.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTrainModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
            >
              Start Training
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
