import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/advisor/ChatMessage';
import ChatInput from '../components/advisor/ChatInput';
import AdvisorSidebar from '../components/advisor/AdvisorSidebar';
import ReportGenerator from '../components/advisor/ReportGenerator';
import { getChatbotContext, getDistrictList } from '../services/api';
import { generateGeminiResponse } from '../services/gemini-config';
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
        content: language === 'hi' 
          ? 'नमस्ते! मैं हरियाणा भूजल सलाहकार हूं। मैं आपको सिंचाई, बोरवेल खनन और जल संरक्षण के बारे में मार्गदर्शन दे सकता हूं। कृपया अपना जिला बताएं या सीधे प्रश्न पूछें।'
          : 'Hello! I\'m the Haryana Groundwater Advisor. I can help you with irrigation, borewell drilling, and water conservation decisions. Please mention your district or ask a question directly.',
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);
    };
    init();
  }, [language]);

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
      // 2. Get context from backend (extracts district, fetches real data)
      // Don't pass pre-selected district - let backend extract from each message
      const contextData = await getChatbotContext(text, null);
      
      // 3. Handle different scenarios
      if (contextData.suggestion === 'ask_for_district') {
        // No district found - ask user to specify
        const botMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: language === 'hi'
            ? `कृपया बताएं कि आप किस जिले के बारे में पूछ रहे हैं। उदाहरण के लिए: करनाल, पानीपत, हिसार, कैथल, आदि।`
            : `Please specify which district you're asking about. For example: Karnal, Panipat, Hisar, Kaithal, etc.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
      
      if (contextData.suggestion === 'district_not_found') {
        const botMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: language === 'hi'
            ? `क्षमा करें, "${contextData.district_found}" के लिए डेटा उपलब्ध नहीं है। कृपया हरियाणा का एक जिला नाम बताएं।`
            : `Sorry, no data available for "${contextData.district_found}". Please specify a district in Haryana.`,
          type: 'error',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // 4. Call Gemini API with real data context
      let aiResponse;
      
      try {
        aiResponse = await generateGeminiResponse(text, contextData, language);
        console.log("✅ Gemini response received successfully");
      } catch (geminiError) {
        console.error("❌ Gemini API error:", geminiError);
        console.error("Falling back to mock response");
        // Fallback to mock response if Gemini fails
        aiResponse = generateMockResponse(contextData, text, language);
      }
      
      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        district: contextData.district_found,
        data: contextData.district_data,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      // Update district to the one found in current message
      if (contextData.district_found) {
        setDistrict(contextData.district_found);
      }
      
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: language === 'hi'
          ? 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Sorry, an error occurred. Please try again.',
        type: 'error',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Temporary mock response generator (replace with Gemini API)
  const generateMockResponse = (contextData, userQuestion, lang) => {
    const { district_data, suggestion } = contextData;
    
    if (!district_data) return "Unable to retrieve district data.";
    
    const { district, meanActual, status } = district_data;
    
    if (lang === 'hi') {
      if (suggestion === 'critical_warning') {
        return `${district} जिला - गंभीर चेतावनी\n\nभूजल स्थिति विश्लेषण:\n• वर्तमान जल स्तर: ${meanActual} मीटर गहराई\n• जोखिम स्थिति: ${status}\n\nअनुशंसा:\nभूजल का स्तर गंभीर रूप से कम है। इस क्षेत्र में किसी भी प्रकार की नई खुदाई या बोरवेल स्थापना की अनुशंसा नहीं की जाती है। तत्काल कार्रवाई आवश्यक है।\n\nआवश्यक उपाय:\n1. मौजूदा बोरवेल से निकासी को तुरंत सीमित करें\n2. वर्षा जल संचयन प्रणाली स्थापित करें\n3. जल संरक्षण उपाय अपनाएं\n4. नियमित जल स्तर निगरानी करें`;
      } else if (suggestion === 'warning') {
        return `${district} जिला - चेतावनी\n\nभूजल स्थिति विश्लेषण:\n• वर्तमान जल स्तर: ${meanActual} मीटर गहराई\n• जोखिम स्थिति: ${status}\n\nअनुशंसा:\nजल स्तर में गिरावट देखी गई है। यदि बोरवेल खोदना आवश्यक है, तो सावधानी बरतें।\n\nसिफारिशें:\n1. बोरवेल की गहराई 15 मीटर से अधिक न करें\n2. ड्रिप सिंचाई प्रणाली का उपयोग करें\n3. मासिक जल स्तर निगरानी करें\n4. वर्षा जल संचयन लागू करें\n5. जल मीटर स्थापित करें`;
      } else {
        return `${district} जिला - सुरक्षित स्थिति\n\nभूजल स्थिति विश्लेषण:\n• वर्तमान जल स्तर: ${meanActual} मीटर गहराई\n• जोखिम स्थिति: ${status}\n\nअनुशंसा:\nभूजल स्तर स्थिर है। आप सतत प्रथाओं के साथ आगे बढ़ सकते हैं।\n\nसिफारिशें:\n1. अधिकतम बोरवेल गहराई: 15 मीटर\n2. वर्षा जल संचयन प्रणाली स्थापित करें\n3. कुशल सिंचाई विधियां अपनाएं\n4. त्रैमासिक जल स्तर निगरानी करें\n5. दीर्घकालिक स्थिरता के लिए जल बचत करें`;
      }
    }
    
    // English response
    if (suggestion === 'critical_warning') {
      return `${district} District - Critical Warning\n\nGroundwater Status Analysis:\n• Current Water Level: ${meanActual}m depth\n• Risk Status: ${status}\n\nRecommendation:\nGroundwater levels are critically low. New borewell drilling or extraction activities are NOT RECOMMENDED in this area. Immediate action is required.\n\nRequired Actions:\n1. Immediately limit extraction from existing borewells\n2. Implement rainwater harvesting systems\n3. Adopt strict water conservation measures\n4. Conduct regular water level monitoring\n5. Consult local groundwater authorities`;
    } else if (suggestion === 'warning') {
      return `${district} District - Caution Advised\n\nGroundwater Status Analysis:\n• Current Water Level: ${meanActual}m depth\n• Risk Status: ${status}\n\nRecommendation:\nWater levels show declining trend. If borewell drilling is essential, proceed with caution and follow recommendations.\n\nRecommendations:\n1. Limit borewell depth to maximum 15 meters\n2. Install drip irrigation systems\n3. Conduct monthly water level monitoring\n4. Implement rainwater harvesting\n5. Install water meters for usage tracking`;
    } else {
      return `${district} District - Safe Status\n\nGroundwater Status Analysis:\n• Current Water Level: ${meanActual}m depth\n• Risk Status: ${status}\n\nRecommendation:\nGroundwater levels are stable. You may proceed with sustainable water management practices.\n\nRecommendations:\n1. Maximum recommended borewell depth: 15 meters\n2. Install rainwater harvesting systems\n3. Use efficient irrigation methods\n4. Monitor water levels quarterly\n5. Implement water conservation for long-term sustainability`;
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] animate-in fade-in duration-500 container mx-auto pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-1 border-r pr-6 overflow-y-auto">
           <AdvisorSidebar 
              district={district}
              setDistrict={setDistrict}
              language={language}
              setLanguage={setLanguage}
              districts={districtsList}
           />
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
        
        <div className="flex-[3] flex flex-col min-h-0 bg-card border rounded-2xl shadow-sm overflow-hidden">
           
           {/* Header - Mobile Sidebar Trigger could go here */}
           <div className="p-4 border-b bg-secondary/10 flex items-center gap-3 shrink-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                 <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                 <h2 className="font-bold">.derp Advisor</h2>
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                 </p>
              </div>
           </div>

           {/* Messages List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
           <div className="shrink-0">
             <ChatInput onSend={handleSendMessage} language={language} />
           </div>
        </div>
        
        <div className="flex-[1] shrink-0">
          <ReportGenerator district={district} language={language} />
        </div>
        </div>
      </div>
    </div>
  );
}
