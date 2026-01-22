import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/advisor/ChatMessage';
import ChatInput from '../components/advisor/ChatInput';
import AdvisorSidebar from '../components/advisor/AdvisorSidebar';
import { getSystemMessage, generateResponse } from '../services/advisorEngine';
import { getDistrictList } from '../services/api';
import { Bot } from 'lucide-react';

export default function AdvisorPage() {
  const [messages, setMessages] = useState([]);
  const [district, setDistrict] = useState('');
  const [language, setLanguage] = useState('en');
  const [districtsList, setDistrictsList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      const d = await getDistrictList();
      setDistrictsList(d);
      
      // Initial Greeting
      const greeting = {
        id: 'init',
        role: 'assistant',
        content: getSystemMessage('greeting', language),
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);
    };
    init();
  }, []);

  // Update greeting when language changes if it's the only message 
  // (Optional UX enhancement, kept simple here to avoid overwriting history)
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  const handleSendMessage = async (text) => {
    // 1. Add User Message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Fetch AI Response
      // Fallback to district 1 if none selected for mock purposes
      const selectedId = district || 1; 
      const response = await generateResponse(text, selectedId, language);
      
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const errorMsg = {
        id: Date.now(),
        role: 'assistant',
        content: getSystemMessage('error', language),
        type: 'error',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] animate-in fade-in duration-500 container mx-auto pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-1 border-r pr-6">
           <AdvisorSidebar 
              district={district}
              setDistrict={setDistrict}
              language={language}
              setLanguage={setLanguage}
              districts={districtsList}
           />
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full bg-card border rounded-2xl shadow-sm overflow-hidden relative">
           
           {/* Header - Mobile Sidebar Trigger could go here */}
           <div className="p-4 border-b bg-secondary/10 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                 <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                 <h2 className="font-bold">AquaGuard Advisor</h2>
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                 </p>
              </div>
           </div>

           {/* Messages List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex gap-3 mb-4 animate-pulse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-secondary/50 rounded-2xl px-4 py-3 rounded-tl-none border border-secondary flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce delay-75"></span>
                     <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce delay-150"></span>
                     <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce delay-300"></span>
                  </div>
               </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <ChatInput onSend={handleSendMessage} language={language} />
        </div>
      </div>
    </div>
  );
}
