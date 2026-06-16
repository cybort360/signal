import TypewriterText from '../ui/TypewriterText.js';
import DialogBox from '../ui/DialogBox.js';
import PlayerState from '../systems/PlayerState.js';
import { CH1_DIALOG, FONTS } from '../config/Constants.js';

// The two dialogue choices offered after each decoded message, in puzzle order.
const CHOICE_PAIRS = [
  ['I understand', "I don't follow"],
  ['Remarkable', 'Troubling'],
  ['What does it mean?', 'Better not to know'],
  ['Some secrets should stay hidden', 'Nothing should stay hidden'],
];

// Brings Turing on between puzzles. appear() asks GeminiService for his line (which
// always resolves, falling back to pre-written text offline), shows it in a
// DialogBox with the two choices for that puzzle, records the pick in PlayerState,
// and resolves with the chosen label so the scene can advance.
export default class TuringNPC {
  constructor(scene, geminiService) {
    this.scene = scene;
    this.gemini = geminiService;
    this._appearance = 0;
    this._dialog = null;
  }

  async appear(decodedMessage, priorChoices) {
    const response = await this.gemini.getTuringResponse(decodedMessage, priorChoices);
    const choices = CHOICE_PAIRS[Math.min(this._appearance, CHOICE_PAIRS.length - 1)];
    this._appearance += 1;

    const typewriter = new TypewriterText(this.scene, 0, 0, response, {
      fontFamily: FONTS.MONOSPACE,
      fontSize: CH1_DIALOG.TEXT_FONT,
      color: CH1_DIALOG.TEXT_COLOR,
      wordWrap: { width: CH1_DIALOG.TEXT_WRAP },
    });
    this._dialog = new DialogBox(this.scene, { typewriter, choices, portraitLabel: 'TURING' });
    this._dialog.show();

    return new Promise((resolve) => {
      this._dialog.once('choice_made', (choice) => {
        PlayerState.addTuringChoice(choice);
        this.hide();
        resolve(choice);
      });
    });
  }

  hide() {
    if (!this._dialog) {
      return;
    }
    const dialog = this._dialog;
    dialog.hide();
    this.scene.time.delayedCall(CH1_DIALOG.FADE_MS + 20, () => dialog.destroy());
    this._dialog = null;
  }
}
