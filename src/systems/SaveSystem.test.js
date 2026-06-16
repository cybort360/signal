import { describe, it, expect, beforeEach } from 'vitest';
import SaveSystem from './SaveSystem.js';
import PlayerState from './PlayerState.js';

const SAVE_KEY = 'signal_save';

// Minimal in-memory stand-in for the Web Storage API. The default Vitest (node)
// environment has no localStorage, so SaveSystem needs one supplied on the global.
function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

beforeEach(() => {
  globalThis.localStorage = createLocalStorageMock();
  PlayerState.reset();
});

describe('SaveSystem.save', () => {
  it('writes the serialized PlayerState to localStorage', () => {
    PlayerState.incrementCiphersDecoded();
    PlayerState.setDecodeAccuracy(80);
    PlayerState.addColorRestored('#FF0018');

    SaveSystem.save(PlayerState);

    const raw = localStorage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw)).toEqual(PlayerState.toJSON());
  });

  it('does not throw when setItem fails', () => {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded');
      },
      removeItem: () => {},
    };
    expect(() => SaveSystem.save(PlayerState)).not.toThrow();
  });
});

describe('SaveSystem.load', () => {
  it('restores state from localStorage', () => {
    PlayerState.incrementCiphersDecoded();
    PlayerState.incrementCiphersDecoded();
    PlayerState.setDecodeAccuracy(66);
    PlayerState.addTuringChoice('trust');
    PlayerState.markChapterComplete('Chapter1Scene');
    SaveSystem.save(PlayerState);
    const saved = PlayerState.toJSON();

    // Simulate a page reload: in-memory state wiped, persistence intact.
    PlayerState.reset();
    expect(PlayerState.ciphersDecoded).toBe(0);

    SaveSystem.load();

    expect(PlayerState.toJSON()).toEqual(saved);
  });

  it('resets to defaults when no save exists', () => {
    PlayerState.incrementCiphersDecoded();
    const result = SaveSystem.load();
    expect(result).toBe(PlayerState);
    expect(PlayerState.ciphersDecoded).toBe(0);
    expect(PlayerState.turingChoices).toEqual([]);
  });

  it('resets cleanly and does not throw on corrupted JSON', () => {
    localStorage.setItem(SAVE_KEY, '{ this is : not valid json ]');
    PlayerState.incrementCiphersDecoded();

    expect(() => SaveSystem.load()).not.toThrow();
    expect(PlayerState.ciphersDecoded).toBe(0);
    expect(PlayerState.turingChoices).toEqual([]);
  });

  it('resets cleanly when stored JSON is not an object', () => {
    localStorage.setItem(SAVE_KEY, '"just a string"');
    expect(() => SaveSystem.load()).not.toThrow();
    expect(PlayerState.ciphersDecoded).toBe(0);
  });

  it('does not throw when getItem fails', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(() => SaveSystem.load()).not.toThrow();
  });
});

describe('SaveSystem.clear', () => {
  it('removes the save key', () => {
    PlayerState.incrementCiphersDecoded();
    SaveSystem.save(PlayerState);
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();

    SaveSystem.clear();

    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not throw when removeItem fails', () => {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {
        throw new Error('storage blocked');
      },
    };
    expect(() => SaveSystem.clear()).not.toThrow();
  });
});
