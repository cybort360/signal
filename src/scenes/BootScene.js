import Phaser from 'phaser';
import { SCENE_KEYS, GAME } from '../config/Constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    // Placeholder loading bar: a simple white rectangle centered on screen.
    // Real boot assets (logo, bar sprite) will load here later — for the scaffold
    // this is just a visible first beat before PreloadScene takes over.
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, 240, 6, 0xffffff);

    // Delay one beat so the rectangle paints, then hand off to PreloadScene.
    this.time.delayedCall(300, () => this.scene.start(SCENE_KEYS.PRELOAD));
  }
}
