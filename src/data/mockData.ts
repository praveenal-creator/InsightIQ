import { Dataset, Analysis, ActivityItem, NotificationItem, PredictiveModel } from '../types';

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'ds-saas-cohorts',
    name: 'SaaS Customer Cohorts 2026',
    description: 'Enterprise subscription lifecycle data with recurring ARR, churn indicators, and usage frequencies.',
    format: 'CSV',
    rows: 142850,
    columns: 8,
    size: '28.4 MB',
    updatedAt: '12 mins ago',
    healthScore: 98,
    tags: ['Subscriptions', 'ARR', 'Churn'],
    schema: [
      { name: 'customer_id', type: 'VARCHAR', nullable: false, uniqueCount: 142850 },
      { name: 'tier', type: 'VARCHAR', nullable: false, uniqueCount: 4 },
      { name: 'monthly_arr', type: 'DECIMAL', nullable: false, uniqueCount: 840 },
      { name: 'active_seats', type: 'INTEGER', nullable: false, uniqueCount: 120 },
      { name: 'login_frequency_weekly', type: 'INTEGER', nullable: true, uniqueCount: 35 },
      { name: 'support_tickets_30d', type: 'INTEGER', nullable: false, uniqueCount: 18 },
      { name: 'churn_risk_score', type: 'FLOAT', nullable: false, uniqueCount: 95 },
      { name: 'region', type: 'VARCHAR', nullable: false, uniqueCount: 5 }
    ],
    sampleData: [
      { customer_id: 'CUST-8801', tier: 'Enterprise Plus', monthly_arr: 14500, active_seats: 184, login_frequency_weekly: 28, support_tickets_30d: 1, churn_risk_score: 0.12, region: 'North America' },
      { customer_id: 'CUST-8802', tier: 'Professional', monthly_arr: 4200, active_seats: 45, login_frequency_weekly: 19, support_tickets_30d: 4, churn_risk_score: 0.48, region: 'Europe' },
      { customer_id: 'CUST-8803', tier: 'Enterprise', monthly_arr: 9800, active_seats: 110, login_frequency_weekly: 22, support_tickets_30d: 0, churn_risk_score: 0.08, region: 'Asia Pacific' },
      { customer_id: 'CUST-8804', tier: 'Starter', monthly_arr: 1200, active_seats: 12, login_frequency_weekly: 8, support_tickets_30d: 7, churn_risk_score: 0.82, region: 'North America' },
      { customer_id: 'CUST-8805', tier: 'Enterprise Plus', monthly_arr: 22000, active_seats: 320, login_frequency_weekly: 31, support_tickets_30d: 2, churn_risk_score: 0.15, region: 'Europe' },
      { customer_id: 'CUST-8806', tier: 'Professional', monthly_arr: 3800, active_seats: 38, login_frequency_weekly: 14, support_tickets_30d: 3, churn_risk_score: 0.35, region: 'Latin America' },
      { customer_id: 'CUST-8807', tier: 'Enterprise', monthly_arr: 11500, active_seats: 140, login_frequency_weekly: 25, support_tickets_30d: 1, churn_risk_score: 0.19, region: 'North America' },
      { customer_id: 'CUST-8808', tier: 'Starter', monthly_arr: 950, active_seats: 8, login_frequency_weekly: 5, support_tickets_30d: 9, churn_risk_score: 0.91, region: 'Europe' }
    ]
  },
  {
    id: 'ds-ecommerce-orders',
    name: 'E-Commerce Global Orders Q3',
    description: 'Omnichannel consumer transactions including item categories, basket sizes, discount ratios, and delivery fulfillment.',
    format: 'Parquet',
    rows: 1240390,
    columns: 7,
    size: '148.2 MB',
    updatedAt: '45 mins ago',
    healthScore: 96,
    tags: ['Retail', 'Orders', 'Revenue'],
    schema: [
      { name: 'order_id', type: 'VARCHAR', nullable: false, uniqueCount: 1240390 },
      { name: 'gross_value', type: 'DECIMAL', nullable: false, uniqueCount: 12400 },
      { name: 'items_count', type: 'INTEGER', nullable: false, uniqueCount: 24 },
      { name: 'channel', type: 'VARCHAR', nullable: false, uniqueCount: 4 },
      { name: 'discount_pct', type: 'FLOAT', nullable: true, uniqueCount: 40 },
      { name: 'delivery_days', type: 'INTEGER', nullable: false, uniqueCount: 14 },
      { name: 'return_status', type: 'BOOLEAN', nullable: false, uniqueCount: 2 }
    ],
    sampleData: [
      { order_id: 'ORD-90211', gross_value: 348.50, items_count: 4, channel: 'Mobile App', discount_pct: 0.10, delivery_days: 2, return_status: 'No' },
      { order_id: 'ORD-90212', gross_value: 1290.00, items_count: 9, channel: 'Web Direct', discount_pct: 0.15, delivery_days: 3, return_status: 'No' },
      { order_id: 'ORD-90213', gross_value: 84.20, items_count: 1, channel: 'Marketplace', discount_pct: 0.00, delivery_days: 5, return_status: 'Yes' },
      { order_id: 'ORD-90214', gross_value: 520.00, items_count: 3, channel: 'Web Direct', discount_pct: 0.05, delivery_days: 2, return_status: 'No' },
      { order_id: 'ORD-90215', gross_value: 215.80, items_count: 2, channel: 'Mobile App', discount_pct: 0.20, delivery_days: 4, return_status: 'No' }
    ]
  },
  {
    id: 'ds-fraud-ledger',
    name: 'Financial Fraud Risk Ledger',
    description: 'High-volume transaction logs with calculated anomaly risk vectors, IP geolocation deviation, and velocity metrics.',
    format: 'Snowflake',
    rows: 840500,
    columns: 6,
    size: '92.0 MB',
    updatedAt: '2 hours ago',
    healthScore: 99,
    tags: ['FinTech', 'Compliance', 'Security'],
    schema: [
      { name: 'txn_id', type: 'VARCHAR', nullable: false, uniqueCount: 840500 },
      { name: 'amount_usd', type: 'DECIMAL', nullable: false, uniqueCount: 9500 },
      { name: 'geo_distance_km', type: 'INTEGER', nullable: false, uniqueCount: 420 },
      { name: 'device_risk_tier', type: 'VARCHAR', nullable: false, uniqueCount: 3 },
      { name: 'rule_flagged', type: 'BOOLEAN', nullable: false, uniqueCount: 2 },
      { name: 'settlement_delay_sec', type: 'INTEGER', nullable: false, uniqueCount: 80 }
    ],
    sampleData: [
      { txn_id: 'TXN-77401', amount_usd: 12500, geo_distance_km: 12, device_risk_tier: 'Low', rule_flagged: 'False', settlement_delay_sec: 14 },
      { txn_id: 'TXN-77402', amount_usd: 94000, geo_distance_km: 4800, device_risk_tier: 'High', rule_flagged: 'True', settlement_delay_sec: 180 },
      { txn_id: 'TXN-77403', amount_usd: 340, geo_distance_km: 3, device_risk_tier: 'Low', rule_flagged: 'False', settlement_delay_sec: 8 },
      { txn_id: 'TXN-77404', amount_usd: 21000, geo_distance_km: 1950, device_risk_tier: 'Medium', rule_flagged: 'True', settlement_delay_sec: 90 }
    ]
  },
  {
    id: 'ds-iot-fleet',
    name: 'IoT Sensor Fleet Telemetry',
    description: 'Industrial motor sensor time-series measuring temperature anomalies, rotational vibration, and power draws.',
    format: 'BigQuery',
    rows: 2540000,
    columns: 6,
    size: '410.5 MB',
    updatedAt: '3 hours ago',
    healthScore: 94,
    tags: ['Industrial', 'Sensors', 'Predictive Maintenance'],
    schema: [
      { name: 'device_id', type: 'VARCHAR', nullable: false, uniqueCount: 500 },
      { name: 'temperature_c', type: 'FLOAT', nullable: false, uniqueCount: 650 },
      { name: 'rpm', type: 'INTEGER', nullable: false, uniqueCount: 1800 },
      { name: 'vibration_rms', type: 'FLOAT', nullable: false, uniqueCount: 420 },
      { name: 'power_draw_kw', type: 'FLOAT', nullable: false, uniqueCount: 310 },
      { name: 'maintenance_status', type: 'VARCHAR', nullable: false, uniqueCount: 3 }
    ],
    sampleData: [
      { device_id: 'SEN-091', temperature_c: 68.4, rpm: 3450, vibration_rms: 0.18, power_draw_kw: 14.2, maintenance_status: 'Nominal' },
      { device_id: 'SEN-092', temperature_c: 89.1, rpm: 3620, vibration_rms: 0.74, power_draw_kw: 19.8, maintenance_status: 'Warning' },
      { device_id: 'SEN-093', temperature_c: 65.2, rpm: 3400, vibration_rms: 0.15, power_draw_kw: 13.9, maintenance_status: 'Nominal' }
    ]
  },
  {
    id: 'ds-lead-attribution',
    name: 'Hospitality Lead Attribution Matrix',
    description: 'Multi-touch advertising attribution dataset across social, organic search, affiliate, and partner conferences.',
    format: 'JSON',
    rows: 68400,
    columns: 5,
    size: '14.2 MB',
    updatedAt: '1 day ago',
    healthScore: 92,
    tags: ['Marketing', 'Attribution', 'CAC'],
    schema: [
      { name: 'lead_id', type: 'VARCHAR', nullable: false, uniqueCount: 68400 },
      { name: 'first_touch_source', type: 'VARCHAR', nullable: false, uniqueCount: 6 },
      { name: 'last_touch_source', type: 'VARCHAR', nullable: false, uniqueCount: 6 },
      { name: 'days_to_close', type: 'INTEGER', nullable: false, uniqueCount: 45 },
      { name: 'deal_size', type: 'DECIMAL', nullable: false, uniqueCount: 350 }
    ],
    sampleData: [
      { lead_id: 'LEAD-441', first_touch_source: 'Organic Search', last_touch_source: 'Partner Webinar', days_to_close: 18, deal_size: 16500 },
      { lead_id: 'LEAD-442', first_touch_source: 'Paid Social', last_touch_source: 'Direct Demo', days_to_close: 32, deal_size: 8900 },
      { lead_id: 'LEAD-443', first_touch_source: 'Event Booth', last_touch_source: 'Sales Outbound', days_to_close: 14, deal_size: 24000 }
    ]
  }
];

