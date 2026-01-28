import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { motion } from 'framer-motion';

export default function PredictionComparisonChart({ data, models, selectedModels, loading }) {
  if (loading) return <div className="h-[400px] bg-secondary/30 animate-pulse rounded-xl" />;

  const visibleModels = models.filter(m => selectedModels.includes(m.id));
  
  // Calculate stats for selected models
  const stats = selectedModels.length > 0 ? {
    totalPredictions: data?.length || 0,
    modelsCompared: selectedModels.length,
    dateRange: data?.length > 0 ? `${data[0].date} to ${data[data.length - 1].date}` : 'N/A'
  } : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border rounded-xl p-6 h-[500px] flex flex-col"
    >
       <div className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Groundwater Level Predictions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comparing model predictions against actual water level measurements
              </p>
            </div>
            {stats && (
              <div className="flex gap-4 text-xs">
                <div className="text-right">
                  <div className="text-muted-foreground">Data Points</div>
                  <div className="font-semibold">{stats.totalPredictions}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Models</div>
                  <div className="font-semibold">{stats.modelsCompared}</div>
                </div>
              </div>
            )}
          </div>
       </div>

       <div className="flex-1 min-h-0">
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
               <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
               />
               <YAxis 
                  label={{ value: 'Water Level (meters)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['auto', 'auto']}
               />
               <Tooltip 
                  contentStyle={{ 
                     backgroundColor: 'hsl(var(--card))', 
                     borderColor: 'hsl(var(--border))', 
                     borderRadius: '8px',
                     fontSize: '12px'
                  }}
                  itemStyle={{ padding: 0 }}
                  formatter={(value) => `${value.toFixed(2)}m`}
               />
               <Legend verticalAlign="top" height={36} />
               
               {/* Actuals Line - Always visible, thick black/white */}
               <Line 
                 type="monotone" 
                 dataKey="actual" 
                 name="Actual Water Level"
                 stroke="currentColor" 
                 strokeWidth={2}
                 dot={false}
                 strokeDasharray="5 5"
                 className="text-foreground opacity-50"
               />

               {/* Dynamic Model Lines */}
               {visibleModels.map(model => (
                 <Line 
                    key={model.id}
                    type="monotone" 
                    dataKey={model.id} 
                    name={model.name}
                    stroke={model.color}
                    strokeWidth={2}
                    dot={false} 
                    activeDot={{ r: 6 }}
                 />
               ))}

               <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke="#8884d8"
                  fill="hsl(var(--background))"
                  tickFormatter={() => ""}
               />
            </LineChart>
         </ResponsiveContainer>
       </div>
    </motion.div>
  );
}
