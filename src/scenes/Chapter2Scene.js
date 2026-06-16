import Phaser from 'phaser';
import {
  SCENE_KEYS,
  ASSET_KEYS,
  EVENTS,
  GAME,
  CHAPTER_2,
  CH2_VIEW,
  TRANSITION_TEXT,
} from '../config/Constants.js';
import DawnBackground from '../chapter2/DawnBackground.js';
import SignalPlayer from '../chapter2/SignalPlayer.js';
import ObstacleSpawner from '../chapter2/ObstacleSpawner.js';
import CitizenSpawner from '../chapter2/CitizenSpawner.js';
import ColorSystem from '../chapter2/ColorSystem.js';
import Chapter2HUD from '../chapter2/Chapter2HUD.js';
import PlayerState from '../systems/PlayerState.js';
import SaveSystem from '../systems/SaveSystem.js';

// Chapter 2 — "The Word." A side-scrolling runner: the signal drifts right while the
// player dodges obstacles and reaches citizens, each of whom restores a Pride colour
// to the greyscale world. Orchestrates the entities, lives/checkpoints, HUD, camera,
// and the hand-off to the next chapter.
export default class Chapter2Scene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CHAPTER_2);
  }

  create() {
    this._ensureTextures();
    this._levelLength = GAME.WIDTH * CHAPTER_2.LEVEL_LENGTH_SCREENS;
    DawnBackground.build(this);

    this.colorSystem = new ColorSystem();
    this.colorSystem.applyToScene(this);

    this.physics.world.setBounds(0, 0, this._levelLength, GAME.HEIGHT);
    this.cameras.main.setBounds(0, 0, this._levelLength, GAME.HEIGHT);

    this.player = new SignalPlayer(this);
    this.obstacles = new ObstacleSpawner(this);
    this.citizens = new CitizenSpawner(this);
    this.physics.add.overlap(this.player, this.obstacles.getGroup(), this._onObstacleHit, undefined, this);
    this.cameras.main.startFollow(this.player, false, CHAPTER_2.CAMERA_LERP_X, 0);

    this._initState();
    this.hud = new Chapter2HUD(this);
    this.hud.setLives(this._lives);
    this.hud.refreshPride([]);

    this.events.on(EVENTS.CITIZEN_REACHED, this._onCitizenReached, this);
    this.time.addEvent({
      delay: CHAPTER_2.CHECKPOINT_INTERVAL_MS,
      loop: true,
      callback: this._saveCheckpoint,
      callbackScope: this,
    });

    this._audio().playChapterMusic(2);
    this.events.once('shutdown', this._onShutdown, this);
  }

  update() {
    this.player.update();
    this.citizens.update(this.player.x, this.player.y);
    this.obstacles.update(this.cameras.main.scrollX);

    if (!this._completed && this.player.x > this._levelLength) {
      this._completeLevel();
    }
  }

  // --- private: setup ---

  // Phaser 4's PluginManager.get() doesn't resolve per-scene plugins, so fall back
  // to the scene-injected AudioManager (mapping set in GameConfig).
  _audio() {
    return this.plugins.get('AudioManager') ?? this.AudioManager;
  }

  // Generate the textures Phaser sprites need: the player dot, the trail dot, and
  // the angular left-pointing chevron obstacle. (Citizens are drawn from shapes.)
  _ensureTextures() {
    this._makeCircle(ASSET_KEYS.GEN_PLAYER_DOT, CH2_VIEW.PLAYER_RADIUS, CH2_VIEW.PLAYER_COLOR);
    this._makeCircle(ASSET_KEYS.GEN_TRAIL_DOT, CH2_VIEW.TRAIL_DOT_RADIUS, 0xffffff);
    this._makeChevron(ASSET_KEYS.GEN_OBSTACLE);
  }

  _initState() {
    this._lives = CHAPTER_2.TOTAL_LIVES;
    this._citizensReached = 0;
    this._livesLost = 0;
    this._checkpointX = CHAPTER_2.PLAYER_SPAWN_X;
    this._invulnerable = false;
    this._completed = false;
  }

  _makeCircle(key, radius, color) {
    if (this.textures.exists(key)) {
      return;
    }
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }

  // A dark angular chevron pointing left: outer V plus an inner notch.
  _makeChevron(key) {
    if (this.textures.exists(key)) {
      return;
    }
    const w = CH2_VIEW.OBSTACLE_W;
    const h = CH2_VIEW.OBSTACLE_H;
    const points = [
      { x: w, y: 0 },
      { x: 0, y: h / 2 },
      { x: w, y: h },
      { x: w * 0.55, y: h / 2 },
    ];
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(CH2_VIEW.OBSTACLE_FILL, 1);
    g.lineStyle(CH2_VIEW.OBSTACLE_STROKE_W, CH2_VIEW.OBSTACLE_STROKE, 1);
    g.fillPoints(points, true);
    g.strokePoints(points, true);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // --- private: gameplay events ---

  _completeLevel() {
    this._completed = true;
    this.player.freeze();

    PlayerState.citizensReached = this._citizensReached;
    PlayerState.livesLost = this._livesLost;
    this.colorSystem.getRestoredColors().forEach((color) => PlayerState.addColorRestored(color));
    PlayerState.markChapterComplete(2);
    SaveSystem.save(PlayerState);

    this.scene.start(SCENE_KEYS.TRANSITION, {
      text: TRANSITION_TEXT.CH2_TO_CH3,
      nextScene: SCENE_KEYS.CHAPTER_3,
      nextSceneData: {},
    });
  }

  _onCitizenReached(color) {
    this._citizensReached += 1;
    this.colorSystem.restoreColor(color);
    this.hud.refreshPride(this.colorSystem.getRestoredColors());
    this._audio().playSFX(ASSET_KEYS.SFX_LIBERATION);
  }

  _onObstacleHit(player, obstacle) {
    if (this._invulnerable || this._completed) {
      return;
    }
    obstacle.destroy(); // broke through — don't let the same block hit twice
    this._loseLife();
  }

  _onShutdown() {
    this._audio().fadeOut();
  }

  // --- private: life cycle / checkpoints ---

  _afterDeath() {
    this.player.clearTint();
    this.player.setAlpha(1);
    // Losing the last life restarts from the checkpoint with a full life bar.
    if (this._lives <= 0) {
      this._lives = CHAPTER_2.TOTAL_LIVES;
      this.hud.setLives(this._lives);
    }
    this._respawnAtCheckpoint();
  }

  _loseLife() {
    this._lives -= 1;
    this._livesLost += 1;
    this.hud.setLives(Math.max(0, this._lives));
    this._invulnerable = true;

    this.player.freeze();
    this.player.setTint(CHAPTER_2.DEATH_FLASH_TINT);
    this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.2 },
      yoyo: true,
      repeat: CHAPTER_2.DEATH_FLASH_REPEATS,
      duration: CHAPTER_2.DEATH_FREEZE_MS / (2 * (CHAPTER_2.DEATH_FLASH_REPEATS + 1)),
    });
    this.time.delayedCall(CHAPTER_2.DEATH_FREEZE_MS, this._afterDeath, undefined, this);
  }

  _respawnAtCheckpoint() {
    this.player.setPosition(this._checkpointX, GAME.HEIGHT / 2);
    this.player.unfreeze();
    // Keep a short grace window so the player isn't instantly re-hit on respawn.
    this.time.delayedCall(CHAPTER_2.RESPAWN_INVULN_MS, () => {
      this._invulnerable = false;
    });
  }

  _saveCheckpoint() {
    if (!this._completed && !this._invulnerable) {
      this._checkpointX = this.player.x;
    }
  }
}
