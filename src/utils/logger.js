// Console wrapper that goes silent in production builds. Vite statically replaces
// import.meta.env.PROD with `true` for `npm run build`, so every method becomes a
// no-op and no game logging ships to players. Use this everywhere instead of
// calling console directly (see CLAUDE.md Non-Negotiable #6).
const isProd = import.meta.env.PROD;

const noop = () => {};

export const logger = {
  log: isProd ? noop : (...args) => console.log(...args),
  warn: isProd ? noop : (...args) => console.warn(...args),
  error: isProd ? noop : (...args) => console.error(...args),
};

export default logger;
