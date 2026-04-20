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
            const status = err?.status || err?.httpStatusCode || err?.code;
            const msg = err?.message || '';
            // Only retry on capacity/overload errors (503, 429)
            if (status === 503 || status === 429 || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('overloaded')) {
                console.warn(`[AI] Model ${model} unavailable, trying next fallback...`);
                continue;
            }
            // For other errors, don't retry — throw immediately
            throw err;
        }
    }

    // All models failed
    throw lastError || new Error('All AI models are currently unavailable. Please try again later.');
}

module.exports = { generateWithFallback };
