import Phaser from 'phaser';
import { CHAPTER_3 } from '../config/Constants.js';

// A Text object that reveals its content one character at a time using Phaser's
// time system (never setInterval/setTimeout, so it pauses with the scene and is
// cleaned up automatically). Emits 'complete' when the full string is shown.
export default class TypewriterText extends Phaser.GameObjects.Text {
  constructor(scene, x, y, fullText, style) {
    super(scene, x, y, '', style);
    this._fullText = fullText ?? '';
    this._charIndex = 0;
    this._timer = null;
    this._playing = false;
  }

  isPlaying() {
    return this._playing;
  }

  // Begin (or restart) the reveal. One character is shown per `speed` ms.
  play(speed = CHAPTER_3.TYPEWRITER_SPEED_MS) {
    this._stopTimer();
    this._charIndex = 0;
    this.setText('');

    // Empty string has nothing to reveal — complete on the next tick so callers
    // can still attach a 'complete' listener after calling play().
    if (this._fullText.length === 0) {
      this._playing = true;
      this.scene.time.delayedCall(0, () => this._finish());
      return this;
    }

    this._playing = true;
    this._timer = this.scene.time.addEvent({
      delay: speed,
      repeat: this._fullText.length - 1,
      callback: this._revealNext,
      callbackScope: this,
    });
    return this;
  }

  // Show everything immediately and finish, regardless of current progress.
  skip() {
    if (!this._playing) {
      return;
    }
    this._stopTimer();
    this._charIndex = this._fullText.length;
    this.setText(this._fullText);
    this._finish();
  }

  // Stop the reveal timer when destroyed (e.g. a dialog dismissed mid-type) so it
  // can't fire setText() on an already-freed texture.
  destroy(fromScene) {
    this._stopTimer();
    super.destroy(fromScene);
  }

  // --- private ---

  _finish() {
    this._playing = false;
    this.emit('complete');
  }

  _revealNext() {
    this._charIndex += 1;
    this.setText(this._fullText.slice(0, this._charIndex));
    if (this._charIndex >= this._fullText.length) {
      this._timer = null;
      this._finish();
    }
  }

  _stopTimer() {
    if (this._timer) {
      this._timer.remove(false);
      this._timer = null;
    }
  }
}
