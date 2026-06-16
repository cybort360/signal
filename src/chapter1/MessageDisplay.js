import Phaser from 'phaser';
import { CHAPTER_1, CH1_VIEW, FONTS } from '../config/Constants.js';

// Terminal-style readout of the encrypted message. reveal() flips each enciphered
// letter to its plaintext counterpart, staggered left to right; spaces and
// punctuation never change. Emits 'reveal_complete' when the last letter lands.
export default class MessageDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this._text = scene.add
      .text(0, 0, '', {
        fontFamily: FONTS.MONOSPACE,
        fontSize: CH1_VIEW.CIPHER_FONT,
        color: CH1_VIEW.CIPHER_COLOR,
        align: 'center',
        wordWrap: { width: CH1_VIEW.MESSAGE_WRAP },
      })
      .setOrigin(0.5, 0);
    this.add(this._text);
    this._chars = [];
    scene.add.existing(this);
  }

  setCiphertext(ciphertext) {
    this._chars = ciphertext.split('');
    this._text.setColor(CH1_VIEW.CIPHER_COLOR);
    this._text.setText(ciphertext);
  }

  // Flip the letters to `plaintext` over time. Only positions that are letters in
  // the ciphertext animate; everything else is already correct and stays put.
  reveal(plaintext) {
    const targets = plaintext.split('');
    const order = [];
    this._chars.forEach((char, i) => {
      if (/[A-Z]/.test(char)) {
        order.push(i);
      }
    });
    if (order.length === 0) {
      this.emit('reveal_complete');
      return;
    }
    let step = 0;
    this.scene.time.addEvent({
      delay: CHAPTER_1.DECODE_REVEAL_SPEED_MS,
      repeat: order.length - 1,
      callback: () => {
        const index = order[step];
        this._chars[index] = targets[index];
        this._text.setText(this._chars.join(''));
        step += 1;
        if (step >= order.length) {
          // Fully decoded — the plaintext reads in white.
          this._text.setColor(CH1_VIEW.DECODED_COLOR);
          this.emit('reveal_complete');
        }
      },
    });
  }
}
