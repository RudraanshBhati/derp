// Mock Advisory AI Engine

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ADVISORY_TEMPLATES = {
  en: {
    greeting: "Hello! I am your AquaGuard AI advisor. Select a district and ask me about groundwater levels, crop planning, or conservation tips.",
    loading: "Analyzing local hydro-geological data...",
    error: "I'm having trouble connecting to the advisory network. Please try again.",
  },
  hi: {
    greeting: "नमस्ते! मैं आपका एक्वागार्ड एआई सलाहकार हूं। एक जिला चुनें और मुझसे भूजल स्तर, फसल योजना या संरक्षण युक्तियों के बारे में पूछें।",
    loading: "स्थानीय भू-वैज्ञानिक डेटा का विश्लेषण...",
    error: "सलाहकार नेटवर्क से जुड़ने में समस्या हो रही है। कृपया पुनः प्रयास करें।",
  }
};

const MOCK_KEN = {
  'default': {
    risk: 'Moderate',
    crop: 'Millets, Pulses',
    water: 'Reduce irrigation by 10%',
    alert: 'warning'
  },
  'high_risk': {
    risk: 'Critical',
    crop: 'Drought-resistant Sorghum',
    water: 'Strict drip irrigation only',
    alert: 'critical'
  },
  'safe': {
    risk: 'Low',
    crop: 'Paddy (limited), Vegetables',
    water: 'Standard irrigation allowed',
    alert: 'safe'
  }
};

export const getSystemMessage = (key, lang = 'en') => {
  return ADVISORY_TEMPLATES[lang][key] || ADVISORY_TEMPLATES['en'][key];
};

export const generateResponse = async (query, districtId, lang = 'en') => {
  await delay(1500 + Math.random() * 1000); // Simulate thinking

  const isHindi = lang === 'hi';
  
  // Simple keyword matching for mock responses
  const q = query.toLowerCase();
  
  let type = 'text';
  let data = null;
  let text = '';

  if (q.includes('crop') || q.includes('grow') || q.includes('plant') || q.includes('फसल')) {
    type = 'advisory';
    // Randomize risk context based on district ID (mock)
    const riskProfile = districtId % 3 === 0 ? 'high_risk' : districtId % 2 === 0 ? 'safe' : 'default';
    const info = MOCK_KEN[riskProfile];
    
    data = info;
    text = isHindi 
      ? `आपके क्षेत्र (${districtId}) के लिए मेरी सिफारिशें यहाँ दी गई हैं:` 
      : `Based on current groundwater levels in District ${districtId}, here is my recommendation:`;
      
  } else if (q.includes('risk') || q.includes('level') || q.includes('water') || q.includes('स्तर')) {
    type = 'status';
    data = { level: 24.5, trend: 'declining' };
    text = isHindi
      ? "वर्तमान जल स्तर चिंताजनक है। पिछले महीने में 2 मीटर की गिरावट आई है।"
      : "Current water levels are concerning. We've observed a 2m drop in the last month.";
  } else {
    text = isHindi
      ? "मुझे यकीन नहीं है कि मैं इसे समझ पाया। क्या आप फसलों या जल स्तर के बारे में पूछ सकते हैं?"
      : "I'm not sure I understood that. Could you ask about crops, water levels, or risk status?";
  }

  return {
    id: Date.now(),
    role: 'assistant',
    type,
    content: text,
    data,
    timestamp: new Date().toISOString()
  };
};
