export type NavigationId = 
  | 'overview'
  | 'datasets'
  | 'ai-analyst'
  | 'explore'
  | 'cleaning'
  | 'visualizations'
  | 'predictive-lab'
  | 'sql-playground'
  | 'reports'
  | 'settings';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  format: 'CSV' | 'Parquet' | 'Snowflake' | 'BigQuery' | 'JSON';
  rows: number;
  columns: number;
  size: string;
  updatedAt: string;
  healthScore: number;
  tags: string[];
  sampleData: Record<string, string | number>[];
  schema: { name: string; type: string; nullable: boolean; uniqueCount: number }[];
}

export interface Analysis {
  id: string;
  title: string;
  datasetName: string;
  datasetId: string;
  summary: string;
  confidence: number;
  category: 'Anomaly' | 'Trend' | 'Correlation' | 'Forecast';
  createdAt: string;
  keyMetric: string;
  metricChange: string;
  isPositive: boolean;
  actionableRecommendation: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  type: 'upload' | 'clean' | 'query' | 'ai' | 'export';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'insight' | 'system';
  linkTo?: NavigationId;
}

export interface CleaningStep {
  id: string;
  name: string;
  column: string;
  method: 'impute_mean' | 'impute_median' | 'drop_na' | 'remove_duplicates' | 'cap_outliers' | 'trim_whitespace';
  status: 'pending' | 'applied';
}

export interface PredictiveModel {
  id: string;
  name: string;
  algorithm: string;
  targetMetric: string;
  accuracy: number;
  rocAuc: number;
  f1Score: number;
  features: { name: string; importance: number }[];
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}
