// The four Chapter 1 cipher puzzles, hand-authored. Each plaintext reads like a
// real hidden communication between people who cannot say what they mean directly.
// `context` is what Turing reads before commenting. Difficulty rises as the hint
// count falls (2, 1, 1, 0) and the keys grow thematically: PRIDE, LIGHT, SIGNAL, TRUTH.
const MESSAGES = [
  {
    id: 1,
    key: 'PRIDE',
    plaintext: 'MEETING AT THE USUAL PLACE. BRING ONLY WHAT YOU CANNOT LEAVE BEHIND.',
    hint: 2,
    context: 'A message between two men who cannot say what they mean directly.',
  },
  {
    id: 2,
    key: 'LIGHT',
    plaintext: 'THEY ARE READING THE LETTERS NOW. BURN THIS ONCE YOU HAVE READ IT.',
    hint: 1,
    context: 'A warning sent the morning after a friend was questioned and did not return.',
  },
  {
    id: 3,
    key: 'SIGNAL',
    plaintext: 'I AM NOT WHAT THEY THINK I AM. NEITHER ARE YOU. THAT IS OUR SECRET.',
    hint: 1,
    context: 'A confession disguised as small talk, written to the one person who would understand.',
  },
  {
    id: 4,
    key: 'TRUTH',
    plaintext: 'IF I AM TAKEN, KNOW THAT I WAS NEVER ASHAMED. ONLY CAREFUL.',
    hint: 0,
    context: 'The last message, left where only the right reader would think to look.',
  },
];

export default MESSAGES;
