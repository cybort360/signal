import { GoogleGenAI } from '@google/genai';
import { GEMINI } from '../config/Constants.js';
import { PROMPTS, FALLBACKS } from '../config/GeminiConfig.js';
import logger from '../utils/logger.js';

// GeminiService is the ONLY place that touches the Gemini SDK (CLAUDE.md
// Non-Negotiable #3). Every public method is async, races the API call against a
// timeout, and returns a pre-written fallback on any failure — it never throws to
// the caller. All prompts and fallbacks come from GeminiConfig.js; all tuning
// values come from Constants.js.

// Read the key fresh each call rather than caching at module load: it keeps
// isAvailable() honest and lets tests stub the env. Vite statically replaces this
// member access in production, so it stays a constant there.
function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY;
}

let client = null; // lazily constructed GoogleGenerativeAI instance

const GeminiService = {
  isAvailable() {
    const key = getApiKey();
    return typeof key === 'string' && key.trim().length > 0;
  },

  async getTuringResponse(decodedMessage, priorChoices) {
    const choices = Array.isArray(priorChoices) ? priorChoices : [];
    if (!this.isAvailable()) {
      return this._fallback('TURING_NPC');
    }
    try {
      const prompt = PROMPTS.TURING_NPC.userTemplate(decodedMessage, choices);
      return await this._generate(PROMPTS.TURING_NPC.systemInstruction, prompt);
    } catch (error) {
      logger.error('Gemini Turing response failed; using fallback', error);
      return this._fallback('TURING_NPC');
    }
  },

  async getPersonalNarrative(playerState, isSolstice) {
    if (!this.isAvailable()) {
      return this._fallback('PERSONAL_NARRATIVE');
    }
    try {
      const prompt = PROMPTS.PERSONAL_NARRATIVE.userTemplate(playerState, isSolstice);
      return await this._generate(PROMPTS.PERSONAL_NARRATIVE.systemInstruction, prompt);
    } catch (error) {
      logger.error('Gemini personal narrative failed; using fallback', error);
      return this._fallback('PERSONAL_NARRATIVE');
    }
  },

  // --- private ---

  // Returns a random fallback so repeated failures don't read as canned.
  _fallback(type) {
    const list = FALLBACKS[type];
    return list[Math.floor(Math.random() * list.length)];
  },

  async _generate(systemInstruction, userPrompt) {
    const request = this._getClient().models.generateContent({
      model: GEMINI.MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: GEMINI.TEMPERATURE,
        maxOutputTokens: GEMINI.MAX_OUTPUT_TOKENS,
        thinkingConfig: { thinkingBudget: GEMINI.THINKING_BUDGET },
      },
    });

    // Race the call against a timeout so a slow network can't stall the game.
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini timeout')), GEMINI.API_TIMEOUT_MS);
    });

    try {
      const result = await Promise.race([request, timeout]);
      const text = result?.text;
      if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Gemini returned an empty response');
      }
      return text.trim();
    } finally {
      clearTimeout(timer);
    }
  },

  _getClient() {
    if (!client) {
      client = new GoogleGenAI({ apiKey: getApiKey() });
    }
    return client;
  },
};

export default GeminiService;
