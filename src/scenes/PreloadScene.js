import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, GAME, FONTS, INK } from '../config/Constants.js';
import logger from '../utils/logger.js';

const BAR_WIDTH = 400;
const BAR_HEIGHT = 4;
const BAR_FILL_MS = 700;

// Webfont families that must be ready before any scene renders text, so Phaser
// rasterizes glyphs with the real fonts rather than the fallback.
const FONT_SPECS = [
  '400 1em "IBM Plex Mono"',
  '500 1em "IBM Plex Mono"',
  '300 1em "Newsreader"',
  '400 1em "Newsreader"',
  '500 1em "Newsreader"',
  'italic 400 1em "Newsreader"',
];

// Audio assets, each as [ogg (primary), mp3 (fallback)]. Paths are resolved
// against the Vite base URL so they work under the /signal/ gh-pages base too.
const AUDIO_FILES = [
  [ASSET_KEYS.MUSIC_CH1, 'chapter1/night'],
  [ASSET_KEYS.MUSIC_CH2, 'chapter2/dawn'],
  [ASSET_KEYS.MUSIC_CH3, 'chapter3/solstice'],
  [ASSET_KEYS.SFX_KEY_CLICK, 'ui/key-click'],
  [ASSET_KEYS.SFX_DECODE, 'ui/decode'],
  [ASSET_KEYS.SFX_LIBERATION, 'ui/liberation'],
  [ASSET_KEYS.SFX_TRANSITION, 'ui/transition'],
];

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  create() {
    this.cameras.main.setBackgroundColor(INK.PAPER);
    const y = GAME.HEIGHT / 2;

    this.add
      .text(GAME.WIDTH / 2, y - 32, 'LOADING', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: '18px',
        color: INK.FAINT,
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    const fill = this.add.rectangle((GAME.WIDTH - BAR_WIDTH) / 2, y, 0, BAR_HEIGHT, 0xefe9dd).setOrigin(0, 0.5);
    this.tweens.add({ targets: fill, width: BAR_WIDTH, duration: BAR_FILL_MS, ease: 'Sine.easeInOut' });

    this._start();
  }

  // --- private ---

  // Wait for fonts, the asset loader, and a minimum bar time — then start the
  // Menu. None of these can block the game: fonts fail open, and asset load
  // errors are logged and skipped (AudioManager already no-ops on missing keys).
  async _start() {
    const minDelay = new Promise((resolve) => this.time.delayedCall(BAR_FILL_MS, resolve));
    await Promise.all([this._awaitFonts(), this._loadAssets(), minDelay]);
    this.scene.start(SCENE_KEYS.MENU);
  }

  async _awaitFonts() {
    try {
      await Promise.all([...FONT_SPECS.map((spec) => document.fonts.load(spec)), document.fonts.ready]);
    } catch (error) {
      logger.warn('PreloadScene: webfonts failed to load; using fallbacks', error);
    }
  }

  _loadAssets() {
    const base = import.meta.env.BASE_URL;
    AUDIO_FILES.forEach(([key, path]) => {
      this.load.audio(key, [`${base}audio/${path}.ogg`, `${base}audio/${path}.mp3`]);
    });
    // A failed asset is logged and skipped, never fatal.
    this.load.on('loaderror', (file) => logger.warn('PreloadScene: asset failed to load', file.key));
    return new Promise((resolve) => {
      this.load.once('complete', resolve);
      this.load.start();
    });
  }
}
