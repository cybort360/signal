import { GAME, CHAPTER_2, CH2_VIEW, ASSET_KEYS } from '../config/Constants.js';

// Five vertical lanes the obstacles snap to (centres in px). Chosen so a 120px-tall
// obstacle stays within the playfield padding.
const LANES = [110, 230, 360, 490, 610];

// Hand-authored gate layout (level data, like the cipher puzzles): each entry is
// [worldX, blockedLaneIndices]. Every gate leaves at least one open lane, gaps are
// reachable at the player's vertical speed, and density rises in the second half.
const GATES = [
  // First half — sparse, single obstacles and easy pairs.
  [900, [4]],
  [1500, [0]],
  [2100, [2]],
  [2700, [0, 1]],
  [3300, [3, 4]],
  [3900, [2]],
  [4500, [0, 4]],
  [5000, [1, 2]],
  // Second half — tighter spacing, clusters of two and three.
  [5400, [0, 1]],
  [5750, [4]],
  [6050, [2, 3]],
  [6350, [0, 1, 2]],
  [6650, [3, 4]],
  [6950, [1, 2]],
  [7250, [2, 3, 4]],
  [7550, [0, 1]],
  [7850, [2, 3]],
  [8150, [0, 1, 2]],
  [8450, [3, 4]],
];

// Owns the Arcade static group of obstacles. The scene wires a collider/overlap to
// getGroup(); update() culls obstacles that fall well behind the camera.
export default class ObstacleSpawner {
  constructor(scene) {
    this.scene = scene;
    this._group = scene.physics.add.staticGroup();
    this._spawn();
  }

  getGroup() {
    return this._group;
  }

  update(scrollX) {
    const cullX = scrollX - GAME.WIDTH * CHAPTER_2.DESPAWN_MARGIN_SCREENS;
    for (const obstacle of this._group.getChildren()) {
      if (obstacle.x < cullX) {
        obstacle.destroy();
      }
    }
  }

  // --- private ---

  _spawn() {
    for (const [x, lanes] of GATES) {
      for (const lane of lanes) {
        const obstacle = this._group.create(x, LANES[lane], ASSET_KEYS.GEN_OBSTACLE);
        obstacle.setDepth(CH2_VIEW.DEPTH_OBSTACLE);
      }
    }
  }
}
