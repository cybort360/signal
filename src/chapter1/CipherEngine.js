import { encrypt, decrypt, getHint } from '../utils/cipher.js';

// Holds the state of a single cipher puzzle: the encrypted message, the partial-key
// hint, and the player's attempt count. The key itself is never exposed — callers
// can only submit a guess and learn whether it decoded correctly.
export default class CipherEngine {
  constructor(message) {
    this._message = message;
    this._ciphertext = encrypt(message.plaintext, message.key);
    // The canonical decoded text, used to judge a submitted key.
    this._solution = decrypt(this._ciphertext, message.key);
    this._attempts = 0;
  }

  get attempts() {
    return this._attempts;
  }

  // Accuracy as a percentage of the ideal (one attempt). Defaults to the tracked
  // count; 1 attempt = 100%, 2 = 50%, and so on, clamped to 0–100.
  getAccuracy(attempts = this._attempts) {
    const taken = Math.max(1, attempts);
    return Math.max(0, Math.min(100, Math.round(100 / taken)));
  }

  getCurrentCiphertext() {
    return this._ciphertext;
  }

  getCurrentHint() {
    return getHint(this._message.key, this._message.hint);
  }

  // Decrypt with the player's key and report success plus the resulting text.
  submitKey(playerKey) {
    this._attempts += 1;
    const plaintext = decrypt(this._ciphertext, playerKey);
    return { correct: plaintext === this._solution, plaintext };
  }
}
