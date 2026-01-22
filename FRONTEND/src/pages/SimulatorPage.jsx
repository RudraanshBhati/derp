import React from 'react';
import { useSimulator } from '../hooks/useSimulator';
import ScenarioControls from '../components/simulator/ScenarioControls';
import ScenarioImpactChart from '../components/simulator/ScenarioImpactChart';
import ImpactSummaryCards from '../components/simulator/ImpactSummaryCards';
import { motion } from 'framer-motion';

export default function SimulatorPage() {
  const { params, results, isCalculating, updateParam, applyPreset } = useSimulator();

  const heatMapGrid = React.useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const randomValues = Array.from({ length: 25 }, () => Math.floor(Math.random() * 80) + 10);
    return (
      <div className="grid grid-cols-5 gap-1 mt-6 opacity-50 w-full max-w-sm">
        {randomValues.map((value, i) => (
          <div
            key={i}
            className="h-8 rounded bg-primary"
            style={{ opacity: value / 100 }}
          />
        ))}
      </div>
    );
  }, []);

  return (
    <div className="animate-in fade-in duration-500 container mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Climate Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Model impact of environmental changes on groundwater sustainability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-4">
           <ScenarioControls 
              params={params}
              updateParam={updateParam}
              applyPreset={applyPreset}
           />
        </div>

        {/* Right Panel - Visualisation */}
        <div className="lg:col-span-8 space-y-6">
           {results ? (
             <>
               <ImpactSummaryCards metrics={results.metrics} />
               
               <div className="relative">
                  {isCalculating && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                       <span className="text-sm font-medium animate-pulse bg-card px-3 py-1 rounded-full shadow border">
                          Recalculating models...
                       </span>
                    </div>
                  )}
                  <ScenarioImpactChart data={results.trend} />
               </div>

               {/* Placeholder for RiskDeltaHeatmap - using a simple visual for now */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="bg-card border rounded-xl p-6 shadow-sm h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden"
               >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-background to-background"></div>
                  <h3 className="text-lg font-semibold z-10">Risk Delta Heatmap</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2 z-10">
                    Geospatial visualization of risk variance across districts based on current simulation parameters.
                  </p>
                  {heatMapGrid}
               </motion.div>
             </>
           ) : (
             <div className="h-full flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-2">
                   <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-muted-foreground text-sm">Initializing simulation engine...</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
