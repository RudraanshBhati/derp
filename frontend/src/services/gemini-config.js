// Gemini API Configuration
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY not found in environment variables');
  console.error('Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate AI response using Gemini with real groundwater data context
 * 
 * @param {string} userMessage - The user's question
 * @param {object} contextData - Real-time district data from backend
 * @param {string} language - 'en' or 'hi' for English/Hindi
 * @returns {Promise<string>} AI-generated response
 */
export const generateGeminiResponse = async (userMessage, contextData, language = 'en') => {
  try {
    // Build system instruction with real data
    const systemInstruction = `
You are an expert groundwater advisor. Answer the user's question using the real data below.

REAL-TIME DATA FOR ${contextData.district_data?.district?.toUpperCase()}:
${contextData.context}

INSTRUCTIONS:
1. Start with: "${contextData.district_data?.district} has water at ${contextData.district_data?.meanActual}m depth, RMSE ${contextData.district_data?.rmse}m, Status: ${contextData.district_data?.status}."
2. Answer their EXACT question (borewell? irrigation? depth?) with YES/NO or specific advice
3. Give 2-3 actionable recommendations based on their question
4. Keep it under 150 words, conversational tone

Language: ${language === 'hi' ? 'Hindi (हिंदी में जवाब दें)' : 'English'}
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Latest Gemini 2.0 Flash model
    });

    // Include system instruction in the prompt instead
    const fullPrompt = `${systemInstruction}

User Question: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('API_KEY')) {
      throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file');
    } else if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or upgrade your plan');
    } else {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
};

export default {
  generateGeminiResponse
};
