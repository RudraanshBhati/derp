import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, AlertTriangle, CheckCircle, AlertOctagon, Sprout, Droplets } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdvisoryCard = ({ data }) => {
  const { risk, crop, water, alert } = data;
  
  const colors = {
    critical: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
    warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100",
    safe: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100"
  };

  const style = colors[alert] || colors.safe;

  return (
    <div className={cn("mt-3 p-4 rounded-xl border", style)}>
      <div className="flex items-center gap-2 mb-3 font-semibold border-b border-black/10 dark:border-white/10 pb-2">
        {alert === 'critical' ? <AlertOctagon className="h-4 w-4" /> : 
         alert === 'warning' ? <AlertTriangle className="h-4 w-4" /> : 
         <CheckCircle className="h-4 w-4" />}
        <span>Risk Assessment: {risk}</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <Sprout className="h-4 w-4 mt-0.5 opacity-70" />
          <div>
            <span className="font-medium opacity-80">Recommended Crops:</span>
            <p>{crop}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Droplets className="h-4 w-4 mt-0.5 opacity-70" />
          <div>
             <span className="font-medium opacity-80">Water Strategy:</span>
             <p>{water}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatMessage({ message }) {
  const isBot = message.role === 'assistant';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 mb-6",
        !isBot && "flex-row-reverse"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border",
        isBot 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-[85%]",
        isBot 
          ? "bg-secondary/50 rounded-tl-none border border-secondary" 
          : "bg-primary text-primary-foreground rounded-tr-none"
      )}>
        <p className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        
        {message.type === 'advisory' && message.data && (
          <AdvisoryCard data={message.data} />
        )}

        <span className="text-[10px] opacity-50 mt-2 block text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
