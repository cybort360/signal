import Phaser from 'phaser';

// Graphics gradient fills do not survive Phaser's generateTexture, so anything
// that needs a real gradient (the chapter skies, the dawn sun, the aurora) is
// painted onto a 2D CanvasTexture instead. Each builder is idempotent — it
// returns the key and skips the work if the texture already exists.
//
// `stops` is a list of [offset 0..1, integer-hex colour, alpha 0..1].

export function linearGradientTexture(scene, key, width, height, stops) {
  if (scene.textures.exists(key)) {
    return key;
  }
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  _applyStops(gradient, stops);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  texture.refresh();
  return key;
}

export function radialGradientTexture(scene, key, width, height, focus, stops) {
  if (scene.textures.exists(key)) {
    return key;
  }
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  const gradient = ctx.createRadialGradient(focus.x, focus.y, 0, focus.x, focus.y, focus.radius);
  _applyStops(gradient, stops);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  texture.refresh();
  return key;
}

function _applyStops(gradient, stops) {
  for (const [offset, color, alpha = 1] of stops) {
    const c = Phaser.Display.Color.IntegerToColor(color);
    gradient.addColorStop(offset, `rgba(${c.red},${c.green},${c.blue},${alpha})`);
  }
}
