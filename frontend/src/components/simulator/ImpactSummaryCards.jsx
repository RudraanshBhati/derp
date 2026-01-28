import React from 'react';
import { TrendingUp, TrendingDown, Waves, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImpactSummaryCards({ baseline, results }) {
  // Add safety checks for undefined values
  if (!baseline || !results || baseline.waterLevel === undefined || results.waterLevel === undefined) {
    return null;
  }

  const change = results.waterLevel - baseline.waterLevel;
  const percentChange = ((change / baseline.waterLevel) * 100).toFixed(2);
  
  const getStatus = () => {
    if (results.waterLevel < 10) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: AlertTriangle };
    if (results.waterLevel < 12) return { label: 'Warning', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle };
    return { label: 'Safe', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: Waves };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const cards = [
    {
      title: 'Water Level Change',
      value: `${change > 0 ? '+' : ''}${change.toFixed(2)}m`,
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? 'text-green-600' : 'text-red-600',
      bg: change >= 0 ? 'bg-green-500' : 'bg-red-500',
      gradient: change >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'
    },
    {
      title: 'Percentage Impact',
      value: `${percentChange > 0 ? '+' : ''}${percentChange}%`,
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? 'text-green-600' : 'text-red-600',
      bg: change >= 0 ? 'bg-green-500' : 'bg-red-500',
      gradient: change >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'
    },
    {
      title: 'Predicted Level',
      value: `${results.waterLevel.toFixed(2)}m`,
      icon: Waves,
      color: 'text-blue-600',
      bg: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Water Status',
      value: status.label,
      icon: StatusIcon,
      color: status.color,
      bg: status.bg.split(' ')[0].replace('bg-', 'bg-').split('-')[0] + '-500',
      gradient: status.label === 'Critical' ? 'from-red-500 to-rose-600' : 
                status.label === 'Warning' ? 'from-orange-500 to-amber-600' : 
                'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden relative"
        >
          {/* Gradient Background on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className={`text-3xl font-bold ${card.color} mb-1`}>
              {card.value}
            </div>

            {card.title === 'Predicted Level' && (
              <div className="text-xs text-muted-foreground">
                Baseline: {baseline.waterLevel}m
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
