import Phaser from 'phaser';
import { GAME, CHAPTER_2, CH2_VIEW, ASSET_KEYS, ANIM_KEYS } from '../config/Constants.js';

// The player: a signal particle that moves only up/down while drifting right at a
// constant scroll speed. Renders as a generated yellow circle (placeholder until a
// real sprite sheet exists) and trails white/yellow particles. freeze()/unfreeze()
// gate input during cinematics and the death animation.
export default class SignalPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, CHAPTER_2.PLAYER_SPAWN_X, GAME.HEIGHT / 2, ASSET_KEYS.GEN_PLAYER_DOT);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(CH2_VIEW.DEPTH_PLAYER);
    this.body.setCircle(CH2_VIEW.PLAYER_RADIUS);
    this.body.setAllowGravity(false);

    this._frozen = false;
    this._buildControls(scene);
    this._buildTrail(scene);
    this._playIdle();

    this.setVelocityX(CHAPTER_2.SCROLL_SPEED);
  }

  freeze() {
    this._frozen = true;
    this.setVelocity(0, 0);
  }

  unfreeze() {
    this._frozen = false;
    this.setVelocityX(CHAPTER_2.SCROLL_SPEED);
  }

  update() {
    if (this._frozen) {
      return;
    }
    const up = this._keyUp.isDown || this._keyW.isDown;
    const down = this._keyDown.isDown || this._keyS.isDown;
    let velocityY = 0;
    if (up && !down) {
      velocityY = -CHAPTER_2.PLAYER_SPEED_Y;
    } else if (down && !up) {
      velocityY = CHAPTER_2.PLAYER_SPEED_Y;
    }
    this.setVelocityY(velocityY);

    // Keep the signal on-screen vertically; padding leaves a margin top and bottom.
    const pad = CHAPTER_2.VERTICAL_PADDING;
    this.y = Phaser.Math.Clamp(this.y, pad, GAME.HEIGHT - pad);
  }

  // --- private ---

  _buildControls(scene) {
    const keyboard = scene.input.keyboard;
    this._keyUp = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._keyDown = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this._keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  _buildTrail(scene) {
    this._trail = scene.add.particles(0, 0, ASSET_KEYS.GEN_TRAIL_DOT, {
      follow: this,
      lifespan: CH2_VIEW.TRAIL_LIFESPAN_MS,
      frequency: CH2_VIEW.TRAIL_FREQUENCY_MS,
      quantity: CH2_VIEW.TRAIL_QUANTITY,
      tint: [CH2_VIEW.TRAIL_WHITE, CH2_VIEW.TRAIL_GOLD],
      scale: { start: CH2_VIEW.TRAIL_SCALE_START, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
    });
    this._trail.setDepth(CH2_VIEW.DEPTH_TRAIL);
  }

  // Use the real idle animation only if its sprite sheet has been loaded; the
  // generated circle texture is the fallback (CLAUDE.md asset-fallback contract).
  _playIdle() {
    if (this.scene.anims.exists(ANIM_KEYS.SIGNAL_IDLE)) {
      this.play(ANIM_KEYS.SIGNAL_IDLE);
    }
  }
}
