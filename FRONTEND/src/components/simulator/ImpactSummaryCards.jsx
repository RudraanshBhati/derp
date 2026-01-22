import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Users, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ImpactSummaryCards({ metrics }) {
  const { waterLevelChange, riskProbability, affectedPopulation } = metrics;
  
  const isPositive = waterLevelChange > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div 
        layout
        className="bg-card border rounded-xl p-4 shadow-sm"
      >
        <div className="flex justify-between items-start">
           <div>
             <p className="text-sm text-muted-foreground">Water Level Delta</p>
             <h4 className={cn("text-2xl font-bold mt-1", isPositive ? "text-green-600" : "text-red-500")}>
               {waterLevelChange > 0 ? '+' : ''}{waterLevelChange}%
             </h4>
           </div>
           <div className={cn("p-2 rounded-lg", isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
              {isPositive ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
           </div>
        </div>
      </motion.div>

      <motion.div 
        layout
        className="bg-card border rounded-xl p-4 shadow-sm"
      >
        <div className="flex justify-between items-start">
           <div>
             <p className="text-sm text-muted-foreground">Risk Probability</p>
             <h4 className="text-2xl font-bold mt-1">{riskProbability}%</h4>
             <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", riskProbability > 50 ? "bg-red-500" : "bg-yellow-500")}
                  style={{ width: `${riskProbability}%` }} 
                />
             </div>
           </div>
           <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30">
              <AlertOctagon className="h-5 w-5" />
           </div>
        </div>
      </motion.div>

      <motion.div 
        layout
        className="bg-card border rounded-xl p-4 shadow-sm"
      >
         <div className="flex justify-between items-start">
           <div>
             <p className="text-sm text-muted-foreground">Affected Population</p>
             <h4 className="text-2xl font-bold mt-1">
                {(affectedPopulation / 1000).toFixed(1)}k
             </h4>
           </div>
           <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <Users className="h-5 w-5" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
