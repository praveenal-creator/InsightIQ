import { Dataset, Analysis, ActivityItem, NotificationItem, PredictiveModel, ReportItem } from '../types';

/**
 * SAMPLE / DEMO DATASETS
 * These are preserved strictly for Demo Mode and testing.
 * They are clearly flagged with isDemo: true and never mixed with real production records.
 */
export const SAMPLE_DATASETS: Dataset[] = [
  {
    id: 'ds-demo-saas',
    name: 'SaaS Customer Cohorts 2026',
    description: 'Enterprise subscription lifecycle data with recurring ARR, churn indicators, and usage frequencies.',
    format: 'CSV',
    rows: 142850,
    columns: 8,
    size: '28.4 MB',
    updatedAt: '12 mins ago',
    healthScore: 98,
    tags: ['Demo', 'Subscriptions', 'ARR'],
    isDemo: true,
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
    id: 'ds-demo-ecommerce',
    name: 'E-Commerce Global Orders Q3',
    description: 'Omnichannel consumer transactions including item categories, basket sizes, discount ratios, and delivery fulfillment.',
    format: 'Parquet',
    rows: 1240390,
    columns: 7,
    size: '148.2 MB',
    updatedAt: '45 mins ago',
    healthScore: 96,
    tags: ['Demo', 'Retail', 'Revenue'],
    isDemo: true,
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
    id: 'ds-demo-fraud',
    name: 'Financial Fraud Risk Ledger',
    description: 'High-volume transaction logs with calculated anomaly risk vectors, IP geolocation deviation, and velocity metrics.',
    format: 'Snowflake',
    rows: 840500,
    columns: 6,
    size: '92.0 MB',
    updatedAt: '2 hours ago',
    healthScore: 99,
    tags: ['Demo', 'FinTech', 'Security'],
    isDemo: true,
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
  }
];

export const SAMPLE_ANALYSES: Analysis[] = [
  {
    id: 'ana-demo-1',
    title: 'Starter Tier Churn Risk Spike at Day 45',
    datasetName: 'SaaS Customer Cohorts 2026',
    datasetId: 'ds-demo-saas',
    summary: 'Automated clustering revealed accounts with fewer than 10 weekly logins in their first month exhibit a 4.2x higher churn probability before their second billing cycle.',
    confidence: 98.4,
    category: 'Anomaly',
    createdAt: '18 mins ago',
    keyMetric: 'Churn Delta',
    metricChange: '+23.4%',
    isPositive: false,
    actionableRecommendation: 'Trigger automated in-app onboarding intervention when weekly logins fall under 12 in the first 21 days.',
    isDemo: true
  },
  {
    id: 'ana-demo-2',
    title: 'Mobile Channel Average Order Value Expansion',
    datasetName: 'E-Commerce Global Orders Q3',
    datasetId: 'ds-demo-ecommerce',
    summary: 'Cross-tabulation indicates mobile orders utilizing bundled checkout exceeded desktop basket sizes by $42.50 on average without increased return rates.',
    confidence: 96.1,
    category: 'Trend',
    createdAt: '1 hour ago',
    keyMetric: 'Basket Expansion',
    metricChange: '+18.6%',
    isPositive: true,
    actionableRecommendation: 'Deploy the 1-click bundle recommendations carousel to desktop checkout to capture parity.',
    isDemo: true
  }
];

export const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-demo-1',
    timestamp: 'Sample event',
    user: 'InsightIQ Demo Agent',
    avatar: 'AI',
    action: 'Ran automated pipeline',
    target: 'Normalized currency codes in E-Commerce Global Orders Q3',
    type: 'clean',
    isDemo: true
  },
  {
    id: 'act-demo-2',
    timestamp: 'Sample event',
    user: 'InsightIQ Demo Agent',
    avatar: 'AI',
    action: 'Generated insight brief',
    target: 'Identified Day-45 churn risk cluster in SaaS Cohorts',
    type: 'ai',
    isDemo: true
  }
];

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-demo-1',
    title: 'Demo Environment Ready',
    message: 'Sample datasets loaded in Demo Mode. Switch to Production Mode anytime to manage real datasets.',
    timestamp: 'Just now',
    read: false,
    type: 'system',
    linkTo: 'datasets',
    isDemo: true
  }
];

export const SAMPLE_MODELS: PredictiveModel[] = [
  {
    id: 'model-demo-churn',
    name: 'Customer Churn Predictor (Demo Model)',
    algorithm: 'Ensemble Random Forest (500 Estimators)',
    targetMetric: 'churn_risk_score >= 0.65',
    accuracy: 94.2,
    rocAuc: 0.924,
    f1Score: 0.892,
    datasetId: 'ds-demo-saas',
    datasetName: 'SaaS Customer Cohorts 2026',
    features: [
      { name: 'login_frequency_weekly', importance: 0.38, defaultVal: 18, min: 2, max: 40 },
      { name: 'support_tickets_30d', importance: 0.27, defaultVal: 2, min: 0, max: 15 },
      { name: 'active_seats', importance: 0.16, defaultVal: 45, min: 5, max: 350 },
      { name: 'monthly_arr', importance: 0.12, defaultVal: 6500, min: 500, max: 25000 }
    ],
    confusionMatrix: {
      truePositive: 1420,
      falsePositive: 94,
      trueNegative: 12150,
      falseNegative: 140
    },
    isDemo: true
  }
];

export const SAMPLE_REPORTS: ReportItem[] = [
  {
    id: 'rep-demo-1',
    title: 'Executive Intelligence Brief (Sample Report)',
    subtitle: 'Demonstration brief showing cross-pipeline metrics and cohort retention synthesis',
    cadence: 'On Demand (Demo Mode)',
    status: 'Sample Document',
    author: 'InsightIQ Demo Engine',
    createdAt: 'Today',
    datasetName: 'SaaS Customer Cohorts 2026',
    metrics: [
      { label: 'Sample Volume', value: '142,850 rows', delta: '+12.4%' },
      { label: 'Demonstration ARR', value: '$1.48M', delta: '+18.6%' },
      { label: 'Dataset Hygiene', value: '98.0%', delta: 'Optimal' },
      { label: 'High Risk Flags', value: '14 accounts', delta: '-6 MoM' }
    ],
    findings: [
      'Account retention correlates strongly with first-month weekly login frequency.',
      'Mobile channel basket sizes exceeded desktop by 18.6% with consistent return rates.'
    ],
    recommendations: [
      'Trigger proactive outreach when an account login velocity drops below 12 sessions/week.',
      'Deploy the multi-currency cleaning recipe across new ingestion streams.'
    ],
    isDemo: true
  }
];

// Clean Production starting state (Empty by default)
export const INITIAL_DATASETS: Dataset[] = [];
export const INITIAL_ANALYSES: Analysis[] = [];
export const INITIAL_ACTIVITIES: ActivityItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const PREDICTIVE_MODELS: PredictiveModel[] = [];
