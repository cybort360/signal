import { GAME, ASSET_KEYS, CH2_VIEW } from '../config/Constants.js';
import { linearGradientTexture, radialGradientTexture } from '../utils/gradientTexture.js';

// Chapter 2's dawn backdrop, fixed to the camera: a sky warming from night-purple
// at the crown to gold at the horizon, a breathing sun rising behind it, layered
// rounded hills, and a band of warm earth. The scrolling world plays over this.
export default class DawnBackground {
  static build(scene) {
    DawnBackground._sky(scene);
    DawnBackground._sun(scene);
    DawnBackground._hills(scene);
    DawnBackground._ground(scene);
  }

  // --- private ---

  static _ground(scene) {
    const groundY = GAME.HEIGHT * CH2_VIEW.GROUND_Y_FRACTION;
    const h = GAME.HEIGHT - groundY;
    const g = scene.add.graphics().setScrollFactor(0).setDepth(CH2_VIEW.DEPTH_GROUND);
    g.fillStyle(CH2_VIEW.GROUND_TOP, 1);
    g.fillRect(0, groundY, GAME.WIDTH, h);
    g.fillStyle(CH2_VIEW.GROUND_BOTTOM, 1);
    g.fillRect(0, groundY + h / 2, GAME.WIDTH, h / 2);
  }

  // One rounded hill: a wide ellipse whose flat base rests on the ground line.
  static _hill(scene, color, alpha, widthMult, height, baseY, depth) {
    const g = scene.add.graphics().setScrollFactor(0).setDepth(depth);
    g.fillStyle(color, alpha);
    g.fillEllipse(GAME.WIDTH / 2, baseY, GAME.WIDTH * widthMult, height * 2);
  }

  static _hills(scene) {
    const groundY = GAME.HEIGHT * CH2_VIEW.GROUND_Y_FRACTION;
    DawnBackground._hill(scene, CH2_VIEW.HILL_FAR_COLOR, CH2_VIEW.HILL_FAR_ALPHA, CH2_VIEW.HILL_FAR_WIDTH, CH2_VIEW.HILL_FAR_HEIGHT, groundY, CH2_VIEW.DEPTH_HILL_FAR);
    DawnBackground._hill(scene, CH2_VIEW.HILL_MID_COLOR, CH2_VIEW.HILL_MID_ALPHA, CH2_VIEW.HILL_MID_WIDTH, CH2_VIEW.HILL_MID_HEIGHT, groundY, CH2_VIEW.DEPTH_HILL_MID);
  }

  static _sky(scene) {
    const key = linearGradientTexture(scene, ASSET_KEYS.GEN_CH2_SKY, GAME.WIDTH, GAME.HEIGHT, [
      [0, CH2_VIEW.SKY_CROWN, 1],
      [0.38, CH2_VIEW.SKY_UPPER, 1],
      [0.64, CH2_VIEW.SKY_LOWER, 1],
      [1, CH2_VIEW.SKY_HORIZON, 1],
    ]);
    scene.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, key).setScrollFactor(0).setDepth(CH2_VIEW.DEPTH_BG);
  }

  static _sun(scene) {
    const r = CH2_VIEW.SUN_RADIUS;
    const key = radialGradientTexture(scene, ASSET_KEYS.GEN_CH2_SUN, r * 2, r * 2, { x: r, y: r, radius: r }, [
      [0, CH2_VIEW.SUN_INNER, 1],
      [0.45, CH2_VIEW.SUN_OUTER, 0.85],
      [1, CH2_VIEW.SUN_OUTER, 0],
    ]);
    const sun = scene.add
      .image(GAME.WIDTH / 2, GAME.HEIGHT * CH2_VIEW.SUN_Y_FRACTION, key)
      .setScrollFactor(0)
      .setDepth(CH2_VIEW.DEPTH_SUN);
    scene.tweens.add({
      targets: sun,
      scale: CH2_VIEW.SUN_BREATHE_SCALE,
      alpha: { from: 0.85, to: 1 },
      duration: CH2_VIEW.SUN_BREATHE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
