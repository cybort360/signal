import logger from '../utils/logger.js';

// PlayerState is a plain singleton object — not a class (per ARCHITECTURE.md).
// Gameplay systems mutate it directly through the setters below. It tracks
// cross-chapter progress and never resets between scenes — only on a new game.
// SaveSystem serializes it to localStorage on chapter complete.

// The canonical default shape. Mirrors the structure in CLAUDE.md exactly.
const defaultState = {
  // Chapter 1
  ciphersDecoded: 0,
  decodeAccuracy: 0,
  turingChoices: [],

  // Chapter 2
  citizensReached: 0,
  colorsRestored: [],
  livesLost: 0,

  // Meta
  chaptersCompleted: [],
  startedAt: null,
};

// Per-field validators. Used by fromJSON to accept only known, well-typed values
// so a corrupt save can never poison runtime state. startedAt is special: it is
// null by default but a numeric timestamp once a game starts.
const VALIDATORS = {
  ciphersDecoded: (v) => Number.isFinite(v),
  decodeAccuracy: (v) => Number.isFinite(v),
  turingChoices: (v) => Array.isArray(v),
  citizensReached: (v) => Number.isFinite(v),
  colorsRestored: (v) => Array.isArray(v),
  livesLost: (v) => Number.isFinite(v),
  chaptersCompleted: (v) => Array.isArray(v),
  startedAt: (v) => v === null || Number.isFinite(v),
};

// Build a fresh state with brand-new array instances so no two resets ever share
// a reference back to defaultState's arrays.
function freshState() {
  return {
    ...defaultState,
    turingChoices: [],
    colorsRestored: [],
    chaptersCompleted: [],
  };
}

const PlayerState = {
  ...freshState(),

  reset() {
    Object.assign(this, freshState());
  },

  addColorRestored(color) {
    if (typeof color !== 'string' || color.length === 0) {
      logger.warn('PlayerState.addColorRestored ignored invalid color', color);
      return;
    }
    // Each Pride color is restored once — ignore duplicates.
    if (!this.colorsRestored.includes(color)) {
      this.colorsRestored.push(color);
    }
  },

  addTuringChoice(choice) {
    if (typeof choice !== 'string' || choice.length === 0) {
      logger.warn('PlayerState.addTuringChoice ignored invalid choice', choice);
      return;
    }
    this.turingChoices.push(choice);
  },

  fromJSON(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      logger.warn('PlayerState.fromJSON ignored non-object data', data);
      return;
    }
    // Merge only known keys whose value passes its validator. Unknown keys and
    // type-mismatched values are skipped silently (logged), never thrown.
    for (const key of Object.keys(VALIDATORS)) {
      if (!(key in data)) continue;
      const incoming = data[key];
      if (!VALIDATORS[key](incoming)) {
        logger.warn('PlayerState.fromJSON skipped mismatched field', key, incoming);
        continue;
      }
      this[key] = Array.isArray(incoming) ? [...incoming] : incoming;
    }
  },

  incrementCiphersDecoded() {
    this.ciphersDecoded += 1;
  },

  incrementCitizensReached() {
    this.citizensReached += 1;
  },

  incrementLivesLost() {
    this.livesLost += 1;
  },

  markChapterComplete(chapter) {
    if (chapter === undefined || chapter === null || chapter === '') {
      logger.warn('PlayerState.markChapterComplete ignored invalid chapter', chapter);
      return;
    }
    // A chapter is recorded once even if completed again on replay.
    if (!this.chaptersCompleted.includes(chapter)) {
      this.chaptersCompleted.push(chapter);
    }
  },

  setDecodeAccuracy(pct) {
    const value = Number(pct);
    if (!Number.isFinite(value)) {
      logger.warn('PlayerState.setDecodeAccuracy ignored non-numeric input', pct);
      return;
    }
    // Accuracy is a percentage — clamp to 0–100.
    this.decodeAccuracy = Math.max(0, Math.min(100, value));
  },

  toJSON() {
    return {
      ciphersDecoded: this.ciphersDecoded,
      decodeAccuracy: this.decodeAccuracy,
      turingChoices: [...this.turingChoices],
      citizensReached: this.citizensReached,
      colorsRestored: [...this.colorsRestored],
      livesLost: this.livesLost,
      chaptersCompleted: [...this.chaptersCompleted],
      startedAt: this.startedAt,
    };
  },
};

export default PlayerState;
