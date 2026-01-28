import React, { useState } from 'react';
import ScenarioControls from '../components/simulator/ScenarioControls';
import ScenarioImpactChart from '../components/simulator/ScenarioImpactChart';
import ImpactSummaryCards from '../components/simulator/ImpactSummaryCards';
import { motion } from 'framer-motion';
import { Waves } from 'lucide-react';

export default function SimulatorPage() {
  // Baseline values (example district data)
  const baseline = {
    waterLevel: 14.5,  // meters
    rainfall: 650,     // mm/year
    temperature: 28,   // °C
    irrigation: 5000   // hectares
  };

  const [params, setParams] = useState({
    rainfall: 0,      // % change
    temperature: 0,   // % change
    irrigation: 0     // % change
  });

  // Simple simulation math
  const calculateImpact = () => {
    // Impact weights (simplified)
    const rainfallWeight = 0.35;   // Positive: more rain = higher water level
    const tempWeight = -0.15;      // Negative: higher temp = lower water level
    const irrigationWeight = -0.25; // Negative: more irrigation = lower water level

    const totalImpact = 
      (params.rainfall / 100) * rainfallWeight +
      (params.temperature / 100) * tempWeight +
      (params.irrigation / 100) * irrigationWeight;

    const waterLevel = baseline.waterLevel * (1 + totalImpact);

    return {
      waterLevel
    };
  };

  const results = calculateImpact();

  const updateParam = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
  };

  const applyPreset = (preset) => {
    const presets = {
      monsoon: { rainfall: 40, temperature: -10, irrigation: -20 },
      drought: { rainfall: -60, temperature: 25, irrigation: 30 },
      normal: { rainfall: 0, temperature: 0, irrigation: 0 },
      heavyFarming: { rainfall: 0, temperature: 10, irrigation: 50 }
    };
    setParams(presets[preset] || presets.normal);
  };

  return (
    <div className="animate-in fade-in duration-500 container mx-auto pb-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Waves className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Climate Impact Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Model how environmental changes affect groundwater levels in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4">
           <ScenarioControls 
              params={params}
              baseline={baseline}
              updateParam={updateParam}
              applyPreset={applyPreset}
           />
        </div>

        {/* Right Panel - Visualisation */}
        <div className="lg:col-span-8 space-y-6">
           <ImpactSummaryCards 
              baseline={baseline}
              results={results}
           />
           
           <ScenarioImpactChart 
              baseline={baseline}
              results={results}
           />
        </div>
      </div>
    </div>
  );
}
