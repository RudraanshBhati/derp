import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function FeatureImportance({ features, loading }) {
  if (loading) return null;

  return (
    <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className="bg-card border rounded-xl p-6 shadow-sm h-full"
    >
       <h3 className="font-semibold mb-4 text-lg">Model Explainability (SHAP)</h3>
       <p className="text-sm text-muted-foreground mb-6">
          Global feature importance showing which variables most heavily influence the predictions.
       </p>
       
       <div className="h-[250px] w-full">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={features} margin={{ left: 40 }}>
               <XAxis type="number" hide />
               <YAxis 
                  dataKey="feature" 
                  type="category" 
                  width={140} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
               />
               <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }}
               />
               <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {features.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.3 + (entry.importance * 2)})`} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
       </div>
    </motion.div>
  );
}
