import React from 'react';
import { BadgeCheck, Clock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MetricsTable({ metrics, models }) {
  // Sort models by RMSE (best first)
  const sortedModelIds = Object.keys(metrics).sort((a, b) => metrics[a].rmse - metrics[b].rmse);

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-secondary/10">
         <h3 className="font-semibold">Performance Comparison</h3>
         <p className="text-xs text-muted-foreground mt-1">Sorted by RMSE (lower is better)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/30 text-muted-foreground font-medium">
             <tr>
               <th className="p-3">Model</th>
               <th className="p-3 text-right">RMSE ↓</th>
               <th className="p-3 text-right">MAE ↓</th>
               <th className="p-3 text-right">R² ↑</th>
               <th className="p-3 text-right">MAPE %</th>
               <th className="p-3 text-center">Status</th>
             </tr>
          </thead>
          <tbody className="divide-y">
             {sortedModelIds.map((id, index) => {
                const modelMeta = models.find(m => m.id === id);
                const stats = metrics[id];
                const isBest = index === 0;

                return (
                   <tr key={id} className={cn("hover:bg-secondary/10 transition-colors", isBest ? "bg-green-50 dark:bg-green-950/20" : "")}>
                      <td className="p-3">
                         <div className="flex items-center gap-2">
                            <span 
                               className="w-3 h-3 rounded-full shrink-0" 
                               style={{ backgroundColor: modelMeta?.color || '#ccc' }} 
                            />
                            <div>
                               <div className="font-semibold">{modelMeta?.name || id}</div>
                               <div className="text-xs text-muted-foreground">{modelMeta?.description}</div>
                            </div>
                            {isBest && <BadgeCheck className="h-5 w-5 text-green-500" />}
                         </div>
                      </td>
                      <td className={cn("p-3 text-right font-mono font-bold", isBest ? "text-green-600 dark:text-green-400" : "")}>
                         {stats.rmse.toFixed(2)}
                      </td>
                      <td className={cn("p-3 text-right font-mono", isBest ? "text-green-600 dark:text-green-400" : "")}>
                         {stats.mae.toFixed(2)}
                      </td>
                      <td className={cn("p-3 text-right font-mono font-bold", isBest ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400")}>
                         {stats.r2.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground">
                         {stats.mape.toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                         <div className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                            isBest ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 font-semibold" : "bg-secondary/50 text-muted-foreground"
                         )}>
                            {stats.status}
                         </div>
                      </td>
                   </tr>
                );
             })}
          </tbody>
        </table>
      </div>
      
      {/* Additional model details */}
      <div className="p-4 border-t bg-secondary/5">
         <div className="grid grid-cols-3 gap-4 text-sm">
            {sortedModelIds.map(id => {
               const modelMeta = models.find(m => m.id === id);
               const stats = metrics[id];
               return (
                  <div key={id} className="space-y-1">
                     <div className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: modelMeta?.color }} />
                        {modelMeta?.name}
                     </div>
                     <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Training: {stats.trainTime}</span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
}
