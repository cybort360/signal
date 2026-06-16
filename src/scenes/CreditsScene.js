import Phaser from 'phaser';
import { SCENE_KEYS, GAME, CREDITS, FONTS } from '../config/Constants.js';
import TypewriterText from '../ui/TypewriterText.js';
import PlayerState from '../systems/PlayerState.js';
import SaveSystem from '../systems/SaveSystem.js';

// The credits. Respectful and plain: charcoal type on a page that warms from white
// to cream, each line typing itself in, honoring Turing, Juneteenth, and Pride.
const LINES = [
  { text: 'SIGNAL', kind: 'title' },
  { text: 'A game about the messages that changed everything.', kind: 'body' },
  { blank: true },
  { text: 'Alan Turing (1912–1954)', kind: 'header' },
  { text: 'Mathematician. Codebreaker. Pioneer of computing.', kind: 'body' },
  { text: 'Persecuted for who he was. Pardoned in 2013.', kind: 'body' },
  { blank: true },
  { text: 'Juneteenth — June 19, 1865', kind: 'header' },
  { text: 'The day the last enslaved people in the US learned they were free.', kind: 'body' },
  { blank: true },
  { text: 'Pride Month — June', kind: 'header' },
  { text: 'In honor of those who fought to be seen.', kind: 'body' },
  { blank: true },
  { text: 'Built for the DEV.to June Solstice Game Jam 2026.', kind: 'body' },
  { blank: true },
  { text: 'Thank you for playing.', kind: 'body' },
];

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CREDITS);
  }

  create() {
    this._warmBackground();
    this._revealLines();
  }

  // --- private ---

  _heightFor(kind) {
    if (kind === 'title') return CREDITS.TITLE_HEIGHT;
    if (kind === 'header') return CREDITS.HEADER_HEIGHT;
    return CREDITS.BODY_HEIGHT;
  }

  async _revealLines() {
    let y = CREDITS.START_Y;
    for (const line of LINES) {
      if (line.blank) {
        y += CREDITS.SECTION_GAP;
        continue;
      }
      const text = new TypewriterText(this, CREDITS.CENTER_X, y, line.text, this._styleFor(line.kind)).setOrigin(0.5, 0);
      this.add.existing(text);
      await this._typeLine(text);
      y += this._heightFor(line.kind);
      await this._wait(CREDITS.BETWEEN_MS);
    }
    await this._wait(CREDITS.POST_MS);
    this._showReplay();
  }

  _showReplay() {
    const replay = this.add
      .text(GAME.WIDTH / 2, CREDITS.REPLAY_Y, CREDITS.REPLAY_LABEL, {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CREDITS.REPLAY_FONT,
        color: CREDITS.REPLAY_COLOR,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: replay,
      alpha: CREDITS.REPLAY_BLINK_MIN,
      duration: CREDITS.REPLAY_BLINK_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Start a brand-new run: wipe progress in memory and on disk.
    this.input.keyboard.once('keydown-ENTER', () => {
      PlayerState.reset();
      SaveSystem.clear();
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  _styleFor(kind) {
    const base = { fontFamily: FONTS.SERIF, color: CREDITS.TEXT_COLOR, align: 'center' };
    if (kind === 'title') {
      return { ...base, fontSize: CREDITS.TITLE_FONT };
    }
    if (kind === 'header') {
      return { ...base, fontSize: CREDITS.HEADER_FONT, fontStyle: 'bold' };
    }
    return { ...base, fontSize: CREDITS.BODY_FONT, lineSpacing: CREDITS.BODY_LINE_SPACING };
  }

  _typeLine(text) {
    return new Promise((resolve) => {
      text.once('complete', resolve);
      text.play(CREDITS.SPEED_MS);
    });
  }

  _wait(ms) {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  // Page warms from white to pale cream over the first few seconds.
  _warmBackground() {
    const start = Phaser.Display.Color.IntegerToColor(CREDITS.BG_START);
    const end = Phaser.Display.Color.IntegerToColor(CREDITS.BG_END);
    this.cameras.main.setBackgroundColor(CREDITS.BG_START);
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: CREDITS.BG_SHIFT_MS,
      onUpdate: (tween) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(start, end, 100, tween.getValue());
        this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      },
    });
  }
}
