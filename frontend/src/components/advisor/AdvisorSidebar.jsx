import React from 'react';
import { Languages, MapPin, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdvisorSidebar({ district, setDistrict, language, setLanguage, districts = [] }) {
  return (
    <div className="h-full flex flex-col gap-6">
       <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-primary font-medium">
             <MapPin className="h-4 w-4" />
             <span>Location Context</span>
          </div>
          <select 
            value={district} 
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-background border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
             <option value="">Select District</option>
             {districts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
             ))}
          </select>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
             AI recommendations will be personalized based on hydro-geological data of the selected region.
          </p>
       </div>

       <div className="p-4 bg-secondary/30 border rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-foreground font-medium">
             <Languages className="h-4 w-4" />
             <span>Language / भाषा</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
             <button
               onClick={() => setLanguage('en')}
               className={cn(
                 "flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-all border",
                 language === 'en' 
                   ? "bg-primary text-primary-foreground border-primary" 
                   : "bg-background hover:bg-secondary border-transparent" 
               )}
             >
                <span className="font-bold">A</span> English
             </button>
             <button
               onClick={() => setLanguage('hi')}
               className={cn(
                 "flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-all border",
                 language === 'hi' 
                   ? "bg-primary text-primary-foreground border-primary" 
                   : "bg-background hover:bg-secondary border-transparent" 
               )}
             >
                <Globe className="h-3 w-3" /> हिन्दी
             </button>
          </div>
       </div>

       <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Did you know?</h4>
          <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
             Drip irrigation can reduce water usage by up to 60% compared to traditional flood irrigation methods while maintaining yield.
          </p>
       </div>
    </div>
  );
}
