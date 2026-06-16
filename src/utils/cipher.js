// Pure Vigenère cipher utilities — zero Phaser dependency, fully unit-testable.
// Only A–Z are enciphered; spaces and punctuation pass through untouched and do not
// consume a key character. All inputs are normalised to uppercase first.

const ALPHA_START = 65; // 'A'
const ALPHABET_SIZE = 26;

function normalize(value) {
  return String(value).toUpperCase();
}

function isUpperAlpha(code) {
  return code >= ALPHA_START && code < ALPHA_START + ALPHABET_SIZE;
}

// Shared Vigenère pass. direction +1 encrypts, -1 decrypts. The key index only
// advances on letters, so punctuation never desyncs the keystream.
function transform(text, key, direction) {
  const source = normalize(text);
  const cipherKey = normalize(key);
  if (cipherKey.length === 0) {
    return source;
  }
  let keyIndex = 0;
  let result = '';
  for (const char of source) {
    const code = char.charCodeAt(0);
    if (!isUpperAlpha(code)) {
      result += char;
      continue;
    }
    const shift = cipherKey.charCodeAt(keyIndex % cipherKey.length) - ALPHA_START;
    const base = code - ALPHA_START;
    const next = (((base + direction * shift) % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
    result += String.fromCharCode(ALPHA_START + next);
    keyIndex += 1;
  }
  return result;
}

export function encrypt(plaintext, key) {
  return transform(plaintext, key, 1);
}

export function decrypt(ciphertext, key) {
  return transform(ciphertext, key, -1);
}

// A valid key is one or more letters with no spaces or other characters.
export function validateKey(key) {
  return typeof key === 'string' && /^[A-Za-z]+$/.test(key);
}

// Reveal the first `revealCount` key characters; mask the rest with underscores.
export function getHint(key, revealCount) {
  const normalized = normalize(key);
  let result = '';
  for (let i = 0; i < normalized.length; i += 1) {
    result += i < revealCount ? normalized[i] : '_';
  }
  return result;
}
