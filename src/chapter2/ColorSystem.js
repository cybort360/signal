import { CHAPTER_2 } from '../config/Constants.js';

// Drives the world's greyscale-to-colour shift. It tracks which Pride colours have
// been restored and reflects that as a desaturation amount on the camera, using
// Phaser 4's built-in ColorMatrix filter (no external shaders). Zero colours = fully
// greyscale; all seven = fully saturated.
export default class ColorSystem {
  constructor() {
    this._restored = new Set();
    this._filter = null;
  }

  // Attach the desaturation filter to the scene's main camera and set it to the
  // current restoration level (fully grey at the start).
  applyToScene(scene) {
    this._filter = scene.cameras.main.filters.internal.addColorMatrix();
    this._refresh();
  }

  getRestorationPercent() {
    return (this._restored.size / CHAPTER_2.PRIDE_COLORS.length) * 100;
  }

  getRestoredColors() {
    return [...this._restored];
  }

  restoreColor(colorName) {
    this._restored.add(colorName);
    this._refresh();
  }

  // --- private ---

  // grayscale(1) = fully desaturated, grayscale(0) = full colour. Map restoration
  // percent onto that range so each colour reached brings the world a step to life.
  _refresh() {
    if (!this._filter) {
      return;
    }
    const greyAmount = 1 - this.getRestorationPercent() / 100;
    this._filter.colorMatrix.grayscale(greyAmount);
  }
}
