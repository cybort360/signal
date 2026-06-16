import Phaser from 'phaser';
import { GAME } from './Constants.js';
import AudioManager from '../systems/AudioManager.js';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene from '../scenes/MenuScene.js';
import Chapter1Scene from '../scenes/Chapter1Scene.js';
import Chapter2Scene from '../scenes/Chapter2Scene.js';
import Chapter3Scene from '../scenes/Chapter3Scene.js';
import TransitionScene from '../scenes/TransitionScene.js';
import CreditsScene from '../scenes/CreditsScene.js';

// Fixed 1280x720 render. FIT + CENTER_BOTH scales the canvas to the viewport
// while preserving aspect ratio (see CLAUDE.md Responsive Design — do not go
// further than this). Scenes are registered in the flow order from
// ARCHITECTURE.md: Boot → Preload → Menu → Chapter1 → Chapter2 → Chapter3 →
// Transition → Credits. The first entry (BootScene) starts automatically.
export const GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: GAME.BACKGROUND_COLOR,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    Chapter1Scene,
    Chapter2Scene,
    Chapter3Scene,
    TransitionScene,
    CreditsScene,
  ],
  // AudioManager is a per-Scene plugin: instantiated for every scene and reachable
  // as `this.AudioManager` (its mapping). Scenes call playChapterMusic/fadeOut/playSFX.
  plugins: {
    scene: [{ key: 'AudioManager', plugin: AudioManager, mapping: 'AudioManager' }],
  },
};

export default GameConfig;
