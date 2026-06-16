import { GAME, ASSET_KEYS, CH3_VIEW } from '../config/Constants.js';
import { radialGradientTexture, linearGradientTexture } from '../utils/gradientTexture.js';

// Chapter 3's solstice night: a deep sky glowing warm at the horizon, an ambient
// field of stars, and a faint aurora low on the screen. A still, luminous backdrop
// the player's final signal rises into. The starfield is seeded so it is identical
// every run.
export default class SolsticeSky {
  static build(scene) {
    SolsticeSky._sky(scene);
    SolsticeSky._aurora(scene);
    SolsticeSky._stars(scene);
  }

  // --- private ---

  static _aurora(scene) {
    const h = CH3_VIEW.AURORA_HEIGHT;
    const key = linearGradientTexture(scene, ASSET_KEYS.GEN_CH3_AURORA, GAME.WIDTH, h, [
      [0, CH3_VIEW.AURORA_GREEN, 0],
      [0.6, CH3_VIEW.AURORA_VIOLET, CH3_VIEW.AURORA_ALPHA],
      [1, CH3_VIEW.AURORA_ROSE, CH3_VIEW.AURORA_ALPHA * 0.75],
    ]);
    scene.add.image(GAME.WIDTH / 2, GAME.HEIGHT - h / 2, key).setDepth(CH3_VIEW.DEPTH_AURORA);
  }

  // Small deterministic PRNG so the same sky appears on every playthrough.
  static _rng(seed) {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  static _sky(scene) {
    const key = radialGradientTexture(scene, ASSET_KEYS.GEN_CH3_SKY, GAME.WIDTH, GAME.HEIGHT, {
      x: GAME.WIDTH * CH3_VIEW.SKY_FOCUS_X_FRAC,
      y: GAME.HEIGHT * CH3_VIEW.SKY_FOCUS_Y_FRAC,
      radius: GAME.HEIGHT * 1.3,
    }, [
      [0, CH3_VIEW.SKY_GLOW, 1],
      [0.42, CH3_VIEW.SKY_MID, 1],
      [1, CH3_VIEW.SKY_DEEP, 1],
    ]);
    scene.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, key).setDepth(CH3_VIEW.DEPTH_SKY);
  }

  static _stars(scene) {
    const fieldH = GAME.HEIGHT * CH3_VIEW.STAR_FIELD_HEIGHT_FRAC;
    const rng = SolsticeSky._rng(7);
    const g = scene.add.graphics().setDepth(CH3_VIEW.DEPTH_STARS);
    for (let i = 0; i < CH3_VIEW.STAR_COUNT; i += 1) {
      const size = CH3_VIEW.STAR_MIN_SIZE + rng() * (CH3_VIEW.STAR_MAX_SIZE - CH3_VIEW.STAR_MIN_SIZE);
      const alpha = CH3_VIEW.STAR_MIN_ALPHA + rng() * (CH3_VIEW.STAR_MAX_ALPHA - CH3_VIEW.STAR_MIN_ALPHA);
      g.fillStyle(CH3_VIEW.STAR_COLOR, alpha);
      g.fillCircle(rng() * GAME.WIDTH, rng() * fieldH, size);
    }
    SolsticeSky._twinkle(scene, fieldH, rng);
  }

  // A handful of brighter stars that breathe, layered over the still field.
  static _twinkle(scene, fieldH, rng) {
    for (let i = 0; i < CH3_VIEW.STAR_TWINKLE_COUNT; i += 1) {
      const star = scene.add
        .circle(rng() * GAME.WIDTH, rng() * fieldH, CH3_VIEW.STAR_MAX_SIZE, CH3_VIEW.STAR_COLOR)
        .setDepth(CH3_VIEW.DEPTH_STARS);
      const ms = CH3_VIEW.STAR_TWINKLE_MIN_MS + rng() * (CH3_VIEW.STAR_TWINKLE_MAX_MS - CH3_VIEW.STAR_TWINKLE_MIN_MS);
      scene.tweens.add({
        targets: star,
        alpha: { from: CH3_VIEW.STAR_MAX_ALPHA, to: CH3_VIEW.STAR_MIN_ALPHA },
        duration: ms,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
