import Phaser from 'phaser';
import {
  SCENE_KEYS,
  ASSET_KEYS,
  GAME,
  CHAPTER_1,
  CH1_VIEW,
  FONTS,
  TRANSITION_TEXT,
} from '../config/Constants.js';
import { radialGradientTexture } from '../utils/gradientTexture.js';
import MESSAGES from '../data/messages.js';
import CipherEngine from '../chapter1/CipherEngine.js';
import EnigmaWheel from '../chapter1/EnigmaWheel.js';
import MessageDisplay from '../chapter1/MessageDisplay.js';
import TuringNPC from '../chapter1/TuringNPC.js';
import GeminiService from '../systems/GeminiService.js';
import PlayerState from '../systems/PlayerState.js';
import SaveSystem from '../systems/SaveSystem.js';

// Chapter 1 — "The Machine." Four Vigenère puzzles: spin the wheel to build the key,
// the message decodes, Turing comments, repeat. On completion it writes the run's
// stats to PlayerState and hands off to Chapter 2.
export default class Chapter1Scene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CHAPTER_1);
  }

  create() {
    this.cameras.main.setBackgroundColor(CH1_VIEW.BG_COLOR);
    this._buildBackdrop();
    this._buildScanSweep();
    this._flash = this.add
      .rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, CH1_VIEW.DECODE_FLASH_COLOR)
      .setAlpha(0)
      .setDepth(CH1_VIEW.DEPTH_BG);

    this._indicator = this.add
      .text(GAME.WIDTH / 2, CH1_VIEW.INDICATOR_Y, '', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CH1_VIEW.INDICATOR_FONT,
        color: CH1_VIEW.INDICATOR_COLOR,
        letterSpacing: CH1_VIEW.INDICATOR_LETTER_SPACING,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(GAME.WIDTH / 2, CH1_VIEW.HELP_Y, '< > / A D  rotate     SPACE  confirm letter', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CH1_VIEW.HELP_FONT,
        color: CH1_VIEW.HELP_COLOR,
      })
      .setOrigin(0.5);

    this.messageDisplay = new MessageDisplay(this, CH1_VIEW.MESSAGE_X, CH1_VIEW.MESSAGE_Y);
    this.wheel = new EnigmaWheel(this, CH1_VIEW.WHEEL_X, CH1_VIEW.WHEEL_Y);
    this.turing = new TuringNPC(this, GeminiService);
    this.wheel.on('letter_confirmed', this._onLetterConfirmed, this);

    this._index = 0;
    this._accuracySum = 0;
    this._completed = false;

    this._audio().playChapterMusic(1);
    this.events.once('shutdown', this._onShutdown, this);
    this._loadPuzzle(0);
  }

  // --- private ---

  _audio() {
    return this.plugins.get('AudioManager') ?? this.AudioManager;
  }

  // Phosphor-night backdrop: a cold blue radial glow (light spilling from one
  // source, top-right), with a faint mint dot grid and scanlines drawn over it.
  _buildBackdrop() {
    const key = radialGradientTexture(this, ASSET_KEYS.GEN_CH1_NIGHT, GAME.WIDTH, GAME.HEIGHT, {
      x: GAME.WIDTH * CH1_VIEW.NIGHT_FOCUS_X_FRAC,
      y: GAME.HEIGHT * CH1_VIEW.NIGHT_FOCUS_Y_FRAC,
      radius: GAME.WIDTH,
    }, [
      [0, CH1_VIEW.NIGHT_TOP, 1],
      [0.46, CH1_VIEW.NIGHT_MID, 1],
      [1, CH1_VIEW.NIGHT_BOTTOM, 1],
    ]);
    this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, key).setDepth(CH1_VIEW.DEPTH_NIGHT);

    const g = this.add.graphics().setDepth(CH1_VIEW.DEPTH_BG);
    g.fillStyle(CH1_VIEW.GRID_COLOR, CH1_VIEW.GRID_ALPHA);
    for (let x = CH1_VIEW.GRID_GAP / 2; x < GAME.WIDTH; x += CH1_VIEW.GRID_GAP) {
      for (let y = CH1_VIEW.GRID_GAP / 2; y < GAME.HEIGHT; y += CH1_VIEW.GRID_GAP) {
        g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle(CH1_VIEW.SCANLINE_COLOR, CH1_VIEW.SCANLINE_ALPHA);
    for (let y = 0; y < GAME.HEIGHT; y += CH1_VIEW.SCANLINE_GAP) {
      g.fillRect(0, y, GAME.WIDTH, 1);
    }
  }

  // A soft band of phosphor light that drifts down the screen on a loop, like a
  // CRT refresh too slow to see all at once.
  _buildScanSweep() {
    const band = this.add
      .rectangle(GAME.WIDTH / 2, -CH1_VIEW.SCAN_SWEEP_HEIGHT, GAME.WIDTH, CH1_VIEW.SCAN_SWEEP_HEIGHT, CH1_VIEW.SCAN_SWEEP_COLOR, CH1_VIEW.SCAN_SWEEP_ALPHA)
      .setOrigin(0.5, 0)
      .setDepth(CH1_VIEW.DEPTH_BG);
    this.tweens.add({ targets: band, y: GAME.HEIGHT, duration: CH1_VIEW.SCAN_SWEEP_MS, repeat: -1, ease: 'Linear' });
  }

  // Brief green wash over the background on a correct decode.
  _flashBackground() {
    this._flash.setAlpha(0);
    this.tweens.add({
      targets: this._flash,
      alpha: 0.85,
      duration: CH1_VIEW.DECODE_FLASH_MS / 2,
      yoyo: true,
    });
  }

  _advance() {
    this._index += 1;
    if (this._index < CHAPTER_1.TOTAL_CIPHERS) {
      this._loadPuzzle(this._index);
    } else {
      this._completeChapter();
    }
  }

  _completeChapter() {
    if (this._completed) {
      return;
    }
    this._completed = true;
    PlayerState.setDecodeAccuracy(Math.round(this._accuracySum / CHAPTER_1.TOTAL_CIPHERS));
    PlayerState.markChapterComplete(1);
    SaveSystem.save(PlayerState);
    this.scene.start(SCENE_KEYS.TRANSITION, {
      text: TRANSITION_TEXT.CH1_TO_CH2,
      nextScene: SCENE_KEYS.CHAPTER_2,
      nextSceneData: {},
    });
  }

  _loadPuzzle(index) {
    this._engine = new CipherEngine(MESSAGES[index]);
    this.messageDisplay.setCiphertext(this._engine.getCurrentCiphertext());

    const hint = this._engine.getCurrentHint();
    this._keyLength = hint.length;
    const firstBlank = hint.indexOf('_');
    this._revealedPrefix = firstBlank === -1 ? hint : hint.slice(0, firstBlank);
    this._builtKey = this._revealedPrefix;

    this._updateHint();
    this._indicator.setText(`TRANSMISSION ${index + 1} OF ${CHAPTER_1.TOTAL_CIPHERS}`);
    this.wheel.setEnabled(true);
  }

  _onLetterConfirmed(letter) {
    if (this._completed || this._builtKey.length >= this._keyLength) {
      return;
    }
    this._builtKey += letter;
    this._updateHint();
    if (this._builtKey.length === this._keyLength) {
      this._submit();
    }
  }

  // Turing has spoken — bank accuracy, count the decode, then move on.
  async _onDecoded() {
    this._accuracySum += this._engine.getAccuracy();
    PlayerState.incrementCiphersDecoded();
    const decoded = MESSAGES[this._index].plaintext;
    await this.turing.appear(decoded, [...PlayerState.turingChoices]);
    this._advance();
  }

  _onShutdown() {
    this._audio().fadeOut();
  }

  _submit() {
    this.wheel.setEnabled(false);
    const result = this._engine.submitKey(this._builtKey);
    if (result.correct) {
      this._flashBackground();
      this._audio().playSFX(ASSET_KEYS.SFX_DECODE);
      this.messageDisplay.once('reveal_complete', this._onDecoded, this);
      this.messageDisplay.reveal(result.plaintext);
    } else {
      this.wheel.shake();
      this._builtKey = this._revealedPrefix;
      this._updateHint();
      this.wheel.setEnabled(true);
    }
  }

  // Show the key as built so far plus underscores for the letters still missing.
  _updateHint() {
    const blanks = '_'.repeat(this._keyLength - this._builtKey.length);
    this.wheel.setHint(this._builtKey + blanks);
  }
}
