import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, baseline, results }) => {
  if (!active || !payload || !payload[0]) return null;

  const value = payload[0].value;
  const isBaseline = payload[0].payload.name === 'Baseline';
  const change = results.waterLevel - baseline.waterLevel;
  const percentChange = ((change / baseline.waterLevel) * 100).toFixed(2);

  return (
    <div className="bg-card border rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
      <p className="text-lg font-bold text-primary">
        {value.toFixed(2)}m
      </p>
      {!isBaseline && (
        <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}m ({percentChange > 0 ? '+' : ''}{percentChange}%)
        </p>
      )}
    </div>
  );
};

export default function ScenarioImpactChart({ baseline, results }) {
  const data = [
    {
      name: 'Baseline',
      waterLevel: baseline.waterLevel,
      fill: '#3b82f6' // blue
    },
    {
      name: 'Predicted',
      waterLevel: results.waterLevel,
      fill: results.waterLevel >= baseline.waterLevel ? '#10b981' : '#ef4444' // green or red
    }
  ];

  const maxValue = Math.max(baseline.waterLevel, results.waterLevel) * 1.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border rounded-xl p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Water Level Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Before and after scenario impact
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            label={{ value: 'Water Level (meters)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
            domain={[0, maxValue]}
          />
          <Tooltip content={<CustomTooltip baseline={baseline} results={results} />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="waterLevel" 
            name="Water Level (m)"
            radius={[8, 8, 0, 0]}
            maxBarSize={120}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.name === 'Baseline' 
                    ? 'url(#blueGradient)' 
                    : entry.waterLevel >= baseline.waterLevel 
                      ? 'url(#greenGradient)' 
                      : 'url(#redGradient)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Change</div>
          <div className={`text-lg font-bold ${
            results.waterLevel >= baseline.waterLevel ? 'text-green-600' : 'text-red-600'
          }`}>
            {results.waterLevel >= baseline.waterLevel ? '+' : ''}{(results.waterLevel - baseline.waterLevel).toFixed(2)}m
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Impact</div>
          <div className={`text-lg font-bold ${
            results.waterLevel >= baseline.waterLevel ? 'text-green-600' : 'text-red-600'
          }`}>
            {(((results.waterLevel - baseline.waterLevel) / baseline.waterLevel) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Trend</div>
          <div className={`text-lg font-bold ${
            results.waterLevel >= baseline.waterLevel ? 'text-green-600' : 'text-red-600'
          }`}>
            {results.waterLevel >= baseline.waterLevel ? '↑ Rising' : '↓ Falling'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
