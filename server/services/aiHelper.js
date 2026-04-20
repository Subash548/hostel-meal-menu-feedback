const { GoogleGenAI } = require('@google/genai');

// Models to try in order — if one is overloaded, fall back to the next
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/**
 * Generate content using Gemini with automatic model fallback.
 * Tries each model in order; if one returns a 503/capacity error, 
 * it seamlessly retries with the next model.
 */
async function generateWithFallback(prompt) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let lastError = null;

    for (const model of MODELS) {
        try {
            console.log(`[AI] Trying model: ${model}`);
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            console.log(`[AI] Success with model: ${model}`);
            return response.text;
        } catch (err) {
            lastError = err;
            console.warn(`[AI] Model ${model} failed with error: ${err?.message || 'Unknown error'}. Trying next fallback...`);
            continue;
        }
    }

    // All models failed
    throw lastError || new Error('All AI models are currently unavailable. Please try again later.');
}

module.exports = { generateWithFallback };
