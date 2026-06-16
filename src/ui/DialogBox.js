import Phaser from 'phaser';
import { CH1_DIALOG, FONTS } from '../config/Constants.js';

// Reusable NPC dialogue panel: dark semi-transparent backdrop, a portrait area on
// the left, a TypewriterText on the right, and optional choice buttons. Choices are
// pickable by click or number key (1/2) for keyboard play. Emits 'choice_made' with
// the chosen label. show()/hide() fade over 200ms.
export default class DialogBox extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, CH1_DIALOG.X, CH1_DIALOG.Y);
    this._choiceTexts = [];
    this._buildPanel(scene);
    this._buildPortrait(scene, config.portraitLabel);
    this._typewriter = config.typewriter;
    this._typewriter.setPosition(CH1_DIALOG.TEXT_X, CH1_DIALOG.TEXT_Y);
    this.add(this._typewriter);
    this._buildChoices(scene, config.choices ?? []);
    this.setDepth(CH1_DIALOG.DEPTH);
    this.setAlpha(0);
    this.setVisible(false);
    scene.add.existing(this);
  }

  hide() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: CH1_DIALOG.FADE_MS,
      onComplete: () => this.setVisible(false),
    });
  }

  show() {
    this.setVisible(true);
    this.scene.tweens.add({ targets: this, alpha: 1, duration: CH1_DIALOG.FADE_MS });
    this._typewriter.play();
  }

  // --- private ---

  _buildChoices(scene, labels) {
    const ys = [CH1_DIALOG.CHOICE_Y1, CH1_DIALOG.CHOICE_Y2];
    labels.forEach((label, i) => {
      const button = scene.add
        .text(CH1_DIALOG.CHOICE_X, ys[i], `${i + 1}) ${label}`, {
          fontFamily: FONTS.MONOSPACE,
          fontSize: CH1_DIALOG.CHOICE_FONT,
          color: CH1_DIALOG.CHOICE_COLOR,
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });
      button.on('pointerover', () => button.setColor(CH1_DIALOG.CHOICE_HOVER));
      button.on('pointerout', () => button.setColor(CH1_DIALOG.CHOICE_COLOR));
      button.on('pointerdown', () => this._choose(label));
      this.add(button);
      this._choiceTexts.push(button);
    });
    // Keyboard equivalents so the game stays fully playable without a mouse.
    this._onKey = (event) => this._handleKey(event, labels);
    scene.input.keyboard.on('keydown', this._onKey);
  }

  _buildPanel(scene) {
    const panel = scene.add
      .rectangle(0, 0, CH1_DIALOG.PANEL_W, CH1_DIALOG.PANEL_H, CH1_DIALOG.PANEL_COLOR, CH1_DIALOG.PANEL_ALPHA)
      .setStrokeStyle(2, CH1_DIALOG.PANEL_STROKE);
    this.add(panel);
  }

  _buildPortrait(scene, label) {
    const x = -CH1_DIALOG.PANEL_W / 2 + CH1_DIALOG.PORTRAIT_W / 2 + 28;
    const rect = scene.add.rectangle(x, 0, CH1_DIALOG.PORTRAIT_W, CH1_DIALOG.PORTRAIT_H, CH1_DIALOG.PORTRAIT_COLOR);
    const text = scene.add
      .text(x, 0, label ?? '', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CH1_DIALOG.PORTRAIT_LABEL_FONT,
        color: CH1_DIALOG.PORTRAIT_LABEL_COLOR,
      })
      .setOrigin(0.5);
    this.add([rect, text]);
  }

  _choose(label) {
    if (this._chosen) {
      return;
    }
    this._chosen = true;
    this._detachKey();
    this.emit('choice_made', label);
  }

  // Remove the global keydown listener once a choice is locked in.
  _detachKey() {
    if (this._onKey) {
      this.scene.input.keyboard.off('keydown', this._onKey);
      this._onKey = null;
    }
  }

  _handleKey(event, labels) {
    if (!this.visible || this._chosen) {
      return;
    }
    if (event.key === '1' && labels[0]) {
      this._choose(labels[0]);
    } else if (event.key === '2' && labels[1]) {
      this._choose(labels[1]);
    }
  }
}