export const INITIAL_ANALYSES: Analysis[] = [
  {
    id: 'ana-1',
    title: 'Starter Tier Churn Risk Spike at Day 45',
    datasetName: 'SaaS Customer Cohorts 2026',
    datasetId: 'ds-saas-cohorts',
    summary: 'Automated clustering revealed accounts with fewer than 10 weekly logins in their first month exhibit a 4.2x higher churn probability before their second billing cycle.',
    confidence: 98.4,
    category: 'Anomaly',
    createdAt: '18 mins ago',
    keyMetric: 'Churn Delta',
    metricChange: '+23.4%',
    isPositive: false,
    actionableRecommendation: 'Trigger automated in-app onboarding intervention when weekly logins fall under 12 in the first 21 days.'
  },
  {
    id: 'ana-2',
    title: 'Mobile Channel Average Order Value Expansion',
    datasetName: 'E-Commerce Global Orders Q3',
    datasetId: 'ds-ecommerce-orders',
    summary: 'Cross-tabulation indicates mobile orders utilizing bundled checkout exceeded desktop basket sizes by $42.50 on average without increased return rates.',
    confidence: 96.1,
    category: 'Trend',
    createdAt: '1 hour ago',
    keyMetric: 'Basket Expansion',
    metricChange: '+18.6%',
    isPositive: true,
    actionableRecommendation: 'Deploy the 1-click bundle recommendations carousel to desktop checkout to capture parity.'
  },
  {
    id: 'ana-3',
    title: 'Cross-Border Latency Correlation with False Flags',
    datasetName: 'Financial Fraud Risk Ledger',
    datasetId: 'ds-fraud-ledger',
    summary: 'Rule #14 flags 12% more legitimate transactions during peak transatlantic routing hours due to geo-distance heuristic miscalculations.',
    confidence: 94.8,
    category: 'Correlation',
    createdAt: '3 hours ago',
    keyMetric: 'False Positive Drop',
    metricChange: '-9.2%',
    isPositive: true,
    actionableRecommendation: 'Incorporate IP velocity decay parameters into threshold calculations for European IP clusters.'
  },
  {
    id: 'ana-4',
    title: 'Motor Thermal Drift Preceding Bearing Failure',
    datasetName: 'IoT Sensor Fleet Telemetry',
    datasetId: 'ds-iot-fleet',
    summary: 'Continuous Fourier transform analysis isolated a 72-hour thermal creep pattern of +4.2°C before vibration RMS exceeded safety tolerances.',
    confidence: 99.1,
    category: 'Forecast',
    createdAt: '5 hours ago',
    keyMetric: 'Uptime Gain',
    metricChange: '+310 hrs',
    isPositive: true,
    actionableRecommendation: 'Set preemptive diagnostic alerts when temperature delta exceeds 3.5°C over 48 baseline operating hours.'
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '8 mins ago',
    user: 'Elena Rostova',
    avatar: 'ER',
    action: 'Ran automated pipeline',
    target: 'Normalized currency codes in E-Commerce Global Orders Q3',
    type: 'clean'
  },
  {
    id: 'act-2',
    timestamp: '25 mins ago',
    user: 'InsightIQ AI Agent',
    avatar: 'AI',
    action: 'Generated insight brief',
    target: 'Identified Day-45 churn risk cluster in SaaS Cohorts',
    type: 'ai'
  },
  {
    id: 'act-3',
    timestamp: '1 hour ago',
    user: 'Marcus Vance',
    avatar: 'MV',
    action: 'Executed SQL query',
    target: 'SELECT customer_id, monthly_arr FROM ds_saas WHERE churn_risk > 0.70',
    type: 'query'
  },
  {
    id: 'act-4',
    timestamp: '2 hours ago',
    user: 'Priya Sharma',
    avatar: 'PS',
    action: 'Ingested dataset',
    target: 'Connected Snowflake table: Financial Fraud Risk Ledger (840k rows)',
    type: 'upload'
  },
  {
    id: 'act-5',
    timestamp: '4 hours ago',
    user: 'Elena Rostova',
    avatar: 'ER',
    action: 'Exported report package',
    target: 'Q3 Executive Data Quality Audit exported to PDF & CSV',
    type: 'export'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Data Ingestion Complete',
    message: 'IoT Sensor Fleet Telemetry (2.54M rows) was successfully indexed with zero schema drift.',
    timestamp: '15m ago',
    read: false,
    type: 'system',
    linkTo: 'datasets'
  },
  {
    id: 'notif-2',
    title: 'Critical Churn Pattern Detected',
    message: 'AI Analyst identified a 23.4% churn spike correlation among starter accounts with low login frequency.',
    timestamp: '45m ago',
    read: false,
    type: 'insight',
    linkTo: 'ai-analyst'
  },
  {
    id: 'notif-3',
    title: 'Anomaly Alert: Transaction Threshold',
    message: 'Financial Fraud Risk Ledger recorded 14 cross-border alerts requiring parameter calibration.',
    timestamp: '2h ago',
    read: false,
    type: 'alert',
    linkTo: 'explore'
  },
  {
    id: 'notif-4',
    title: 'Predictive Model Retrained',
    message: 'Customer Churn Predictor reached 92.4% ROC-AUC on refreshed training partitions.',
    timestamp: '5h ago',
    read: true,
    type: 'system',
    linkTo: 'predictive-lab'
  }
];

