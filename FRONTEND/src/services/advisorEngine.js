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

export const generateAdvisorReport = async (districtId, type, lang = 'en') => {
  await delay(2000);
  
  const titles = {
    en: { summary: "Groundwater Situation Summary", detailed: "Comprehensive Technical Report", forecast: "Resource Availability Forecast" },
    hi: { summary: "भूजल स्थिति सारांश", detailed: "विस्तृत तकनीकी रिपोर्ट", forecast: "संसाधन उपलब्धता पूर्वानुमान" }
  };

  const sections = {
    en: [
        "Executive Review: Current water levels are operating within expected seasonal variance.",
        "Key Metrics: pH: 7.2, TDS: 450ppm, Depth: 12.5m (avg).",
        "Action Items: Recommended reduction in flood irrigation by 15%.",
        "Social Impact: No major disputes reported in the selected district."
    ],
    hi: [
        "कार्यकारी समीक्षा: वर्तमान जल स्तर अपेक्षित मौसमी विचरण के भीतर काम कर रहे हैं।",
        "प्रमुख मेट्रिक्स: पीएच: 7.2, टीडीएस: 450 पीपीएम, गहराई: 12.5 मीटर (औसत)।",
        "कार्यकारी वस्तुएं: बाढ़ सिंचाई में 15% की कमी की सिफारिश की गई।",
        "सामाजिक प्रभाव: चयनित जिले में कोई बड़ा विवाद दर्ज नहीं किया गया।"
    ]
  };

  return {
    id: `RPT-${Date.now()}`,
    title: titles[lang]?.[type] || titles['en'][type],
    date: new Date().toLocaleDateString(),
    districtId: districtId || 'Unknown',
    content: sections[lang] || sections['en'],
    type
  };
};
