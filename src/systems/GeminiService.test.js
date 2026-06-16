import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FALLBACKS } from '../config/GeminiConfig.js';

// Shared mock for the SDK's generateContent. vi.hoisted lets the vi.mock factory
// (which is hoisted above imports) reference it safely.
const { generateContentMock } = vi.hoisted(() => ({ generateContentMock: vi.fn() }));

vi.mock('@google/genai', () => ({
  // Must be `new`-able: GeminiService calls `new GoogleGenAI({ apiKey })` and then
  // `client.models.generateContent(...)`.
  GoogleGenAI: vi.fn(function GoogleGenAI() {
    this.models = { generateContent: generateContentMock };
  }),
}));

// Imported after the mock is declared so it binds to the mocked SDK.
import GeminiService from './GeminiService.js';

const SAMPLE_STATE = {
  ciphersDecoded: 2,
  decodeAccuracy: 80,
  citizensReached: 5,
  colorsRestored: ['#FF0018'],
  livesLost: 1,
  turingChoices: ['trust'],
};

beforeEach(() => {
  generateContentMock.mockReset();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GeminiService.isAvailable', () => {
  it('returns false when the env key is empty', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    expect(GeminiService.isAvailable()).toBe(false);
  });

  it('returns false when the env key is whitespace only', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '   ');
    expect(GeminiService.isAvailable()).toBe(false);
  });

  it('returns true when a non-empty key is present', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'a-real-looking-key');
    expect(GeminiService.isAvailable()).toBe(true);
  });
});

describe('GeminiService fallback path (no key)', () => {
  it('getTuringResponse() returns a fallback string without calling the API', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const res = await GeminiService.getTuringResponse('HELLO', []);
    expect(typeof res).toBe('string');
    expect(FALLBACKS.TURING_NPC).toContain(res);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it('getPersonalNarrative() returns a fallback string without calling the API', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const res = await GeminiService.getPersonalNarrative(SAMPLE_STATE, false);
    expect(typeof res).toBe('string');
    expect(FALLBACKS.PERSONAL_NARRATIVE).toContain(res);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it('getTuringResponse() tolerates a missing priorChoices argument', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const res = await GeminiService.getTuringResponse('HELLO');
    expect(typeof res).toBe('string');
    expect(FALLBACKS.TURING_NPC).toContain(res);
  });
});

describe('GeminiService API path (key present)', () => {
  it('getTuringResponse() returns the model text on success', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-key');
    generateContentMock.mockResolvedValue({ text: 'A decoded truth, finally read.' });
    const res = await GeminiService.getTuringResponse('HELLO', ['trust']);
    expect(res).toBe('A decoded truth, finally read.');
  });

  it('getTuringResponse() never throws and returns a fallback when the API rejects', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-key');
    generateContentMock.mockRejectedValue(new Error('network down'));
    const res = await GeminiService.getTuringResponse('HELLO', ['trust']);
    expect(typeof res).toBe('string');
    expect(FALLBACKS.TURING_NPC).toContain(res);
  });

  it('getPersonalNarrative() never throws and returns a fallback when the API rejects', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-key');
    generateContentMock.mockRejectedValue(new Error('network down'));
    const res = await GeminiService.getPersonalNarrative(SAMPLE_STATE, true);
    expect(typeof res).toBe('string');
    expect(FALLBACKS.PERSONAL_NARRATIVE).toContain(res);
  });

  it('returns a fallback when the API resolves with empty text', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-key');
    generateContentMock.mockResolvedValue({ text: '   ' });
    const res = await GeminiService.getTuringResponse('HELLO', []);
    expect(FALLBACKS.TURING_NPC).toContain(res);
  });
});
