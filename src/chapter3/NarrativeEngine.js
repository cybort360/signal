import { FALLBACKS } from '../config/GeminiConfig.js';
import logger from '../utils/logger.js';

// Short, deliberate lines shown while Gemini composes the ending — meant to feel
// like the game is reading the player, not like a loading spinner.
const LOADING_MESSAGES = ['Reading your signals...', 'Tracing your path...', 'Finding your words...'];

// Chapter 3's narrative layer. It delegates the actual call to GeminiService — the
// only place allowed to touch the SDK (CLAUDE.md #3) — which builds the prompt from
// PROMPTS.PERSONAL_NARRATIVE.userTemplate. generate() never throws: any failure
// resolves to a pre-written fallback narrative.
export default class NarrativeEngine {
  constructor(geminiService) {
    this.gemini = geminiService;
  }

  getLoadingMessages() {
    return [...LOADING_MESSAGES];
  }

  async generate(playerState, isSolstice) {
    try {
      return await this.gemini.getPersonalNarrative(playerState, isSolstice);
    } catch (error) {
      // GeminiService already returns fallbacks on failure, but guard here too so
      // the chapter can rely on always receiving a string.
      logger.error('NarrativeEngine.generate failed; using fallback', error);
      const list = FALLBACKS.PERSONAL_NARRATIVE;
      return list[Math.floor(Math.random() * list.length)];
    }
  }
}
