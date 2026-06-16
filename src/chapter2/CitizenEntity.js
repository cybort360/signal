import Phaser from 'phaser';
import { CH2_VIEW, ASSET_KEYS, EVENTS } from '../config/Constants.js';

// One citizen along the route, drawn as a simple greyscale humanoid silhouette
// (body + head) using placeholder shapes. liberate() bursts particles in the
// citizen's Pride colour and tweens the silhouette from grey to that colour, then
// emits EVENTS.CITIZEN_REACHED on the scene so the world can resaturate.
export default class CitizenEntity extends Phaser.GameObjects.Container {
  constructor(scene, x, y, color) {
    super(scene, x, y);
    this._color = color;
    this._liberated = false;
    this._colorValue = Phaser.Display.Color.HexStringToColor(color).color;

    this._buildSilhouette();
    scene.add.existing(this);
    this.setDepth(CH2_VIEW.DEPTH_CITIZEN);
  }

  getColor() {
    return this._color;
  }

  isLiberated() {
    return this._liberated;
  }

  liberate(color) {
    if (this._liberated) {
      return;
    }
    this._liberated = true;
    this._burst(color);
    this._tweenToColor();
    // The scene listens for this to drive the colour system, counter, and HUD.
    this.scene.events.emit(EVENTS.CITIZEN_REACHED, color);
  }

  // --- private ---

  _burst(color) {
    const value = Phaser.Display.Color.HexStringToColor(color).color;
    const emitter = this.scene.add.particles(this.x, this.y, ASSET_KEYS.GEN_TRAIL_DOT, {
      speed: CH2_VIEW.BURST_SPEED,
      lifespan: CH2_VIEW.BURST_LIFESPAN_MS,
      tint: value,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(CH2_VIEW.DEPTH_CITIZEN);
    emitter.explode(CH2_VIEW.BURST_COUNT);
    this.scene.time.delayedCall(CH2_VIEW.BURST_LIFESPAN_MS, () => emitter.destroy());
  }

  // A simple human figure: circle head, rectangle torso, two rectangle legs. Drawn
  // from individual shapes so each part can recolour on liberation.
  _buildSilhouette() {
    const grey = CH2_VIEW.GREYSCALE_FILL;
    const torsoH = CH2_VIEW.CITIZEN_TORSO_H;
    const headY = -torsoH / 2 - CH2_VIEW.CITIZEN_HEAD_RADIUS;
    const legY = torsoH / 2 + CH2_VIEW.CITIZEN_LEG_H / 2;
    const legDx = CH2_VIEW.CITIZEN_LEG_W / 2 + CH2_VIEW.CITIZEN_LEG_GAP / 2;

    const head = this.scene.add.circle(0, headY, CH2_VIEW.CITIZEN_HEAD_RADIUS, grey);
    const torso = this.scene.add.rectangle(0, 0, CH2_VIEW.CITIZEN_TORSO_W, torsoH, grey).setOrigin(0.5);
    const legL = this.scene.add.rectangle(-legDx, legY, CH2_VIEW.CITIZEN_LEG_W, CH2_VIEW.CITIZEN_LEG_H, grey);
    const legR = this.scene.add.rectangle(legDx, legY, CH2_VIEW.CITIZEN_LEG_W, CH2_VIEW.CITIZEN_LEG_H, grey);
    this._parts = [head, torso, legL, legR];
    this.add(this._parts);
  }

  // Containers/Shapes don't support FX pipelines in Phaser, so interpolate the
  // fill colour of every part directly from grey to the citizen's Pride colour.
  _tweenToColor() {
    const from = Phaser.Display.Color.IntegerToColor(CH2_VIEW.GREYSCALE_FILL);
    const to = Phaser.Display.Color.IntegerToColor(this._colorValue);
    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: CH2_VIEW.CITIZEN_COLOR_TWEEN_MS,
      onUpdate: (tween) => {
        const mix = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, tween.getValue());
        const value = Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b);
        this._parts.forEach((part) => part.setFillStyle(value));
      },
    });
  }
}
