import Phaser from 'phaser';
import { GAME, UI } from '../config/Constants.js';

// A full-screen rectangle used to fade scenes in and out. Black by default; pass a
// color (e.g. 0xffffff for the solstice fade-to-white). It adds itself to the scene
// and sits above all other content. Starts transparent (alpha 0); call fadeIn() to
// cover the screen, fadeOut() to clear it. Both return a Promise that resolves when
// the tween completes, so sequences can await them.
export default class FadeOverlay extends Phaser.GameObjects.Rectangle {
  constructor(scene, color = 0x000000) {
    super(scene, GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, color);
    this.setDepth(UI.FADE_OVERLAY_DEPTH);
    this.setAlpha(0);
    scene.add.existing(this);
  }

  // Fade to fully opaque (cover the screen).
  fadeIn(duration) {
    return this._tweenAlpha(1, duration);
  }

  // Fade back to transparent (reveal the scene).
  fadeOut(duration) {
    return this._tweenAlpha(0, duration);
  }

  // --- private ---

  _tweenAlpha(alpha, duration) {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        alpha,
        duration,
        onComplete: () => resolve(),
      });
    });
  }
}
