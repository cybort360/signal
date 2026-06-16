import Phaser from 'phaser';
import { ASSET_KEYS, AUDIO } from '../config/Constants.js';
import logger from '../utils/logger.js';

// Maps the chapter number passed to playChapterMusic() onto its music asset key.
// Kept here (not in Constants) because it is purely AudioManager's concern; the
// keys themselves still come from Constants — no hardcoded strings.
const CHAPTER_MUSIC_KEYS = {
  1: ASSET_KEYS.MUSIC_CH1,
  2: ASSET_KEYS.MUSIC_CH2,
  3: ASSET_KEYS.MUSIC_CH3,
};

// AudioManager is a per-Scene plugin (registered in GameConfig under plugins.scene).
// Each chapter scene calls playChapterMusic() on create and fadeOut() on shutdown;
// SFX are fired directly via playSFX(). It tracks the music track it started so
// fadeOut() always targets the right one and a second playChapterMusic() crossfades
// instead of cutting. All tuning values come from Constants.AUDIO.
export default class AudioManager extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager, pluginKey) {
    super(scene, pluginManager, pluginKey);
    this._currentMusic = null;
  }

  // Stop and release our music if the owning scene shuts down or is destroyed, so
  // a track can't outlive its scene or leak across a restart.
  boot() {
    this.systems.events.once('shutdown', this.stopAll, this);
    this.systems.events.once('destroy', this.stopAll, this);
  }

  fadeOut(duration = AUDIO.MUSIC_FADE_MS) {
    const music = this._currentMusic;
    if (!music || !music.isPlaying) {
      return;
    }
    this._currentMusic = null;
    this._fadeAndStop(music, duration);
  }

  playChapterMusic(chapter) {
    const key = CHAPTER_MUSIC_KEYS[chapter];
    if (!key) {
      logger.warn('AudioManager.playChapterMusic: unknown chapter', chapter);
      return;
    }
    if (!this.scene.cache.audio.exists(key)) {
      // No audio assets are wired up yet (or this one failed to load). Skip
      // visibly rather than letting Phaser throw — see Error Handling Contract.
      logger.warn('AudioManager.playChapterMusic: missing audio key', key);
      return;
    }

    // Crossfade: ease out whatever is already playing before the new track rises.
    if (this._currentMusic && this._currentMusic.isPlaying) {
      this._fadeAndStop(this._currentMusic, AUDIO.MUSIC_FADE_MS);
    }

    const music = this.scene.sound.add(key, { loop: true, volume: 0 });
    music.play();
    this._currentMusic = music;
    this.scene.tweens.add({
      targets: music,
      volume: AUDIO.MUSIC_VOLUME,
      duration: AUDIO.MUSIC_FADE_MS,
    });
  }

  playSFX(key, volume = AUDIO.SFX_VOLUME) {
    if (!this.scene.cache.audio.exists(key)) {
      logger.warn('AudioManager.playSFX: missing audio key', key);
      return;
    }
    this.scene.sound.play(key, { volume });
  }

  stopAll() {
    this._currentMusic = null;
    this.scene.sound.stopAll();
  }

  // --- private ---

  // Tween a track's volume to silence, then stop and destroy it. The outgoing
  // track is detached from _currentMusic by the caller, so this never races with
  // whatever is playing next.
  _fadeAndStop(music, duration) {
    this.scene.tweens.add({
      targets: music,
      volume: 0,
      duration,
      onComplete: () => {
        music.stop();
        music.destroy();
      },
    });
  }
}
