import { describe, it, expect, beforeEach } from 'vitest';
import PlayerState from './PlayerState.js';

// The canonical default shape, matching CLAUDE.md. Kept here independently so the
// tests would catch an accidental change to the production defaults.
const DEFAULTS = {
  ciphersDecoded: 0,
  decodeAccuracy: 0,
  turingChoices: [],
  citizensReached: 0,
  colorsRestored: [],
  livesLost: 0,
  chaptersCompleted: [],
  startedAt: null,
};

// PlayerState is a shared singleton — isolate every test from the last.
beforeEach(() => {
  PlayerState.reset();
});

describe('PlayerState defaults', () => {
  it('has the documented default values', () => {
    expect(PlayerState.toJSON()).toEqual(DEFAULTS);
  });
});

describe('PlayerState setters', () => {
  it('incrementCiphersDecoded increments ciphersDecoded', () => {
    PlayerState.incrementCiphersDecoded();
    PlayerState.incrementCiphersDecoded();
    expect(PlayerState.ciphersDecoded).toBe(2);
  });

  it('setDecodeAccuracy sets the value and clamps to 0–100', () => {
    PlayerState.setDecodeAccuracy(75);
    expect(PlayerState.decodeAccuracy).toBe(75);
    PlayerState.setDecodeAccuracy(150);
    expect(PlayerState.decodeAccuracy).toBe(100);
    PlayerState.setDecodeAccuracy(-5);
    expect(PlayerState.decodeAccuracy).toBe(0);
  });

  it('setDecodeAccuracy ignores non-numeric input without throwing', () => {
    PlayerState.setDecodeAccuracy(40);
    expect(() => PlayerState.setDecodeAccuracy('not a number')).not.toThrow();
    expect(PlayerState.decodeAccuracy).toBe(40);
  });

  it('addTuringChoice appends choices in order', () => {
    PlayerState.addTuringChoice('trust');
    PlayerState.addTuringChoice('doubt');
    expect(PlayerState.turingChoices).toEqual(['trust', 'doubt']);
  });

  it('addTuringChoice ignores invalid input', () => {
    PlayerState.addTuringChoice('');
    PlayerState.addTuringChoice(null);
    PlayerState.addTuringChoice(42);
    expect(PlayerState.turingChoices).toEqual([]);
  });

  it('addColorRestored appends unique colors only', () => {
    PlayerState.addColorRestored('#FF0018');
    PlayerState.addColorRestored('#FF0018');
    PlayerState.addColorRestored('#FFA52C');
    expect(PlayerState.colorsRestored).toEqual(['#FF0018', '#FFA52C']);
  });

  it('incrementCitizensReached increments citizensReached', () => {
    PlayerState.incrementCitizensReached();
    expect(PlayerState.citizensReached).toBe(1);
  });

  it('incrementLivesLost increments livesLost', () => {
    PlayerState.incrementLivesLost();
    PlayerState.incrementLivesLost();
    expect(PlayerState.livesLost).toBe(2);
  });

  it('markChapterComplete records each chapter once', () => {
    PlayerState.markChapterComplete('Chapter1Scene');
    PlayerState.markChapterComplete('Chapter1Scene');
    PlayerState.markChapterComplete('Chapter2Scene');
    expect(PlayerState.chaptersCompleted).toEqual(['Chapter1Scene', 'Chapter2Scene']);
  });

  it('markChapterComplete ignores empty input', () => {
    PlayerState.markChapterComplete('');
    PlayerState.markChapterComplete(null);
    expect(PlayerState.chaptersCompleted).toEqual([]);
  });
});

describe('PlayerState.reset', () => {
  it('restores every field to its default', () => {
    PlayerState.incrementCiphersDecoded();
    PlayerState.setDecodeAccuracy(90);
    PlayerState.addTuringChoice('trust');
    PlayerState.addColorRestored('#FF0018');
    PlayerState.incrementCitizensReached();
    PlayerState.incrementLivesLost();
    PlayerState.markChapterComplete('Chapter1Scene');

    PlayerState.reset();

    expect(PlayerState.toJSON()).toEqual(DEFAULTS);
  });

  it('gives fresh array instances on each reset', () => {
    PlayerState.addTuringChoice('trust');
    PlayerState.reset();
    expect(PlayerState.turingChoices).toEqual([]);
    PlayerState.addTuringChoice('doubt');
    expect(PlayerState.turingChoices).toEqual(['doubt']);
  });
});

describe('PlayerState.toJSON', () => {
  it('returns a plain object containing every field', () => {
    expect(Object.keys(PlayerState.toJSON()).sort()).toEqual(Object.keys(DEFAULTS).sort());
  });

  it('returns array copies, not live references', () => {
    PlayerState.addColorRestored('#FF0018');
    const json = PlayerState.toJSON();
    json.colorsRestored.push('#000000');
    expect(PlayerState.colorsRestored).toEqual(['#FF0018']);
  });

  it('does not leak methods into the serialized object', () => {
    const json = PlayerState.toJSON();
    expect(typeof json.reset).toBe('undefined');
    expect(typeof json.toJSON).toBe('undefined');
  });
});

describe('PlayerState.fromJSON', () => {
  it('merges valid data over current state', () => {
    const data = {
      ciphersDecoded: 3,
      decodeAccuracy: 88,
      turingChoices: ['trust', 'doubt'],
      citizensReached: 5,
      colorsRestored: ['#FF0018'],
      livesLost: 1,
      chaptersCompleted: ['Chapter1Scene'],
      startedAt: 1234567890,
    };
    PlayerState.fromJSON(data);
    expect(PlayerState.toJSON()).toEqual(data);
  });

  it('ignores unknown keys', () => {
    PlayerState.fromJSON({ ciphersDecoded: 2, bogusKey: 'nope' });
    expect(PlayerState.ciphersDecoded).toBe(2);
    expect('bogusKey' in PlayerState).toBe(false);
  });

  it('skips fields whose type does not match', () => {
    PlayerState.setDecodeAccuracy(50);
    PlayerState.fromJSON({ decodeAccuracy: 'high', turingChoices: 'not-an-array' });
    expect(PlayerState.decodeAccuracy).toBe(50);
    expect(PlayerState.turingChoices).toEqual([]);
  });

  it('does not throw on malformed (non-object) input', () => {
    expect(() => PlayerState.fromJSON(null)).not.toThrow();
    expect(() => PlayerState.fromJSON('garbage')).not.toThrow();
    expect(() => PlayerState.fromJSON(42)).not.toThrow();
    expect(() => PlayerState.fromJSON(undefined)).not.toThrow();
    expect(() => PlayerState.fromJSON([1, 2, 3])).not.toThrow();
  });

  it('leaves state at defaults after malformed input', () => {
    PlayerState.fromJSON('garbage');
    expect(PlayerState.toJSON()).toEqual(DEFAULTS);
  });
});
