import React, { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, FileBarChart } from 'lucide-react';
import { generateAdvisorReport } from '../../services/advisorEngine';

export default function ReportGenerator({ district, language }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('summary');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReport(null);
    try {
      // Pass district or default to 1 if empty
      const result = await generateAdvisorReport(district || 1, reportType, language);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const labels = {
    en: {
      title: "Generate Detailed Reports",
      generate: "Generate Report",
      download: "Download PDF",
      generating: "Generating Analysis...",
      types: {
        summary: "Summary View",
        detailed: "Detailed Technical",
        forecast: "Forecasting"
      }
    },
    hi: {
      title: "विस्तृत रिपोर्ट बनाएँ",
      generate: "रिपोर्ट जनरेट करें",
      download: "PDF डाउनलोड करें",
      generating: "विश्लेषण हो रहा है...",
      types: {
        summary: "सारांश दृश्य",
        detailed: "विस्तृत तकनीकी",
        forecast: "पूर्वानुमान"
      }
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div className="bg-card border rounded-2xl shadow-sm p-6 w-full animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileBarChart className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">{t.title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {['summary', 'detailed', 'forecast'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left flex items-center justify-between
              ${reportType === type 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-background hover:bg-accent hover:border-primary/50 text-muted-foreground'
              }`}
          >
            {t.types[type]}
            {reportType === type && <CheckCircle className="h-4 w-4" />}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
           {report && (
             <span className="flex items-center gap-1 text-green-600 font-medium animate-in fade-in">
                <CheckCircle className="h-4 w-4" /> Report Ready
             </span>
           )}
        </div>
        
        <div className="flex gap-3">
          {report && (
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                <Download className="h-4 w-4" />
                {t.download}
             </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.generating}
              </>
            ) : (
                <>
                <FileText className="h-4 w-4" />
                {t.generate}
                </>
            )}
          </button>
        </div>
      </div>

      {report && (
         <div className="mt-4 p-4 bg-secondary/20 rounded-xl border border-secondary/40 animate-in slide-in-from-top-2">
            <h4 className="font-semibold mb-2">{report.title}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
               {report.content.map((line, i) => (
                 <p key={i}>• {line}</p>
               ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground/60 flex justify-between">
               <span>ID: {report.id}</span>
               <span>{report.date}</span>
            </div>
         </div>
      )}
    </div>
  );
}
