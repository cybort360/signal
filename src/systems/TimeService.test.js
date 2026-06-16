import { describe, it, expect, vi, afterEach } from 'vitest';
import TimeService from './TimeService.js';

// Brightness = sum of RGB channels; warmth = the red channel. Used to assert the
// afternoon sky is both lighter and warmer than the dead of night.
function channels(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
const brightness = (hex) => {
  const { r, g, b } = channels(hex);
  return r + g + b;
};
const warmth = (hex) => channels(hex).r;

afterEach(() => {
  vi.useRealTimers();
});

describe('TimeService.isSolstice', () => {
  it('returns true when the date is June 21', () => {
    vi.useFakeTimers();
    // Months are 0-indexed: 5 = June.
    vi.setSystemTime(new Date(2026, 5, 21, 14, 0, 0));
    expect(TimeService.isSolstice()).toBe(true);
  });

  it('returns false on any other day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 20, 14, 0, 0));
    expect(TimeService.isSolstice()).toBe(false);
    vi.setSystemTime(new Date(2026, 11, 25, 0, 0, 0));
    expect(TimeService.isSolstice()).toBe(false);
    // Right day, wrong month.
    vi.setSystemTime(new Date(2026, 6, 21, 0, 0, 0));
    expect(TimeService.isSolstice()).toBe(false);
  });
});

describe('TimeService.getCurrentHour', () => {
  it('returns the current hour in 0–23', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 21, 9, 30, 0));
    expect(TimeService.getCurrentHour()).toBe(9);
  });
});

describe('TimeService.getSkyColorForHour', () => {
  it('returns a valid 6-digit hex color for every hour 0–23', () => {
    for (let h = 0; h < 24; h += 1) {
      expect(TimeService.getSkyColorForHour(h)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('returns a brighter and warmer color at 14:00 than at 02:00', () => {
    const afternoon = TimeService.getSkyColorForHour(14);
    const night = TimeService.getSkyColorForHour(2);
    expect(brightness(afternoon)).toBeGreaterThan(brightness(night));
    expect(warmth(afternoon)).toBeGreaterThan(warmth(night));
  });

  it('wraps out-of-range hours into the 0–23 cycle', () => {
    expect(TimeService.getSkyColorForHour(24)).toBe(TimeService.getSkyColorForHour(0));
    expect(TimeService.getSkyColorForHour(-1)).toBe(TimeService.getSkyColorForHour(23));
    expect(TimeService.getSkyColorForHour('not a number')).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
