import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSpeech } from '../../hooks/useSpeech';

export default function ChatInput({ onSend, language = 'en' }) {
  const [input, setInput] = React.useState('');
  const textareaRef = useRef(null);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeech();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);


  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
    resetTranscript();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeech = () => {
    if (isListening) {
      stopListening();
    } else {
      const langCode = language === 'hi' ? 'hi-IN' : 'en-US';
      resetTranscript();
      setInput(''); // Clear input when starting fresh voice command
      startListening(langCode);
    }
  };

  React.useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  return (
    <div className="relative bg-background p-4 border-t">
      <div className="relative flex items-end gap-2 bg-secondary/30 rounded-xl border p-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
        <button
          onClick={toggleSpeech}
          className={cn(
            "p-2 rounded-lg transition-colors shrink-0",
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "hover:bg-secondary text-muted-foreground"
          )}
          title={isListening ? "Stop Recording" : "Start Voice Input"}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? (language === 'hi' ? "सुन रहा हूँ..." : "Listening...") : (language === 'hi' ? "कुछ पूछें..." : "Ask a question...")}
          className="flex-1 max-h-32 min-h-[44px] w-full bg-transparent border-0 px-2 py-2.5 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none resize-none"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0 mb-0.5"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {isListening && <p className="text-xs text-center mt-2 text-muted-foreground animate-pulse">Speak now...</p>}
    </div>
  );
}