export const PREDICTIVE_MODELS: PredictiveModel[] = [
  {
    id: 'model-churn',
    name: 'Customer Churn Predictor (Random Forest)',
    algorithm: 'Ensemble Random Forest (500 Estimators)',
    targetMetric: 'churn_risk_score >= 0.65',
    accuracy: 94.2,
    rocAuc: 0.924,
    f1Score: 0.892,
    features: [
      { name: 'login_frequency_weekly', importance: 0.38 },
      { name: 'support_tickets_30d', importance: 0.27 },
      { name: 'active_seats', importance: 0.16 },
      { name: 'monthly_arr', importance: 0.12 },
      { name: 'region', importance: 0.07 }
    ],
    confusionMatrix: {
      truePositive: 1420,
      falsePositive: 94,
      trueNegative: 12150,
      falseNegative: 140
    }
  },
  {
    id: 'model-revenue',
    name: 'Q4 Revenue Velocity Forecaster (XGBoost)',
    algorithm: 'Gradient Boosted Trees with Time Decay',
    targetMetric: 'gross_value_next_30d',
    accuracy: 91.8,
    rocAuc: 0.895,
    f1Score: 0.871,
    features: [
      { name: 'basket_expansion_rate', importance: 0.41 },
      { name: 'repeat_purchase_velocity', importance: 0.29 },
      { name: 'channel_affinity', importance: 0.18 },
      { name: 'discount_sensitivity', importance: 0.12 }
    ],
    confusionMatrix: {
      truePositive: 980,
      falsePositive: 110,
      trueNegative: 8940,
      falseNegative: 120
    }
  }
];
