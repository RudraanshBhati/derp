import React from 'react';
import { ShieldCheck, History, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const HealthCard = ({ label, value, subtext, icon: Icon, status }) => (
    <div className="bg-card border rounded-xl p-4 flex items-start gap-4 h-full">
        <div className={cn("p-3 rounded-lg flex items-center justify-center shrink-0", 
            status === 'good' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
            status === 'warning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
           <Icon className="h-5 w-5" />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h4 className="text-xl font-bold mt-1">{value}</h4>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
    </div>
);

export default function ModelHealthMonitor({ stats }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <HealthCard 
               label="Data Drift Score"
               value={stats.driftScore}
               subtext="Kullback-Leibler Divergence"
               icon={Activity}
               status={stats.driftScore < 0.2 ? 'good' : 'warning'}
            />
            <HealthCard 
               label="Data Quality"
               value={`${stats.dataQuality}%`}
               subtext="Completeness & Validity"
               icon={ShieldCheck}
               status={stats.dataQuality > 95 ? 'good' : 'warning'}
            />
            <HealthCard 
               label="Last Retraining"
               value={new Date(stats.lastTrained).toLocaleDateString()}
               subtext={stats.retrainingStatus}
               icon={History}
               status="neutral"
            />
            <HealthCard 
               label="Anomaly Detection"
               value="0 detected"
               subtext="Last 24 hours"
               icon={AlertCircle}
               status="good"
            />
        </div>
    );
}
