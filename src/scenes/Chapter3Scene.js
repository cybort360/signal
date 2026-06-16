import Phaser from 'phaser';
import { SCENE_KEYS, GAME, CHAPTER_3, CH3_VIEW, FONTS } from '../config/Constants.js';
import SolsticeDetector from '../chapter3/SolsticeDetector.js';
import SolsticeSky from '../chapter3/SolsticeSky.js';
import NarrativeEngine from '../chapter3/NarrativeEngine.js';
import SignalComposer from '../chapter3/SignalComposer.js';
import { buildSignalStar } from '../chapter3/SignalStar.js';
import GeminiService from '../systems/GeminiService.js';
import PlayerState from '../systems/PlayerState.js';
import FadeOverlay from '../ui/FadeOverlay.js';
import TypewriterText from '../ui/TypewriterText.js';

// Chapter 3 — "The Light." The emotional climax: Gemini reads the player's whole run
// and writes them a personal message, then asks what signal they will send. Their
// answer is shown back in gold before the game fades to white into the credits.
export default class Chapter3Scene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CHAPTER_3);
  }

  create() {
    const status = SolsticeDetector.getStatus();
    this._isSolstice = status.isSolstice;
    SolsticeSky.build(this);
    this._addDateLabels();

    this.narrativeEngine = new NarrativeEngine(GeminiService);
    this.composer = new SignalComposer(this);
    this._overlay = new FadeOverlay(this);
    this._overlay.setAlpha(1); // start black, then fade in

    this._audio().playChapterMusic(3);
    this.events.once('submitted', this._onSubmitted, this);
    this.events.once('shutdown', this._onShutdown, this);

    this._runSequence();
  }

  // --- private: setup ---

  _addDateLabels() {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    this.add
      .text(GAME.WIDTH / 2, CH3_VIEW.DATE_Y, today, {
        fontFamily: FONTS.SERIF,
        fontSize: CH3_VIEW.DATE_FONT,
        color: CH3_VIEW.DATE_COLOR,
      })
      .setOrigin(0.5);
    if (this._isSolstice) {
      this.add
        .text(GAME.WIDTH / 2, CH3_VIEW.SOLSTICE_Y, CH3_VIEW.SOLSTICE_LABEL, {
          fontFamily: FONTS.SERIF,
          fontSize: CH3_VIEW.SOLSTICE_FONT,
          color: CH3_VIEW.SOLSTICE_COLOR,
          fontStyle: 'italic',
        })
        .setOrigin(0.5);
    }
  }

  _audio() {
    return this.plugins.get('AudioManager') ?? this.AudioManager;
  }

  // --- private: narrative sequence ---

  async _runSequence() {
    await this._overlay.fadeOut(CH3_VIEW.FADE_IN_MS);
    const generate = this.narrativeEngine.generate(PlayerState, this._isSolstice);
    const narrative = await this._runLoading(generate);
    await this._showNarrative(narrative);
    await this._wait(CH3_VIEW.POST_NARRATIVE_MS);
    await this._showPrompt();
    await this._wait(CH3_VIEW.PRE_COMPOSER_MS);
    this.composer.show();
    this.composer.focus();
  }

  // Cycle loading lines (each ~1800ms) until the narrative promise resolves.
  async _runLoading(generate) {
    const messages = this.narrativeEngine.getLoadingMessages();
    let done = false;
    generate.then(() => {
      done = true;
    });
    let i = 0;
    while (!done) {
      const text = this._makeLoadingText(messages[i % messages.length]);
      text.play();
      await this._wait(CH3_VIEW.LOADING_MS);
      await this._fadeOutAndDestroy(text, CH3_VIEW.LOADING_FADE_MS);
      i += 1;
    }
    return generate;
  }

  _makeLoadingText(message) {
    const text = new TypewriterText(this, GAME.WIDTH / 2, CH3_VIEW.LOADING_Y, message, {
      fontFamily: FONTS.SERIF,
      fontSize: CH3_VIEW.LOADING_FONT,
      color: CH3_VIEW.LOADING_COLOR,
    }).setOrigin(0.5);
    this.add.existing(text);
    return text;
  }

  _showNarrative(narrative) {
    this._narrativeText = new TypewriterText(this, GAME.WIDTH / 2, CH3_VIEW.NARRATIVE_Y, narrative, {
      fontFamily: FONTS.SERIF,
      fontSize: CH3_VIEW.NARRATIVE_FONT,
      color: CH3_VIEW.NARRATIVE_COLOR,
      align: 'center',
      lineSpacing: CH3_VIEW.NARRATIVE_LINE_SPACING,
      wordWrap: { width: CH3_VIEW.NARRATIVE_WRAP },
    }).setOrigin(0.5, 0);
    this._narrativeText.setDepth(2);
    this._addNarrativePanel(this._narrativeText);
    this.add.existing(this._narrativeText);
    return new Promise((resolve) => {
      this._narrativeText.once('complete', resolve);
      this._narrativeText.play(CHAPTER_3.TYPEWRITER_SPEED_MS);
    });
  }

  // A faint dark panel sized to the full narrative, for legibility against the sky.
  // Measure the full text, draw the panel, then clear the text so it can type in.
  _addNarrativePanel(text) {
    text.setText(text._fullText);
    const bounds = text.getBounds();
    const pad = CH3_VIEW.NARRATIVE_PANEL_PAD;
    this._narrativePanel = this.add
      .rectangle(
        bounds.centerX,
        bounds.centerY,
        bounds.width + pad * 2,
        bounds.height + pad * 2,
        CH3_VIEW.NARRATIVE_PANEL_COLOR,
        CH3_VIEW.NARRATIVE_PANEL_ALPHA,
      )
      .setDepth(1);
    text.setText('');
  }

  _showPrompt() {
    this._promptText = this.add
      .text(GAME.WIDTH / 2, CH3_VIEW.PROMPT_Y, CH3_VIEW.PROMPT_LABEL, {
        fontFamily: FONTS.SERIF,
        fontSize: CH3_VIEW.PROMPT_FONT,
        color: CH3_VIEW.PROMPT_COLOR,
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    return new Promise((resolve) => {
      this.tweens.add({ targets: this._promptText, alpha: 1, duration: CH3_VIEW.PROMPT_FADE_MS, onComplete: resolve });
    });
  }

  // --- private: final sequence ---

  async _onSubmitted() {
    const message = this.composer.getValue();
    this.composer.hide();
    this._narrativeText?.destroy();
    this._narrativePanel?.destroy();
    this._promptText?.destroy();

    await buildSignalStar(this, message);

    await this._wait(CH3_VIEW.POST_MESSAGE_MS);
    const white = new FadeOverlay(this, CH3_VIEW.WHITE);
    await white.fadeIn(CH3_VIEW.FADE_WHITE_MS);
    this.scene.start(SCENE_KEYS.CREDITS);
  }

  _onShutdown() {
    this._audio().fadeOut();
    this.composer.hide();
  }

  // --- private: helpers ---

  _fadeOutAndDestroy(target, duration) {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: target,
        alpha: 0,
        duration,
        onComplete: () => {
          target.destroy();
          resolve();
        },
      });
    });
  }

  _wait(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
