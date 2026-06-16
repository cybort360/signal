import { CHAPTER_3 } from '../config/Constants.js';

// Pure, synchronous date/time utilities — no Phaser, no async, no API calls.
// SolsticeDetector wraps this for Chapter 3; nothing else should read the clock.

// A 24-entry sky palette indexed by hour. The cycle runs deep navy at midnight,
// through orange-pink at dawn (~6) and dusk (~18), peaking in the brightest,
// most golden band across the solstice afternoon (12–16, brightest at 14).
const SKY_PALETTE = [
  '#0a0a2a', // 0  midnight — deep navy
  '#0a0b2e', // 1
  '#0b0c30', // 2
  '#0e1238', // 3
  '#152348', // 4  pre-dawn
  '#3a3560', // 5  first light
  '#b5654a', // 6  dawn — orange-pink
  '#d4814f', // 7
  '#e89a55', // 8
  '#f4b25e', // 9
  '#f9c869', // 10
  '#fdda78', // 11
  '#ffe785', // 12 midday — warm gold
  '#ffec90', // 13
  '#ffee94', // 14 brightest, most golden
  '#ffe87f', // 15
  '#ffd866', // 16
  '#f0a85a', // 17 late afternoon
  '#e0705a', // 18 dusk — orange-pink
  '#b05a6a', // 19
  '#7a3f6a', // 20
  '#4a2a5a', // 21
  '#2a1a4a', // 22
  '#161139', // 23 toward midnight
];

const TimeService = {
  isSolstice() {
    const now = new Date();
    // Date months are 0-indexed, matching CHAPTER_3.SOLSTICE_MONTH (5 = June).
    return now.getMonth() === CHAPTER_3.SOLSTICE_MONTH && now.getDate() === CHAPTER_3.SOLSTICE_DAY;
  },

  getCurrentHour() {
    return new Date().getHours();
  },

  getSkyColorForHour(hour) {
    return SKY_PALETTE[TimeService._normalizeHour(hour)];
  },

  // Wrap any number into 0–23 so callers can pass arbitrary integers safely.
  _normalizeHour(hour) {
    const n = Number(hour);
    if (!Number.isFinite(n)) return 0;
    return ((Math.floor(n) % 24) + 24) % 24;
  },
};

export default TimeService;
