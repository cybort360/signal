import Phaser from 'phaser';
import { SCENE_KEYS, ASSET_KEYS, GAME, FONTS, TRANSITION, TRANSITION_TEXT } from '../config/Constants.js';
import TypewriterText from '../ui/TypewriterText.js';
import FadeOverlay from '../ui/FadeOverlay.js';

// Reusable cinematic played between chapters. Receives { text, nextScene,
// nextSceneData } via init(). Types `text` onto a black screen, holds, fades out,
// then starts nextScene. Space/Enter skips the typewriter straight to the hold.
export default class TransitionScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TRANSITION);
  }

  init(data) {
    // Default to the Chapter 1 intro so a bare start (no data) still plays the
    // proper cinematic into Chapter 1.
    this._text = data?.text ?? TRANSITION_TEXT.INTRO_CH1;
    this._nextScene = data?.nextScene ?? SCENE_KEYS.CHAPTER_1;
    this._nextSceneData = data?.nextSceneData ?? {};
    this._advancing = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(TRANSITION.BG_COLOR);

    this._audio().playSFX(ASSET_KEYS.SFX_TRANSITION);

    this._overlay = new FadeOverlay(this);

    this._typewriter = new TypewriterText(this, GAME.WIDTH / 2, GAME.HEIGHT / 2, this._text, {
      fontFamily: FONTS.SERIF,
      fontSize: TRANSITION.TEXT_SIZE,
      color: TRANSITION.TEXT_COLOR,
      align: 'center',
      lineSpacing: TRANSITION.TEXT_LINE_SPACING,
      wordWrap: { width: TRANSITION.TEXT_WRAP },
    }).setOrigin(0.5);
    this.add.existing(this._typewriter);

    this._buildRules();
    this._typewriter.once('complete', () => this._onTextComplete());
    this._typewriter.play();

    // Skip the reveal (not the whole transition) on Space or Enter.
    this.input.keyboard.on('keydown-SPACE', this._skip, this);
    this.input.keyboard.on('keydown-ENTER', this._skip, this);
  }

  // --- private ---

  // Thin rules above and below the text block, like a documentary title card. They
  // fade in shortly after the text begins typing.
  _buildRules() {
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2;
    const rules = [cy - TRANSITION.RULE_OFFSET_Y, cy + TRANSITION.RULE_OFFSET_Y].map((y) =>
      this.add.rectangle(cx, y, TRANSITION.RULE_WIDTH, 1, TRANSITION.RULE_COLOR).setAlpha(0),
    );
    this.time.delayedCall(TRANSITION.RULE_FADE_DELAY_MS, () => {
      this.tweens.add({ targets: rules, alpha: 1, duration: TRANSITION.RULE_FADE_MS });
    });
  }

  // Phaser 4's PluginManager.get() does not resolve per-scene plugins, so fall
  // back to the scene-injected instance (mapping 'AudioManager' in GameConfig).
  _audio() {
    return this.plugins.get('AudioManager') ?? this.AudioManager;
  }

  _onTextComplete() {
    if (this._advancing) {
      return;
    }
    this._advancing = true;
    this.time.delayedCall(TRANSITION.HOLD_AFTER_MS, async () => {
      await this._overlay.fadeIn(TRANSITION.FADE_MS);
      if (this._nextScene) {
        this.scene.start(this._nextScene, this._nextSceneData);
      }
    });
  }

  _skip() {
    if (this._typewriter.isPlaying()) {
      this._typewriter.skip();
    }
  }
}
