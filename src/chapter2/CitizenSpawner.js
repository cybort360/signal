import Phaser from 'phaser';
import { GAME, CHAPTER_2, CH2_VIEW } from '../config/Constants.js';
import CitizenEntity from './CitizenEntity.js';

// Half a citizen's silhouette height (head + torso + legs), used to keep the figure
// fully on-screen vertically.
const CITIZEN_HALF_H =
  CH2_VIEW.CITIZEN_HEAD_RADIUS * 2 + CH2_VIEW.CITIZEN_TORSO_H / 2 + CH2_VIEW.CITIZEN_LEG_H;
const VERTICAL_SLOTS = 5;

// Places citizens across the whole level and liberates them as the player passes.
// Spacing varies deterministically between CITIZEN_SPACING_MIN/MAX; each citizen is
// assigned the next Pride colour in order, cycling once the seven run out.
export default class CitizenSpawner {
  constructor(scene) {
    this.scene = scene;
    this._citizens = [];
    this._spawn();
  }

  // Pride colours that have been reached, in liberation-detection order.
  getLiberated() {
    return this._citizens.filter((c) => c.isLiberated()).map((c) => c.getColor());
  }

  update(playerX, playerY) {
    const radius = CHAPTER_2.CITIZEN_LIBERATE_RADIUS;
    const cullX = playerX - GAME.WIDTH * CHAPTER_2.DESPAWN_MARGIN_SCREENS;
    const survivors = [];
    for (const citizen of this._citizens) {
      if (!citizen.isLiberated()) {
        const distance = Phaser.Math.Distance.Between(playerX, playerY, citizen.x, citizen.y);
        if (distance <= radius) {
          citizen.liberate(citizen.getColor());
        }
      }
      if (citizen.x < cullX) {
        citizen.destroy();
      } else {
        survivors.push(citizen);
      }
    }
    this._citizens = survivors;
  }

  // --- private ---

  _spawn() {
    const colors = CHAPTER_2.PRIDE_COLORS;
    const levelLength = GAME.WIDTH * CHAPTER_2.LEVEL_LENGTH_SCREENS;
    const end = levelLength - GAME.WIDTH; // leave the finish stretch clear
    let x = CHAPTER_2.PLAYER_SPAWN_X + GAME.WIDTH;
    let index = 0;
    while (x < end) {
      const color = colors[index % colors.length];
      const citizen = new CitizenEntity(this.scene, x, this._slotY(index), color);
      this._citizens.push(citizen);
      x += this._spacing(index);
      index += 1;
    }
  }

  // Vary vertical position across a few slots so the player must move to reach them.
  _slotY(index) {
    const pad = CHAPTER_2.VERTICAL_PADDING + CITIZEN_HALF_H;
    const span = GAME.HEIGHT - pad * 2;
    const slot = index % VERTICAL_SLOTS;
    return pad + (span * slot) / (VERTICAL_SLOTS - 1);
  }

  // Deterministic spacing in [MIN, MAX] — authored variety, not randomness.
  _spacing(index) {
    const { CITIZEN_SPACING_MIN: min, CITIZEN_SPACING_MAX: max } = CHAPTER_2;
    return min + ((index * 137) % (max - min));
  }
}
