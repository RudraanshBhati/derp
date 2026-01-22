import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function ScenarioImpactChart({ data }) {
  const [timeHorizon, setTimeHorizon] = useState(12);

  const displayData = data.slice(0, timeHorizon);

  return (
    <motion.div 
      layout
      className="bg-card border rounded-xl p-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-lg font-semibold">Impact Visualization</h3>
           <p className="text-sm text-muted-foreground">Comparative Analysis (Baseline vs Scenario)</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg">
           {[3, 6, 12].map(months => (
             <button
               key={months}
               onClick={() => setTimeHorizon(months)}
               className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                 timeHorizon === months 
                   ? 'bg-background shadow text-primary' 
                   : 'text-muted-foreground hover:text-foreground'
               }`}
             >
               {months}M
             </button>
           ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="splitColorBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="splitColorScen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
               contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
               itemStyle={{ fontSize: '12px' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area 
               name="Baseline"
               type="monotone" 
               dataKey="baseline" 
               stroke="#94a3b8" 
               fill="url(#splitColorBase)" 
               strokeWidth={2}
               strokeDasharray="5 5"
            />
            <Area 
               name="Scenario"
               type="monotone" 
               dataKey="scenario" 
               stroke="#3b82f6" 
               fill="url(#splitColorScen)" 
               strokeWidth={2} 
               isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
