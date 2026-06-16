import Phaser from 'phaser';
import { CHAPTER_1, CH1_VIEW, ASSET_KEYS, FONTS } from '../config/Constants.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const STEP = (Math.PI * 2) / LETTERS.length;
const POINTER_ANGLE = -Math.PI / 2; // selected letter sits at the top

// A rotating ring of 26 letters. Arrow/A-D keys spin it one letter per press (a
// 120ms tween); Space/Enter confirms the highlighted letter. The hint row beneath
// shows the key in progress — known letters white, blanks dim grey.
export default class EnigmaWheel extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this._selectedIndex = 0;
    // Angle the ring of letters is laid out at. NOT named `_rotation` — that is
    // Phaser's internal backing field for the container's own rotation, and tweening
    // it would spin the whole container (pointer, hint, glyphs) instead of just
    // repositioning the letters. Start so the selected letter sits under the pointer.
    this._ringAngle = POINTER_ANGLE - this._selectedIndex * STEP;
    this._enabled = true;
    this._rotating = false;
    this._buildRing(scene);
    this._buildGlow(scene);
    this._letters = LETTERS.map((ch) =>
      scene.add.text(0, 0, ch, { fontFamily: FONTS.MONOSPACE, fontSize: CH1_VIEW.LETTER_FONT }).setOrigin(0.5),
    );
    this.add(this._letters);
    this._hintTexts = [];
    this._buildPointer(scene);
    this._registerInput(scene);
    this._layout();
    this._highlight();
    scene.add.existing(this);
  }

  confirmLetter() {
    if (!this._enabled) {
      return;
    }
    const audio = this.scene.plugins.get('AudioManager') ?? this.scene.AudioManager;
    audio?.playSFX(ASSET_KEYS.SFX_KEY_CLICK);
    this.emit('letter_confirmed', this.getSelectedLetter());
  }

  getSelectedLetter() {
    return LETTERS[this._selectedIndex];
  }

  setEnabled(enabled) {
    this._enabled = enabled;
  }

  // Horizontal shake to signal a wrong key — four rapid oscillations over 300ms.
  shake() {
    const baseX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: baseX - CH1_VIEW.SHAKE_OFFSET,
      duration: CH1_VIEW.SHAKE_MS / 8,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.x = baseX;
      },
    });
  }

  // Render the key-in-progress row: a letter (white) or '_' (dim) per slot.
  setHint(hintString) {
    this._hintTexts.forEach((text) => text.destroy());
    const chars = hintString.split('');
    const startX = -((chars.length - 1) * CH1_VIEW.HINT_SPACING) / 2;
    const y = CHAPTER_1.WHEEL_RADIUS + CH1_VIEW.HINT_Y_OFFSET;
    this._hintTexts = chars.map((char, i) => {
      const revealed = char !== '_';
      const text = this.scene.add
        .text(startX + i * CH1_VIEW.HINT_SPACING, y, char, {
          fontFamily: FONTS.MONOSPACE,
          fontSize: CH1_VIEW.HINT_FONT,
          color: revealed ? CH1_VIEW.HINT_REVEAL_COLOR : CH1_VIEW.HINT_BLANK_COLOR,
        })
        .setOrigin(0.5);
      this.add(text);
      return text;
    });
  }

  // --- private ---

  _buildPointer(scene) {
    const r = CHAPTER_1.WHEEL_RADIUS;
    const size = CH1_VIEW.POINTER_SIZE;
    const tip = -r + size + 6;
    const pointer = scene.add
      .triangle(0, tip, 0, size, -size, -size, size, -size, CH1_VIEW.POINTER_COLOR)
      .setDepth(CH1_VIEW.DEPTH_POINTER);
    this.add(pointer);
  }

  // Soft glow behind the selected slot (always at the top under the pointer).
  _buildGlow(scene) {
    const glow = scene.add
      .circle(0, -CHAPTER_1.WHEEL_RADIUS, CH1_VIEW.GLOW_RADIUS, CH1_VIEW.GLOW_COLOR)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.add(glow);
  }

  // Thin outer ring around the whole wheel.
  _buildRing(scene) {
    const ring = scene.add
      .circle(0, 0, CHAPTER_1.WHEEL_RADIUS)
      .setStrokeStyle(CH1_VIEW.OUTER_RING_WIDTH, CH1_VIEW.OUTER_RING_COLOR, CH1_VIEW.OUTER_RING_ALPHA);
    this.add(ring);
  }

  _highlight() {
    this._letters.forEach((text, i) => {
      const selected = i === this._selectedIndex;
      text.setColor(selected ? CH1_VIEW.SELECTED_COLOR : CH1_VIEW.LETTER_COLOR);
      text.setScale(selected ? CH1_VIEW.SELECTED_SCALE : 1);
    });
  }

  // Position every letter around the circle at the current rotation, upright.
  _layout() {
    const r = CHAPTER_1.WHEEL_RADIUS;
    this._letters.forEach((text, i) => {
      const angle = i * STEP + this._ringAngle;
      text.setPosition(Math.cos(angle) * r, Math.sin(angle) * r);
    });
  }

  _registerInput(scene) {
    const kb = scene.input.keyboard;
    kb.on('keydown-LEFT', () => this._rotate(-1));
    kb.on('keydown-A', () => this._rotate(-1));
    kb.on('keydown-RIGHT', () => this._rotate(1));
    kb.on('keydown-D', () => this._rotate(1));
    kb.on('keydown-SPACE', () => this.confirmLetter());
    kb.on('keydown-ENTER', () => this.confirmLetter());
  }

  // Step the selection by one letter and tween the ring to match. A relative tween
  // keeps the wrap from A↔Z seamless (no full-circle spin).
  _rotate(direction) {
    if (!this._enabled || this._rotating) {
      return;
    }
    this._rotating = true;
    this._selectedIndex = (this._selectedIndex + direction + LETTERS.length) % LETTERS.length;
    this._highlight();
    // addCounter, not a property tween: Phaser won't animate an arbitrary custom
    // field on a GameObject target, so drive the angle through the counter value.
    const from = this._ringAngle;
    const to = from - direction * STEP;
    this.scene.tweens.addCounter({
      from,
      to,
      duration: CH1_VIEW.ROTATE_MS,
      onUpdate: (tween) => {
        this._ringAngle = tween.getValue();
        this._layout();
      },
      onComplete: () => {
        this._ringAngle = to;
        this._layout();
        this._rotating = false;
      },
    });
  }
}
