import React, { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { fetchModelData } from '../services/modelEngine';
import ModelSelector from '../components/model-lab/ModelSelector';
import PredictionComparisonChart from '../components/model-lab/PredictionComparisonChart';
import MetricsTable from '../components/model-lab/MetricsTable';
import FeatureImportance from '../components/model-lab/FeatureImportance';

export default function ModelLabPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedModels, setSelectedModels] = useState(['lstm', 'randomForest', 'linearRegression']); // Show all by default

  useEffect(() => {
    let mounted = true;
    
    // Simulate API Fetch
    fetchModelData().then(result => {
        if (mounted) {
            setData(result);
            setLoading(false);
        }
    });

    return () => { mounted = false; };
  }, []);

  const handleToggleModel = (id) => {
     setSelectedModels(prev => 
        prev.includes(id) 
           ? prev.filter(m => m !== id) 
           : [...prev, id]
     );
  };

  const defaultModels = data?.models || [];

  return (
    <div className="container mx-auto pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/20">
            <FlaskConical className="h-8 w-8 text-white" />
         </div>
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Model Comparison Lab</h1>
            <p className="text-muted-foreground mt-1 text-lg">
               Comparing Linear Regression, Random Forest, and LSTM performance
            </p>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
         
         {/* Left Column: Controls (1/4 width on huge screens, full on smaller) */}
         <div className="xl:col-span-1">
            <ModelSelector 
               models={defaultModels}
               selectedModels={selectedModels}
               onToggleModel={handleToggleModel}
            />
         </div>

         {/* Right Column: Visuals (3/4 width) */}
         <div className="xl:col-span-3 space-y-6">
            
            {/* Primary Chart */}
            <PredictionComparisonChart 
               data={data?.timeseries} 
               models={defaultModels} 
               selectedModels={selectedModels}
               loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Metrics Table */}
               {data && <MetricsTable metrics={data.metrics} models={defaultModels} />}
               
               {/* Feature Importance */}
               {data && <FeatureImportance features={data.featureImportance} />}
            </div>
         </div>
      </div>
    </div>
  );
}
