import React from 'react';
import { BadgeCheck, Clock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MetricsTable({ metrics, models }) {
  // Sort models by RMSE (best first)
  const sortedModelIds = Object.keys(metrics).sort((a, b) => metrics[a].rmse - metrics[b].rmse);

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-secondary/10">
         <h3 className="font-semibold">Performance Benchmarks</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground font-medium">
             <tr>
               <th className="p-3">Model Name</th>
               <th className="p-3 text-right">RMSE (m)</th>
               <th className="p-3 text-right">MAE (m)</th>
               <th className="p-3 text-right">R² Score</th>
               <th className="p-3 text-center">Latency</th>
               <th className="p-3 text-center">Version</th>
             </tr>
          </thead>
          <tbody className="divide-y">
             {sortedModelIds.map((id, index) => {
                const modelMeta = models.find(m => m.id === id);
                const stats = metrics[id];
                const isBest = index === 0;

                return (
                   <tr key={id} className={cn("hover:bg-secondary/10 transition-colors", isBest ? "bg-primary/5" : "")}>
                      <td className="p-3">
                         <div className="flex items-center gap-2">
                            <span 
                               className="w-2 h-2 rounded-full shrink-0" 
                               style={{ backgroundColor: modelMeta?.color || '#ccc' }} 
                            />
                            <span className="font-semibold">{modelMeta?.name || id}</span>
                            {isBest && <BadgeCheck className="h-4 w-4 text-green-500" />}
                         </div>
                      </td>
                      <td className="p-3 text-right font-mono">{stats.rmse}</td>
                      <td className="p-3 text-right font-mono">{stats.mae}</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                         {stats.r2}
                      </td>
                      <td className="p-3 text-center">
                         <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground bg-secondary/50 rounded-full py-1">
                            <Zap className="h-3 w-3" />
                            {stats.latency}
                         </div>
                      </td>
                      <td className="p-3 text-center text-xs font-mono text-muted-foreground">
                         {stats.version}
                      </td>
                   </tr>
                );
             })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
