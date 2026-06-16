import Phaser from 'phaser';
import { SCENE_KEYS, GAME, MENU, FONTS, TRANSITION_TEXT } from '../config/Constants.js';

// Title screen. An animated pre-solstice sky (navy ⇄ deep purple) sits behind the
// title, with faint signal lines drifting across — the impression of transmissions
// passing through. Enter begins the game via the cinematic transition into Chapter 1.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MENU);
  }

  create() {
    this._buildBackground();
    this._buildSignalLines();
    this._buildEyebrow();
    this._buildTitle();
    this._buildPrompt();

    // `once` so a held key can't double-fire the start.
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start(SCENE_KEYS.TRANSITION, {
        text: TRANSITION_TEXT.INTRO_CH1,
        nextScene: SCENE_KEYS.CHAPTER_1,
        nextSceneData: {},
      });
    });
  }

  // --- private ---

  _buildBackground() {
    const bg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, MENU.BG_NAVY).setDepth(-10);
    const navy = Phaser.Display.Color.IntegerToColor(MENU.BG_NAVY);
    const purple = Phaser.Display.Color.IntegerToColor(MENU.BG_PURPLE);
    // Cycle navy → purple → navy over BG_CYCLE_MS via a yoyoed colour counter.
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: MENU.BG_CYCLE_MS / 2,
      yoyo: true,
      repeat: -1,
      onUpdate: (tween) => {
        const mix = Phaser.Display.Color.Interpolate.ColorWithColor(navy, purple, 100, tween.getValue());
        bg.setFillStyle(Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b));
      },
    });
  }

  _buildEyebrow() {
    this.add
      .text(GAME.WIDTH / 2, MENU.EYEBROW_Y, MENU.EYEBROW_LABEL, {
        fontFamily: FONTS.MONOSPACE,
        fontSize: MENU.EYEBROW_FONT,
        color: MENU.EYEBROW_COLOR,
        letterSpacing: MENU.EYEBROW_LETTER_SPACING,
      })
      .setOrigin(0.5);
  }

  _buildPrompt() {
    const prompt = this.add
      .text(GAME.WIDTH / 2, MENU.PROMPT_Y, MENU.PROMPT_LABEL, {
        fontFamily: FONTS.MONOSPACE,
        fontSize: MENU.PROMPT_FONT,
        color: MENU.PROMPT_COLOR,
        letterSpacing: MENU.PROMPT_LETTER_SPACING,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: prompt,
      alpha: MENU.PROMPT_BLINK_MIN,
      duration: MENU.PROMPT_BLINK_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // Faint horizontal lines drifting left→right at varied speeds and heights.
  _buildSignalLines() {
    for (let i = 0; i < MENU.SIGNAL_LINE_COUNT; i += 1) {
      const y = GAME.HEIGHT * (0.15 + 0.7 * (i / MENU.SIGNAL_LINE_COUNT)) + (i % 2) * 30;
      const line = this.add
        .rectangle(-MENU.SIGNAL_LINE_LENGTH, y, MENU.SIGNAL_LINE_LENGTH, 1 + (i % 2), MENU.SIGNAL_LINE_COLOR)
        .setOrigin(0, 0.5)
        .setAlpha(MENU.SIGNAL_LINE_ALPHA)
        .setDepth(-9);
      this.tweens.add({
        targets: line,
        x: GAME.WIDTH + MENU.SIGNAL_LINE_LENGTH,
        duration: MENU.SIGNAL_LINE_MIN_MS + (MENU.SIGNAL_LINE_MAX_MS - MENU.SIGNAL_LINE_MIN_MS) * (i / MENU.SIGNAL_LINE_COUNT),
        repeat: -1,
        delay: i * 1400,
      });
    }
  }

  _buildTitle() {
    const title = this.add
      .text(GAME.WIDTH / 2, MENU.TITLE_Y, MENU.TITLE, {
        fontFamily: FONTS.SERIF,
        fontSize: MENU.TITLE_FONT,
        fontStyle: MENU.TITLE_WEIGHT,
        color: MENU.TITLE_COLOR,
        letterSpacing: MENU.TITLE_LETTER_SPACING,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: title,
      scale: MENU.TITLE_PULSE_SCALE,
      duration: MENU.TITLE_PULSE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
