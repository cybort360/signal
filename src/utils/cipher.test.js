import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, validateKey, getHint } from './cipher.js';

describe('cipher round-trip', () => {
  it('decrypt(encrypt(x)) returns the normalized plaintext', () => {
    const plain = 'MEET AT DAWN';
    const cipher = encrypt(plain, 'PRIDE');
    expect(cipher).not.toBe(plain);
    expect(decrypt(cipher, 'PRIDE')).toBe(plain);
  });

  it('normalizes lowercase input to uppercase', () => {
    const cipher = encrypt('meet at dawn', 'pride');
    expect(decrypt(cipher, 'PRIDE')).toBe('MEET AT DAWN');
  });

  it('produces a known Vigenère value', () => {
    // ATTACK + key LEMON => LXFOPV (classic textbook example).
    expect(encrypt('ATTACK', 'LEMON')).toBe('LXFOPV');
    expect(decrypt('LXFOPV', 'LEMON')).toBe('ATTACK');
  });
});

describe('punctuation and spacing', () => {
  it('preserves spaces and punctuation in place', () => {
    const plain = "BRING ONLY WHAT YOU CANNOT LEAVE BEHIND. NOW.";
    const cipher = encrypt(plain, 'LIGHT');
    // Non-letters stay exactly where they were.
    for (let i = 0; i < plain.length; i += 1) {
      if (!/[A-Z]/.test(plain[i])) {
        expect(cipher[i]).toBe(plain[i]);
      }
    }
    expect(decrypt(cipher, 'LIGHT')).toBe(plain);
  });

  it('does not consume key characters on punctuation', () => {
    // The keystream must not desync across the spaces/periods.
    const plain = 'A.A A';
    expect(decrypt(encrypt(plain, 'BC'), 'BC')).toBe('A.A A');
  });
});

describe('getHint masking', () => {
  it('reveals the first N characters and masks the rest', () => {
    expect(getHint('PRIDE', 2)).toBe('PR___');
    expect(getHint('SIGNAL', 1)).toBe('S_____');
    expect(getHint('TRUTH', 0)).toBe('_____');
  });

  it('uppercases the key before masking', () => {
    expect(getHint('light', 1)).toBe('L____');
  });
});

describe('validateKey', () => {
  it('accepts all-alpha keys', () => {
    expect(validateKey('PRIDE')).toBe(true);
    expect(validateKey('light')).toBe(true);
  });

  it('rejects keys with spaces, digits, punctuation, or empties', () => {
    expect(validateKey('PR IDE')).toBe(false);
    expect(validateKey('PR1DE')).toBe(false);
    expect(validateKey('PRIDE!')).toBe(false);
    expect(validateKey('')).toBe(false);
    expect(validateKey(null)).toBe(false);
    expect(validateKey(42)).toBe(false);
  });
});
