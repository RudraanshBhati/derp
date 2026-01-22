import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertTriangle, CloudRain, Droplets } from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-2">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", 
          trend === 'up' ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : 
          "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend === 'up' ? 'Improving' : 'Declining'}
        </div>
      )}
    </div>
    <div className="mt-2">
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  </motion.div>
);

export default function RiskStatsCards({ stats, loading }) {
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-secondary rounded-xl" />
      ))}
    </div>;
  }

  const data = [
    {
      title: "Avg Water Level",
      value: `${stats.avgLevel} m`,
      subtext: "National Average",
      icon: Droplets,
      color: "bg-blue-500",
      trend: stats.changeRate > 0 ? 'up' : 'down',
      delay: 0.1
    },
    {
      title: "Critical Zones",
      value: stats.criticalDistricts,
      subtext: "Districts at high risk",
      icon: AlertTriangle,
      color: "bg-red-500",
      trend: null,
      delay: 0.2
    },
    {
      title: "Forecast Trend",
      value: stats.forecastTrend.charAt(0).toUpperCase() + stats.forecastTrend.slice(1),
      subtext: "next 3 months",
      icon: TrendingUp,
      color: "bg-amber-500",
      trend: stats.forecastTrend === 'improving' ? 'up' : 'down',
      delay: 0.3
    },
    {
      title: "Rainfall Index",
      value: stats.rainfallIndex,
      subtext: "Precipitation Score (0-100)",
      icon: CloudRain,
      color: "bg-cyan-500",
      trend: 'up',
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  );
}
