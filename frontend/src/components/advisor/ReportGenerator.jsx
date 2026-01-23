import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, FileBarChart, AlertCircle } from 'lucide-react';
import { generateGroundwaterReport } from '../../services/pdfGenerator';

export default function ReportGenerator({ district, language }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!district) {
      setError('Please select a district first');
      return;
    }

    setIsGenerating(true);
    setReport(null);
    setError(null);
    
    try {
      const result = await generateGroundwaterReport(district, reportType, language);
      setReport(result);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to generate report');
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
        <div className="flex items-center gap-2 text-sm">
           {report && (
             <span className="flex items-center gap-1 text-green-600 font-medium animate-in fade-in">
                <CheckCircle className="h-4 w-4" /> {report.message}
             </span>
           )}
           {error && (
             <span className="flex items-center gap-1 text-red-600 font-medium animate-in fade-in">
                <AlertCircle className="h-4 w-4" /> {error}
             </span>
           )}
           {!district && !isGenerating && (
             <span className="text-muted-foreground text-xs">Select a district to generate report</span>
           )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !district}
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
         <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">PDF Downloaded Successfully</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {report.fileName}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Check your downloads folder for the complete groundwater analysis report.
                </p>
              </div>
            </div>
         </div>
      )}
    </div>
  );
}
