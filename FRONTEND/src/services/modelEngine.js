// Mock Model Engine
const MODELS = [
  { id: 'lstm', name: 'LSTM (Best)', color: '#3b82f6', description: 'Deep learning time-series model' },
  { id: 'randomForest', name: 'Random Forest', color: '#10b981', description: 'Ensemble tree-based model' },
  { id: 'linearRegression', name: 'Linear Regression', color: '#f59e0b', description: 'Baseline statistical model' }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateTimeSeries = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base signal (realistic groundwater level pattern)
    const t = i / 10;
    const base = 14.5 + Math.sin(t) * 2 + (Math.random() * 0.3);
    
    data.push({
      date: date.toISOString().split('T')[0],
      actual: Number(base.toFixed(2)),
      // LSTM: Best performance - closest to actual
      lstm: Number((base + (Math.random() - 0.5) * 0.4).toFixed(2)),
      // Random Forest: Good but slightly more error
      randomForest: Number((base + (Math.random() - 0.5) * 1.2).toFixed(2)),
      // Linear Regression: Baseline with higher error
      linearRegression: Number((base + (Math.random() - 0.5) * 2.5).toFixed(2)),
    });
  }
  return data;
};

const generateMetrics = () => {
  // Based on your actual LSTM metrics from model_performance_metrics.csv
  return {
    lstm: { 
      rmse: 6.17, 
      mae: 4.38, 
      r2: 0.41, 
      mape: 8.2,
      trainTime: '2h 15m', 
      epochs: 100,
      batchSize: 32,
      status: '🏆 Best'
    },
    randomForest: { 
      rmse: 8.45, 
      mae: 6.12, 
      r2: 0.32, 
      mape: 12.5,
      trainTime: '15m', 
      nEstimators: 100,
      maxDepth: 20,
      status: '✓ Good'
    },
    linearRegression: { 
      rmse: 12.8, 
      mae: 9.5, 
      r2: 0.18, 
      mape: 18.7,
      trainTime: '45s',
      regularization: 'Ridge',
      alpha: 1.0,
      status: 'Baseline'
    },
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
