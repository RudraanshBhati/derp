// Gemini API Integration Template
// 
// Follow these steps to integrate Gemini API into the chatbot:

/**
 * STEP 1: Install Google Generative AI SDK
 * 
 * Run in terminal:
 * npm install @google/generative-ai
 */

/**
 * STEP 2: Set up environment variable
 * 
 * Create a .env file in frontend/ folder:
 * VITE_GEMINI_API_KEY=your_api_key_here
 * 
 * Get your API key from: https://aistudio.google.com/app/apikey
 */

/**
 * STEP 3: Create gemini-config.js file
 */

// Example: frontend/src/services/gemini-config.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateGeminiResponse = async (userMessage, contextData, language = 'en') => {
  try {
    // Build system instruction with real data
    const systemInstruction = `
You are a professional decision maker for the application 'derp. - Deep Earth Resource Prediction'.

You guide farmers and field workers using groundwater prediction results.

${contextData.context}

IMPORTANT RULES:
- Always cite the actual numbers from the data above
- If status is "Critical" → STRONGLY advise AGAINST any extraction
- If status is "Warning" → Suggest caution + monitoring
- If status is "Safe" → Approve with sustainable practices
- Keep response under 150 words
- Answer in ${language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}
- Be direct, helpful, and cite specific metrics
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * STEP 4: Update AdvisorPage.jsx
 * 
 * Replace the mock response section (line ~80-90 in AdvisorPage.jsx) with:
 */

/*
import { generateGeminiResponse } from '../services/gemini-config';

// Inside handleSendMessage function, replace the mock section:

// Get AI response from Gemini
const aiResponse = await generateGeminiResponse(text, contextData, language);

const botMsg = {
  id: Date.now() + 1,
  role: 'assistant',
  content: aiResponse,
  district: contextData.district_found,
  data: contextData.district_data,
  timestamp: new Date().toISOString()
};

setMessages(prev => [...prev, botMsg]);
*/

/**
 * STEP 5: Test the integration
 * 
 * 1. Restart the frontend: npm run dev
 * 2. Navigate to Advisor page
 * 3. Type: "Can I dig a borewell in Kaithal?"
 * 4. Check console for any errors
 * 5. Verify response uses real data
 */

/**
 * EXAMPLE FLOW:
 * 
 * User: "Can I dig a borewell in Kaithal?"
 *        ↓
 * Backend: Extracts "Kaithal" → Returns real data (11.4m depth, RMSE 1.91, Safe)
 *        ↓
 * Frontend: Receives context with real data
 *        ↓
 * Gemini: Gets system instruction + user question
 *        ↓
 * Gemini: Generates response like:
 *         "✅ Kaithal shows stable groundwater at 11.4m depth with excellent 
 *          prediction accuracy (RMSE: 1.91m). Safe to proceed with borewell 
 *          drilling. Recommended depth: 15m. Implement rainwater harvesting 
 *          for sustainability."
 */

/**
 * TROUBLESHOOTING:
 * 
 * Error: "API key not found"
 * → Check .env file exists and has VITE_GEMINI_API_KEY
 * → Restart dev server after adding .env
 * 
 * Error: "429 Quota exceeded"
 * → You've hit the free tier limit
 * → Wait or upgrade to paid plan
 * 
 * Error: "Model not found"
 * → Check model name is "gemini-2.0-flash" or "gemini-1.5-flash"
 * 
 * Response is generic/doesn't use data:
 * → Check systemInstruction includes contextData.context
 * → Verify backend is returning proper context
 */

export default {
  generateGeminiResponse
};
