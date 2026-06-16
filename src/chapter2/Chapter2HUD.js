import Phaser from 'phaser';
import { GAME, CHAPTER_2, CH2_VIEW, CH2_HUD } from '../config/Constants.js';

// Fixed overlay for Chapter 2. Lives are small signal dots (top-left); the citizens
// counter is the Pride spectrum as small circles (top-right) — grey until restored,
// colored when reached. Both anchored 20px from their edges, above the world.
export default class Chapter2HUD {
  constructor(scene) {
    this.scene = scene;
    this._lifeDots = this._buildLifeDots();
    this._prideDots = this._buildPrideDots();
  }

  // Light the first `count` life dots; dim the rest.
  setLives(count) {
    this._lifeDots.forEach((dot, i) => {
      dot.setFillStyle(i < count ? CH2_HUD.LIFE_DOT_COLOR : CH2_HUD.LIFE_DOT_EMPTY);
    });
  }

  // Color each Pride dot whose colour has been restored.
  refreshPride(restoredColors) {
    CHAPTER_2.PRIDE_COLORS.forEach((color, i) => {
      const restored = restoredColors.includes(color);
      const fill = restored ? Phaser.Display.Color.HexStringToColor(color).color : CH2_HUD.PRIDE_EMPTY_COLOR;
      this._prideDots[i].setFillStyle(fill);
    });
  }

  // --- private ---

  _buildLifeDots() {
    const y = CH2_HUD.PADDING + CH2_HUD.LIFE_DOT_RADIUS;
    const dots = [];
    for (let i = 0; i < CHAPTER_2.TOTAL_LIVES; i += 1) {
      const x = CH2_HUD.PADDING + CH2_HUD.LIFE_DOT_RADIUS + i * CH2_HUD.LIFE_DOT_GAP;
      dots.push(this._dot(x, y, CH2_HUD.LIFE_DOT_COLOR));
    }
    return dots;
  }

  _buildPrideDots() {
    const colors = CHAPTER_2.PRIDE_COLORS;
    const y = CH2_HUD.PADDING + CH2_HUD.PRIDE_DOT_RADIUS;
    const right = GAME.WIDTH - CH2_HUD.PADDING - CH2_HUD.PRIDE_DOT_RADIUS;
    return colors.map((_, i) => {
      const x = right - (colors.length - 1 - i) * CH2_HUD.PRIDE_DOT_GAP;
      return this._dot(x, y, CH2_HUD.PRIDE_EMPTY_COLOR);
    });
  }

  _dot(x, y, color) {
    return this.scene.add
      .circle(x, y, CH2_HUD.LIFE_DOT_RADIUS, color)
      .setScrollFactor(0)
      .setDepth(CH2_VIEW.DEPTH_HUD);
  }
}
