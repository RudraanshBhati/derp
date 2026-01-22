import React from 'react';
import { Settings, BarChart3, Database } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ModelSelector({ models, selectedModels, onToggleModel, options, onOptionChange }) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-6 h-full">
      {/* Model Selection */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
           <Database className="h-4 w-4" /> Available Models
        </h3>
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
                 <span className="font-medium text-sm">{model.name}</span>
               </div>
               <div 
                 className="w-3 h-3 rounded-full" 
                 style={{ backgroundColor: model.color }}
               />
            </label>
          ))}
        </div>
      </div>

      {/* Dataset & Config */}
      <div>
         <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" /> Configuration
         </h3>
         
         <div className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-xs font-medium">Test Dataset</label>
               <select className="w-full text-sm rounded-md border bg-background p-2">
                  <option>District A (Validation Set)</option>
                  <option>District B (Test Set)</option>
                  <option>All Districts (Holdout)</option>
               </select>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-medium">Date Range</label>
               <select className="w-full text-sm rounded-md border bg-background p-2">
                  <option>Last 30 Days</option>
                  <option>Last 60 Days</option>
                  <option>Year to Date</option>
               </select>
            </div>

            <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                   <input type="checkbox" className="rounded border-input" />
                   <span>Normalize Values</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                   <input type="checkbox" defaultChecked className="rounded border-input" />
                   <span>Show Confidence Intervals</span>
                </label>
            </div>
         </div>
      </div>
    </div>
  );
}
