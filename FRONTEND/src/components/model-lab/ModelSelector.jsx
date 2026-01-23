import React from 'react';
import { Database } from 'lucide-react';

export default function ModelSelector({ models, selectedModels, onToggleModel }) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-6 h-full">
      {/* Model Selection */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
           <Database className="h-4 w-4" /> Model Selection
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select which models to compare in the visualization
        </p>
        <div className="space-y-2">
          {models.map(model => (
            <label 
              key={model.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors"
            >
               <div className="flex items-center gap-3">
                 <input 
                   type="checkbox"
                   checked={selectedModels.includes(model.id)}
                   onChange={() => onToggleModel(model.id)}
                   className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                 />
                 <div>
                   <div className="font-medium text-sm">{model.name}</div>
                   <div className="text-xs text-muted-foreground">{model.description}</div>
                 </div>
               </div>
               <div 
                 className="w-3 h-3 rounded-full shrink-0" 
                 style={{ backgroundColor: model.color }}
               />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
