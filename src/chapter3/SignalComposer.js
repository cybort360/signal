import { GAME, CHAPTER_3, CH3_VIEW, FONTS } from '../config/Constants.js';

// Depth for the in-canvas counter (the DOM input renders above the canvas anyway).
const COUNTER_DEPTH = 50;

// The player's closing message. A real HTML <input> is overlaid on the canvas (not a
// Phaser text object) so screen readers and native keyboard editing work. A Phaser
// text counter beneath it tracks length. Enter on non-empty input emits 'submitted'
// on the scene's event emitter.
export default class SignalComposer {
  constructor(scene) {
    this.scene = scene;
    this._input = null;
    this._counter = null;
  }

  destroy() {
    this.hide();
  }

  focus() {
    this._input?.focus();
  }

  getValue() {
    return (this._input?.value ?? '').trim();
  }

  hide() {
    if (this._input) {
      this._input.remove();
      this._input = null;
    }
    this._counter?.destroy();
    this._counter = null;
    this.scene.scale.off('resize', this._reposition, this);
    window.removeEventListener('resize', this._boundReposition);
  }

  show() {
    this._input = this._buildInput();
    document.body.appendChild(this._input);
    this._counter = this.scene.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT * CH3_VIEW.INPUT_Y_FRACTION + CH3_VIEW.COUNTER_OFFSET_Y, '', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CH3_VIEW.COUNTER_FONT,
        color: CH3_VIEW.COUNTER_COLOR,
      })
      .setOrigin(0.5)
      .setDepth(COUNTER_DEPTH);
    this._updateCounter();

    this._input.addEventListener('input', () => this._updateCounter());
    this._input.addEventListener('keydown', (event) => this._onKeydown(event));
    this._boundReposition = () => this._reposition();
    window.addEventListener('resize', this._boundReposition);
    this.scene.scale.on('resize', this._reposition, this);
    this._reposition();
  }

  // --- private ---

  _buildInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = CHAPTER_3.MAX_SIGNAL_LENGTH;
    input.setAttribute('aria-label', CH3_VIEW.PROMPT_LABEL);
    Object.assign(input.style, {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      width: `${CH3_VIEW.INPUT_WIDTH_PX}px`,
      maxWidth: '90vw',
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${CH3_VIEW.INPUT_BORDER_COLOR}`,
      outline: 'none',
      color: CH3_VIEW.INPUT_TEXT_COLOR,
      fontFamily: FONTS.MONOSPACE,
      fontSize: `${CH3_VIEW.INPUT_FONT_PX}px`,
      textAlign: 'center',
      padding: '6px 4px',
      zIndex: '10',
    });
    return input;
  }

  _onKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    if (this.getValue().length > 0) {
      this.scene.events.emit('submitted');
    }
  }

  // Map the canvas point (centre-x, 65% height) into page coordinates, accounting
  // for the FIT scale and the canvas position, so the DOM input sits over the canvas.
  _reposition() {
    if (!this._input) {
      return;
    }
    const canvas = this.scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / GAME.WIDTH;
    const x = rect.left + window.scrollX + (GAME.WIDTH / 2) * scale;
    const y = rect.top + window.scrollY + GAME.HEIGHT * CH3_VIEW.INPUT_Y_FRACTION * scale;
    this._input.style.left = `${x}px`;
    this._input.style.top = `${y}px`;
  }

  _updateCounter() {
    const length = this._input ? this._input.value.length : 0;
    this._counter?.setText(`${length} / ${CHAPTER_3.MAX_SIGNAL_LENGTH}`);
  }
}
