import React from 'react';
import { motion } from 'framer-motion';
import { Info, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DistrictPanel({ districts, selectedDistrict, onSelect }) {
  const selected = districts.find(d => d.id === parseInt(selectedDistrict));

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm h-full flex flex-col">
       <div className="mb-4">
         <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            District Analysis
         </h3>
         <p className="text-sm text-muted-foreground">Select a region to view detailed advisory</p>
       </div>

       <select 
         className="w-full p-2 mb-6 rounded-md border border-input bg-background/50 focus:ring-2 focus:ring-primary outline-none"
         value={selectedDistrict}
         onChange={(e) => onSelect(e.target.value)}
       >
         <option value="">Select District</option>
         {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
         ))}
       </select>

       <div className="flex-1 bg-secondary/30 rounded-lg p-4">
          {selected ? (
             <motion.div
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               key={selected.id}
             >
                <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-xl">{selected.name}</h4>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-xs font-semibold",
                     selected.status === 'Critical' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                     selected.status === 'Warning' ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" :
                     "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                   )}>
                      {selected.status}
                   </span>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-background rounded-lg border">
                        <span className="text-sm text-muted-foreground">Current Level</span>
                        <span className="font-mono font-semibold">{selected.level} meters</span>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm flex gap-2 items-start">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                            {selected.status === 'Critical' 
                                ? "Immediate water conservation measures recommended. Avoid new borewell digging."
                                : selected.status === 'Warning'
                                ? "Monitor levels closely. Rainwater harvesting implementation advised."
                                : "Groundwater levels are stable. Maintain current usage patterns."
                            }
                        </p>
                    </div>
                </div>
             </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                <MapPin className="h-8 w-8 mb-2 opacity-50" />
                <p>Select a district from the dropdown above to see detailed metrics and AI advice.</p>
             </div>
          )}
       </div>
    </div>
  );
}
