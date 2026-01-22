import React from 'react';
import { RotateCcw, CloudRain, ThermometerSun, Sprout, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const Slider = ({ label, icon: Icon, value, min, max, step, unit, onChange, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
        {value > 0 ? '+' : ''}{value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={cn(
        "w-full h-2 rounded-lg appearance-none cursor-pointer bg-secondary accent-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    />
  </div>
);

export default function ScenarioControls({ params, updateParam, applyPreset }) {
  return (
    <div className="space-y-8 bg-card border rounded-xl p-6 h-full">
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="font-semibold text-lg">Scenario Controls</h3>
        <button 
          onClick={() => applyPreset('reset')}
          className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
          title="Reset Parameters"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-6">
        <Slider
          label="Rainfall Change"
          icon={CloudRain}
          value={params.rainfall}
          min={-50} max={50} step={1}
          unit="%"
          onChange={(v) => updateParam('rainfall', v)}
          color="text-blue-500"
        />

        <Slider
          label="Temperature Rise"
          icon={ThermometerSun}
          value={params.temperature}
          min={0} max={5} step={0.1}
          unit="°C"
          onChange={(v) => updateParam('temperature', v)}
          color="text-orange-500"
        />

        <Slider
          label="Extraction Rate"
          icon={Sprout}
          value={params.extraction}
          min={-50} max={50} step={1}
          unit="%"
          onChange={(v) => updateParam('extraction', v)}
          color="text-green-600"
        />

        <Slider
          label="Population Growth"
          icon={Users}
          value={params.population}
          min={0} max={20} step={0.5}
          unit="%"
          onChange={(v) => updateParam('population', v)}
          color="text-purple-500"
        />
      </div>

      <div className="pt-6 border-t">
        <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Presets</p>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => applyPreset('drought')}
            className="text-xs px-3 py-2 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium hover:opacity-80 transition"
          >
            Extreme Drought
          </button>
          <button 
            onClick={() => applyPreset('flood')}
            className="text-xs px-3 py-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium hover:opacity-80 transition"
          >
            Heavy Monsoon
          </button>
          <button 
            onClick={() => applyPreset('policy')}
            className="text-xs px-3 py-2 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium hover:opacity-80 transition"
          >
            Conservation
          </button>
        </div>
      </div>
    </div>
  );
}
