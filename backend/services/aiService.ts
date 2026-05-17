import { GoogleGenAI } from '@google/genai';
import { logger } from '../config/logger';

let genAI: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are an expert Business Consultant for "ScaleUp Bharat", a platform helping people find and start verified brand, dealership, and distribution opportunities across India.

Your goal is to suggest the best opportunities based on the user's input.

Guidelines:
1. Be professional, direct, and helpful. Use Indian business context where relevant.
2. Recommend 2-3 specific brands from the provided catalog if they match the user's criteria.
3. Mention "Trust Score" as a key quality indicator when recommending.
4. If the user is unsure about location, suggest high-demand areas in Tier 2/3 cities.
5. Keep responses concise (under 150 words).
6. Never guarantee returns — use phrases like "estimated ROI" or "projected breakeven".
7. Only discuss franchise/dealership/distribution investment topics.`;

export const getBusinessConsultantResponse = async (
  userMessage: string,
  opportunityContext: any[],
  history: ChatMessage[]
): Promise<string> => {
  try {
    const ai = getGenAI();

    const context = opportunityContext.slice(0, 50).map((o) => ({
      name: o.brand_name || o.name,
      type: o.type,
      category: o.category,
      investment: o.investment_range,
      location: o.location,
      trustScore: o.trustScore,
    }));

    // Build conversation string with history
    const historyText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const fullPrompt = historyText
      ? `${historyText}\nUser: ${userMessage}`
      : userMessage;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nAvailable opportunities catalog:\n${JSON.stringify(context)}`,
      },
      contents: fullPrompt,
    });

    return response.text || "I'm sorry, I couldn't process that. Could you try rephrasing your requirements?";
  } catch (error: any) {
    logger.error('gemini_api_error', { message: error.message });
    throw error;
  }
};
