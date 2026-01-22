// Mock Model Engine
const MODELS = [
  { id: 'lstm', name: 'LSTM (State Model)', color: '#3b82f6' },
  { id: 'xgboost', name: 'XGBoost', color: '#8b5cf6' },
  { id: 'prophet', name: 'Prophet', color: '#10b981' },
  { id: 'regression', name: 'Baseline Regression', color: '#f59e0b' }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateTimeSeries = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base signal (sine wave + trend)
    const t = i / 10;
    const base = 15 + Math.sin(t) * 2 + (Math.random() * 0.5);
    
    data.push({
      date: date.toISOString().split('T')[0],
      actual: Number(base.toFixed(2)),
      lstm: Number((base + (Math.random() - 0.5) * 0.5).toFixed(2)),
      xgboost: Number((base + (Math.random() - 0.5) * 0.8).toFixed(2)),
      prophet: Number((base + Math.sin(t * 2) * 0.5 + 0.2).toFixed(2)),
      regression: Number((base + (Math.random() - 0.5) * 1.5).toFixed(2)), // Higher error
    });
  }
  return data;
};

const generateMetrics = () => {
  return {
    lstm: { rmse: 0.12, mae: 0.08, mape: 1.2, r2: 0.96, latency: '45ms', trainingTime: '2h 15m', freshness: '2h ago', version: 'v2.1.0' },
    xgboost: { rmse: 0.18, mae: 0.12, mape: 1.8, r2: 0.92, latency: '12ms', trainingTime: '15m', freshness: '1d ago', version: 'v1.4.2' },
    prophet: { rmse: 0.25, mae: 0.18, mape: 2.5, r2: 0.88, latency: '85ms', trainingTime: '45m', freshness: '12h ago', version: 'v0.9.1' },
    regression: { rmse: 0.45, mae: 0.35, mape: 4.8, r2: 0.75, latency: '2ms', trainingTime: '30s', freshness: 'Live', version: 'v1.0.0' },
  };
};

const generateFeatureImportance = () => {
  return [
    { feature: 'Recent Rainfall', importance: 0.35 },
    { feature: 'Groundwater Extraction', importance: 0.25 },
    { feature: 'Soil Moisture Level', importance: 0.15 },
    { feature: 'Temperature Max', importance: 0.12 },
    { feature: 'Temperature Min', importance: 0.08 },
    { feature: 'Vegetation Index', importance: 0.05 },
  ];
};

const generateDriftStats = () => {
    return {
        driftScore: 0.12, // Low drift
        dataQuality: 98.5,
        retrainingStatus: 'Scheduled',
        lastTrained: '2023-10-25T14:30:00Z'
    };
};

export const fetchModelData = async (params) => {
  await delay(800 + Math.random() * 500); // Simulate network
  
  return {
    timeseries: generateTimeSeries(60),
    metrics: generateMetrics(),
    featureImportance: generateFeatureImportance(),
    health: generateDriftStats(),
    models: MODELS
  };
};
