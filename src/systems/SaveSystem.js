import logger from '../utils/logger.js';
import PlayerState from './PlayerState.js';
import { STORAGE } from '../config/Constants.js';

// SaveSystem is the only thing that talks to localStorage. It serializes
// PlayerState on chapter complete and restores it on game start. Every method is
// wrapped so a failure (private mode, quota, corrupt data) never throws to the
// caller — the game stays playable even when persistence is unavailable.

const SaveSystem = {
  save(playerState) {
    try {
      const data = JSON.stringify(playerState.toJSON());
      localStorage.setItem(STORAGE.SAVE_KEY, data);
    } catch (error) {
      logger.error('SaveSystem.save failed', error);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE.SAVE_KEY);
      if (raw === null || raw === undefined) {
        logger.warn('SaveSystem.load found no save; starting fresh');
        PlayerState.reset();
        return PlayerState;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        logger.warn('SaveSystem.load found malformed save; resetting');
        PlayerState.reset();
        return PlayerState;
      }

      // Reset to a clean baseline first so a partial save merges over defaults
      // rather than over whatever happened to be in memory.
      PlayerState.reset();
      PlayerState.fromJSON(parsed);
      return PlayerState;
    } catch (error) {
      // JSON.parse failure or any unexpected localStorage error lands here.
      logger.error('SaveSystem.load failed; resetting', error);
      PlayerState.reset();
      return PlayerState;
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE.SAVE_KEY);
    } catch (error) {
      logger.error('SaveSystem.clear failed', error);
    }
  },
};

export default SaveSystem;
