import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getDistrictDetail } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DistrictPanel({ districts, selectedDistrict, onSelect }) {
  const [districtDetail, setDistrictDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const selected = districts.find(d => d.name === selectedDistrict);

  useEffect(() => {
    if (selectedDistrict) {
      setLoading(true);
      getDistrictDetail(selectedDistrict)
        .then(data => {
          setDistrictDetail(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch district detail:', err);
          setLoading(false);
        });
    } else {
      setDistrictDetail(null);
    }
  }, [selectedDistrict]);

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
            <option key={d.id} value={d.name}>{d.name} - {d.village}</option>
         ))}
       </select>

       <div className="flex-1 bg-secondary/30 rounded-lg p-4 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selected ? (
             <motion.div
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               key={selected.id}
               className="space-y-4"
             >
                <div className="flex justify-between items-center">
                   <div>
                     <h4 className="font-bold text-xl">{selected.name}</h4>
                     <p className="text-xs text-muted-foreground">{selected.block}, {selected.village}</p>
                   </div>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-xs font-semibold",
                     selected.status === 'Critical' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                     selected.status === 'Warning' ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" :
                     "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                   )}>
                      {selected.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-background rounded-lg border">
                        <span className="text-xs text-muted-foreground">Current Level</span>
                        <div className="font-mono font-semibold text-lg">{selected.level}m</div>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                        <span className="text-xs text-muted-foreground">Predicted</span>
                        <div className="font-mono font-semibold text-lg flex items-center gap-1">
                          {selected.predictedLevel}m
                          {selected.predictedLevel > selected.level ? 
                            <TrendingUp className="h-3 w-3 text-green-500" /> : 
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          }
                        </div>
                    </div>
                </div>

                {districtDetail && (
                  <>
                    {districtDetail.timeSeries && districtDetail.timeSeries.length > 0 && (
                      <div className="bg-background rounded-lg border p-3">
                        <div className="text-xs font-semibold mb-2">Historical Trend</div>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={districtDetail.timeSeries}>
                            <XAxis dataKey="date" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ fontSize: '12px', backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm flex gap-2 items-start">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{districtDetail.advisory}</p>
                    </div>
                  </>
                )}

                {!districtDetail && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm flex gap-2 items-start">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>
                          {selected.status === 'Critical' 
                              ? "⚠️ Immediate action required. Groundwater levels critically low. Implement water conservation measures."
                              : selected.status === 'Warning'
                              ? "⚡ Monitor closely. Water levels declining. Consider rainwater harvesting."
                              : "✅ Water levels stable. Continue sustainable practices."
                          }
                      </p>
                  </div>
                )}
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
