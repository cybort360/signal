# SIGNAL

A three-chapter browser game about messages that refused to stay buried. Built for the DEV.to June Solstice Game Jam 2026.

Play it: https://signal-six-lyart.vercel.app

Each chapter takes a real moment in history where someone sent a signal that couldn't be stopped, and turns it into a different kind of game.

## The three chapters

**Chapter 1: The Machine (1943).** You're at Bletchley Park, breaking Vigenère ciphers on an Enigma-style wheel. The messages you decode were written by people hiding who they are. After each solve, Alan Turing reads what you found and answers back; his dialogue comes live from the Gemini API, so he reacts to the actual message instead of reciting a script.

**Chapter 2: The Word (June 19, 1865).** A side-scroller where you *are* General Order No. 3, the announcement that finally reached Texas and ended slavery there. The world starts in greyscale. Every person you reach pulls one color of the Pride flag back into it.

**Chapter 3: The Light (June 21, 2026).** The game checks the real date. Play it on the solstice and the sky renders differently. Gemini reads how you got through the first two chapters (how many ciphers you cracked, who you reached, what you said to Turing) and writes you something personal, then asks a single question: what signal will you send?

## How the AI works

Every Gemini call goes through one file, `src/systems/GeminiService.js`. Nothing else in the codebase touches the SDK. Two design choices carry the whole integration.

It never throws. Each call races a 10-second timeout, and on a slow response, an API error, or no network at all, the player gets a hand-written fallback instead of a spinner or an error screen. There are eight fallbacks per call type, written carefully enough that you won't catch the seam. Chapters 1 and 2 don't need the network; only the live Turing dialogue and the ending do.

The model is `gemini-2.5-flash-lite` with thinking disabled and output capped at 300 tokens. The writing is short, so reasoning tokens would only cost more for nothing.

## Running it locally

You'll need Node and a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). The free tier covers it easily.

```bash
npm install
cp .env.example .env      # paste your key into VITE_GEMINI_API_KEY
npm run dev
```

Vite serves the game at localhost:5173. Skip the key and it still runs; you'll just see the fallback text where the live AI would be.

```bash
npm run build      # production build into dist/
npm run preview    # serve that build
npm test           # 55 vitest tests over the cipher math, save system, and AI fallbacks
```

## Built with

Vite, Phaser 4, and `@google/genai` for Gemini. Plain ES modules otherwise; no framework and no TypeScript, since Phaser already does the job a framework would. It ships to Vercel as a static site.

Nothing is imported art. The Enigma wheel, the signal particle, the citizens, the gradient skies are all drawn at runtime with Phaser's graphics API. That keeps the bundle small and gives the game its flat, schematic look on purpose.

## One thing about the API key

Because this is a static site, the Gemini key gets compiled into the client bundle, where anyone reading the source can find it. That's a fair tradeoff for a jam build, not something to copy into production. If you fork this, lock your key to your own domain in AI Studio and rotate it once you're finished.

## Layout

Scenes sit in `src/scenes/`, one per stage of the game. Each chapter's gameplay lives in `src/chapter1/`, `src/chapter2/`, and `src/chapter3/`. Shared systems (player state, save, audio, Gemini) are under `src/systems/`. Every magic number and string in the project is defined once in `src/config/Constants.js`, and every Gemini prompt in `src/config/GeminiConfig.js`.

## License

MIT. See [LICENSE](LICENSE).
