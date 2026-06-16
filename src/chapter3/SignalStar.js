import TypewriterText from '../ui/TypewriterText.js';
import { GAME, ASSET_KEYS, CHAPTER_3, CH3_VIEW, FONTS } from '../config/Constants.js';
import { radialGradientTexture } from '../utils/gradientTexture.js';

// The signature moment. The player's message types out in the centre of the sky,
// then lifts and contracts toward a single point high overhead — where a warm
// glowing star blooms and holds, the words shrinking into a small label beneath it.
// Returns a Promise that resolves once the star has settled and begun to twinkle.
export function buildSignalStar(scene, message) {
  return new Promise((resolve) => _typeThenRise(scene, message, resolve));
}

function _typeThenRise(scene, message, resolve) {
  const text = new TypewriterText(scene, GAME.WIDTH / 2, CH3_VIEW.MESSAGE_START_Y, message, {
    fontFamily: FONTS.SERIF,
    fontSize: CH3_VIEW.MESSAGE_FONT,
    color: CH3_VIEW.MESSAGE_COLOR,
    align: 'center',
    wordWrap: { width: CH3_VIEW.MESSAGE_WRAP },
  }).setOrigin(0.5);
  text.setDepth(CH3_VIEW.DEPTH_SIGNAL);
  scene.add.existing(text);
  text.once('complete', () => _rise(scene, message, text, resolve));
  text.play(CHAPTER_3.TYPEWRITER_SPEED_MS);
}

// The whole message floats up and shrinks toward the point of light it will become.
function _rise(scene, message, text, resolve) {
  const x = GAME.WIDTH * CH3_VIEW.STAR_RISE_X_FRAC;
  const y = GAME.HEIGHT * CH3_VIEW.STAR_RISE_Y_FRAC;
  scene.tweens.add({
    targets: text,
    x,
    y,
    scale: CH3_VIEW.STAR_RISE_END_SCALE,
    alpha: 0,
    duration: CH3_VIEW.STAR_RISE_MS,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      text.destroy();
      _bloom(scene, message, x, y, resolve);
    },
  });
}

function _bloom(scene, message, x, y, resolve) {
  const star = _starImage(scene, x, y);
  const label = scene.add
    .text(x, y + CH3_VIEW.STAR_LABEL_OFFSET_Y, message, {
      fontFamily: FONTS.MONOSPACE,
      fontSize: CH3_VIEW.STAR_LABEL_FONT,
      color: CH3_VIEW.STAR_LABEL_COLOR,
      align: 'center',
      wordWrap: { width: CH3_VIEW.STAR_LABEL_WRAP },
    })
    .setOrigin(0.5, 0)
    .setDepth(CH3_VIEW.DEPTH_SIGNAL)
    .setAlpha(0);
  scene.tweens.add({ targets: label, alpha: 1, duration: CH3_VIEW.STAR_BLOOM_MS, delay: CH3_VIEW.STAR_BLOOM_MS });
  scene.tweens.add({
    targets: star,
    scale: 1,
    alpha: 1,
    duration: CH3_VIEW.STAR_BLOOM_MS,
    ease: 'Back.easeOut',
    onComplete: () => {
      _twinkle(scene, star);
      resolve();
    },
  });
}

// A soft warm halo for the star: white core fading out through the chosen hue.
function _starImage(scene, x, y) {
  const r = CH3_VIEW.STAR_DOT_RADIUS * CH3_VIEW.STAR_GLOW_RADIUS_MULT;
  const key = radialGradientTexture(scene, ASSET_KEYS.GEN_STAR_GLOW, r * 2, r * 2, { x: r, y: r, radius: r }, [
    [0, CH3_VIEW.STAR_COLOR, 1],
    [0.25, CH3_VIEW.STAR_HUE, 0.95],
    [1, CH3_VIEW.STAR_HUE, 0],
  ]);
  return scene.add
    .image(x, y, key)
    .setDepth(CH3_VIEW.DEPTH_SIGNAL)
    .setScale(CH3_VIEW.STAR_BLOOM_FROM_SCALE)
    .setAlpha(0);
}

function _twinkle(scene, star) {
  scene.tweens.add({
    targets: star,
    alpha: CH3_VIEW.STAR_TWINKLE_ALPHA,
    duration: CH3_VIEW.STAR_TWINKLE_MS,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}
