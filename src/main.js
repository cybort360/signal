import Phaser from 'phaser';
import GameConfig from './config/GameConfig.js';

// Single entry point: hand the assembled config to Phaser. Everything else —
// scenes, systems, gameplay — is wired up through GameConfig and its scene list.
new Phaser.Game(GameConfig);
