import React from 'react';
import { CloudRain, Thermometer, Droplets, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SliderControl = ({ icon: Icon, label, param, value, min, max, unit, color, baseline, updateParam }) => (
  <motion.div 
    className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <span className={`text-lg font-bold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {value > 0 ? '+' : ''}{value}%
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => updateParam(param, Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
    />

    <div className="flex justify-between text-xs text-muted-foreground mt-2">
      <span>{min}%</span>
      <span className="font-medium">{baseline[param]}{unit}</span>
      <span>{max}%</span>
    </div>
  </motion.div>
);

export default function ScenarioControls({ params, baseline, updateParam, applyPreset }) {
  const presets = [
    { id: 'monsoon', label: '🌧️ Monsoon', desc: 'Heavy rainfall season' },
    { id: 'drought', label: '☀️ Drought', desc: 'Water scarcity scenario' },
    { id: 'heavyFarming', label: '🌾 Heavy Farming', desc: 'Intensive irrigation' },
    { id: 'normal', label: '🔄 Reset', desc: 'Baseline conditions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-xl p-5">
        <h3 className="font-semibold text-lg mb-1">Scenario Parameters</h3>
        <p className="text-sm text-muted-foreground">
          Adjust environmental factors to simulate their impact
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderControl
          icon={CloudRain}
          label="Annual Rainfall"
          param="rainfall"
          value={params.rainfall}
          min={-80}
          max={100}
          unit=" mm/year"
          color="bg-blue-500"
          baseline={baseline}
          updateParam={updateParam}
        />

        <SliderControl
          icon={Thermometer}
          label="Avg Temperature"
          param="temperature"
          value={params.temperature}
          min={-30}
          max={50}
          unit="°C"
          color="bg-orange-500"
          baseline={baseline}
          updateParam={updateParam}
        />

        <SliderControl
          icon={Droplets}
          label="Irrigation Area"
          param="irrigation"
          value={params.irrigation}
          min={-50}
          max={100}
          unit=" hectares"
          color="bg-cyan-500"
          baseline={baseline}
          updateParam={updateParam}
        />
      </div>

      {/* Presets */}
      <div className="bg-card border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Quick Scenarios</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="font-medium text-sm group-hover:text-primary transition-colors">
                {preset.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Note:</strong> This simulator uses statistical approximations. Results show directional trends and relative impacts based on historical data patterns.
        </p>
      </div>
    </div>
  );
}
