// Mock ML Prediction Engine

// Baseline historical data
const BASELINE_TREND = [
  { month: 'Jan', level: 14.5 },
  { month: 'Feb', level: 14.2 },
  { month: 'Mar', level: 13.8 },
  { month: 'Apr', level: 13.2 },
  { month: 'May', level: 12.5 },
  { month: 'Jun', level: 12.8 }, // Monsoon start
  { month: 'Jul', level: 13.5 },
  { month: 'Aug', level: 14.8 },
  { month: 'Sep', level: 15.2 },
  { month: 'Oct', level: 15.5 },
  { month: 'Nov', level: 15.1 },
  { month: 'Dec', level: 14.8 },
];

export const calculateImpact = (params) => {
  const { rainfall, temperature, extraction, population } = params;

  // Weights for each factor (simplified physics model)
  const weights = {
    rainfall: 0.05,    // 1% rain variance = 0.05m change
    temp: -0.08,       // 1°C increase = -0.08m change
    extraction: -0.1,  // 1% extraction = -0.1m change
    population: -0.05, // 1% pop growth = -0.05m change
  };

  // Calculate net impact factor
  const impactDelta = 
    (rainfall * weights.rainfall) + 
    (temperature * weights.temp) + 
    (extraction * weights.extraction) + 
    (population * weights.population);

  // Generate scenario trend
  const trend = BASELINE_TREND.map(point => {
    // Apply delta progressively (impact accumulates over time)
    // We'll simulate a cumulative effect
    const baseline = point.level;
    const scenario = Math.max(0, baseline + impactDelta); // Ensure not negative
    
    return {
      month: point.month,
      baseline,
      scenario: parseFloat(scenario.toFixed(2))
    };
  });

  // Calculate summary metrics
  const baselineAvg = trend.reduce((acc, curr) => acc + curr.baseline, 0) / trend.length;
  const scenarioAvg = trend.reduce((acc, curr) => acc + curr.scenario, 0) / trend.length;
  
  const pctChange = ((scenarioAvg - baselineAvg) / baselineAvg) * 100;
  
  // Risk probability (heuristic)
  let riskProb = 20; // Base 20%
  if (pctChange < -10) riskProb += 50;
  else if (pctChange < -5) riskProb += 30;
  else if (pctChange > 5) riskProb -= 10;
  
  const affectedPop = Math.abs(pctChange * 125000).toFixed(0); // Dummy multiplier

  return {
    trend,
    metrics: {
      waterLevelChange: parseFloat(pctChange.toFixed(1)),
      riskProbability: Math.min(100, Math.max(0, riskProb)),
      affectedPopulation: parseInt(affectedPop)
    }
  };
};
