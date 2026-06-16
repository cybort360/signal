export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  CHAPTER_1: 'Chapter1Scene',
  CHAPTER_2: 'Chapter2Scene',
  CHAPTER_3: 'Chapter3Scene',
  TRANSITION: 'TransitionScene',
  CREDITS: 'CreditsScene',
};

export const ASSET_KEYS = {
  // Chapter 1
  ENIGMA_WHEEL: 'enigma-wheel',
  TURING_PORTRAIT: 'turing-portrait',
  TERMINAL_BG: 'terminal-bg',
  // Chapter 2
  SIGNAL_PARTICLE: 'signal-particle',
  CITIZEN_SPRITE: 'citizen-sprite',
  OBSTACLE_SPRITE: 'obstacle-sprite',
  TEXAS_LANDSCAPE: 'texas-landscape',
  // Chapter 3
  SOLSTICE_SKY: 'solstice-sky',
  // UI
  DIALOG_BOX: 'dialog-box',
  PROGRESS_BAR_BG: 'progress-bar-bg',
  PROGRESS_BAR_FILL: 'progress-bar-fill',
  // Audio
  MUSIC_CH1: 'music-chapter1',
  MUSIC_CH2: 'music-chapter2',
  MUSIC_CH3: 'music-chapter3',
  SFX_KEY_CLICK: 'sfx-key-click',
  SFX_DECODE: 'sfx-decode',
  SFX_LIBERATION: 'sfx-liberation',
  SFX_TRANSITION: 'sfx-transition',
  // Generated placeholder textures (drawn at runtime).
  GEN_PLAYER_DOT: 'gen-player-dot',
  GEN_TRAIL_DOT: 'gen-trail-dot',
  GEN_OBSTACLE: 'gen-obstacle',
  GEN_SOLSTICE_GLOW: 'gen-solstice-glow',
  // Gradient textures painted from the art-direction palette arc.
  GEN_CH1_NIGHT: 'gen-ch1-night',
  GEN_CH2_SKY: 'gen-ch2-sky',
  GEN_CH2_SUN: 'gen-ch2-sun',
  GEN_CH3_SKY: 'gen-ch3-sky',
  GEN_CH3_AURORA: 'gen-ch3-aurora',
  GEN_STAR_GLOW: 'gen-star-glow',
};

export const ANIM_KEYS = {
  SIGNAL_IDLE: 'signal-idle',
};

export const EVENTS = {
  CIPHER_SOLVED: 'cipher_solved',
  CITIZEN_REACHED: 'citizen_reached',
  CHAPTER_COMPLETE: 'chapter_complete',
  TURING_DIALOGUE_CHOICE: 'turing_dialogue_choice',
};

export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  BACKGROUND_COLOR: '#000000',
};

export const STORAGE = {
  SAVE_KEY: 'signal_save',
};

export const FONTS = {
  // Real webfonts loaded from Google Fonts (link in index.html, awaited in
  // PreloadScene). The pairing from the SIGNAL art-direction board: IBM Plex
  // Mono is the cool, exact voice of the system/signal (the machine, the cipher,
  // the coordinates); Newsreader is the literary serif that carries the human
  // emotion. System fonts are the fallback.
  MONOSPACE: "'IBM Plex Mono', monospace",
  SERIF: "'Newsreader', Georgia, serif",
};

// The neutral "ink & paper" spine that runs through every chapter so three
// palettes still read as one game (from the art-direction board).
export const INK = {
  PAPER: '#0d0c10', // near-black background
  TEXT: '#efe9dd', // warm off-white — the default voice colour
  MUTED: '#b8b1a3', // secondary text
  FAINT: '#8a8478', // labels, captions, eyebrows
  DIM: '#7e786c', // the quietest type
  ACCENT: '#e8893f', // shared warm accent (selection, small marks)
  PANEL: 0x141319, // card / panel fill
};

export const UI = {
  FADE_OVERLAY_DEPTH: 999,
};

export const AUDIO = {
  MUSIC_VOLUME: 0.7,
  MUSIC_FADE_MS: 1500,
  SFX_VOLUME: 0.5,
};

export const CHAPTER_1 = {
  TOTAL_CIPHERS: 4,
  WHEEL_RADIUS: 120,
  WHEEL_LETTERS: 26,
  DECODE_REVEAL_SPEED_MS: 40,
  TURING_DIALOGUE_OPTIONS: 2,
};

// Chapter 1 — "Night". A cold blue-black codebreaker's room lit by a single
// mint-green CRT (palette from the SIGNAL art-direction board). The harsh matrix
// green is gone: phosphor mint #6EE7A8 for live signal, deep #3F7C63 for the log,
// and a cool blue #7FB0FF for the still inner machinery.
export const CH1_VIEW = {
  BG_COLOR: '#05080e',
  // Radial night gradient painted top-right, like light spilling from one source.
  NIGHT_TOP: 0x11213c,
  NIGHT_MID: 0x0a1018,
  NIGHT_BOTTOM: 0x05080e,
  NIGHT_FOCUS_X_FRAC: 0.78,
  NIGHT_FOCUS_Y_FRAC: 0.14,
  DEPTH_NIGHT: -2,
  DEPTH_BG: 0,
  SCANLINE_COLOR: 0x6ee7a8,
  SCANLINE_ALPHA: 0.04,
  SCANLINE_GAP: 3,
  GRID_COLOR: 0x6ee7a8,
  GRID_ALPHA: 0.04,
  GRID_GAP: 40,
  // A soft band of phosphor light that drifts slowly down the screen.
  SCAN_SWEEP_COLOR: 0x6ee7a8,
  SCAN_SWEEP_ALPHA: 0.07,
  SCAN_SWEEP_HEIGHT: 150,
  SCAN_SWEEP_MS: 7000,
  DECODE_FLASH_COLOR: 0x06231a,
  DECODE_FLASH_MS: 600,
  INDICATOR_Y: 30,
  INDICATOR_COLOR: '#5f9d80',
  INDICATOR_FONT: '18px',
  INDICATOR_LETTER_SPACING: 6,
  MESSAGE_X: 640,
  MESSAGE_Y: 96,
  MESSAGE_WRAP: 1040,
  CIPHER_COLOR: '#3f7c63',
  CIPHER_FONT: '26px',
  DECODED_COLOR: '#eafff4',
  WHEEL_X: 640,
  WHEEL_Y: 412,
  LETTER_COLOR: '#2f5d49',
  LETTER_FONT: '22px',
  SELECTED_COLOR: '#6ee7a8',
  SELECTED_SCALE: 1.4,
  GLOW_COLOR: 0x6ee7a8,
  GLOW_RADIUS: 22,
  OUTER_RING_COLOR: 0x6ee7a8,
  OUTER_RING_ALPHA: 0.45,
  OUTER_RING_WIDTH: 2,
  ROTATE_MS: 120,
  POINTER_COLOR: 0x6ee7a8,
  POINTER_SIZE: 12,
  HINT_Y_OFFSET: 60,
  HINT_FONT: '30px',
  HINT_SPACING: 28,
  HINT_REVEAL_COLOR: '#eafff4',
  HINT_BLANK_COLOR: '#2f5d49',
  SHAKE_OFFSET: 14,
  SHAKE_MS: 300,
  HELP_Y: 692,
  HELP_COLOR: '#3f7c63',
  HELP_FONT: '15px',
  DEPTH_POINTER: 5,
};

// Chapter 1 dialogue box (Turing). Child positions are relative to the box centre.
export const CH1_DIALOG = {
  X: 640,
  Y: 586,
  PANEL_W: 1180,
  PANEL_H: 250,
  PANEL_COLOR: 0x06120e,
  PANEL_ALPHA: 0.95,
  PANEL_STROKE: 0x2f5d49,
  PORTRAIT_W: 150,
  PORTRAIT_H: 190,
  PORTRAIT_COLOR: 0x0a1f18,
  PORTRAIT_LABEL_COLOR: '#6ee7a8',
  PORTRAIT_LABEL_FONT: '20px',
  TEXT_X: -388,
  TEXT_Y: -92,
  TEXT_WRAP: 900,
  TEXT_COLOR: '#d8ffe8',
  TEXT_FONT: '22px',
  CHOICE_X: -388,
  CHOICE_Y1: 40,
  CHOICE_Y2: 84,
  CHOICE_COLOR: '#5f9d80',
  CHOICE_HOVER: '#6ee7a8',
  CHOICE_FONT: '20px',
  DEPTH: 200,
  FADE_MS: 200,
};

export const CHAPTER_2 = {
  SCROLL_SPEED: 220,
  PLAYER_SPEED_Y: 300,
  TOTAL_LIVES: 3,
  CHECKPOINT_INTERVAL_MS: 30000,
  CITIZEN_LIBERATE_RADIUS: 60,
  PRIDE_COLORS: ['#FF0018', '#FFA52C', '#FFFF41', '#008018', '#0000F9', '#86007D', '#FFFFFF'],
  PLAYER_SPAWN_X: 200,
  VERTICAL_PADDING: 40,
  LEVEL_LENGTH_SCREENS: 8,
  DESPAWN_MARGIN_SCREENS: 2,
  CAMERA_LERP_X: 0.08,
  DEATH_FREEZE_MS: 800,
  DEATH_FLASH_REPEATS: 3,
  DEATH_FLASH_TINT: 0xff0000,
  RESPAWN_INVULN_MS: 1200,
  CITIZEN_SPACING_MIN: 600,
  CITIZEN_SPACING_MAX: 900,
};

// Chapter 2 — "Dawn". A sky that warms from night-purple at the crown to gold at
// the horizon, a breathing sun rising behind the land, and rounded Texas hills in
// parallax (palette from the art-direction board). Grey figures warm to full life
// as the signal reaches them; the world itself stays sepia.
export const CH2_VIEW = {
  PLAYER_RADIUS: 16,
  PLAYER_COLOR: 0xfff2a8,
  TRAIL_DOT_RADIUS: 6,
  TRAIL_WHITE: 0xffffff,
  TRAIL_GOLD: 0xffd24d,
  TRAIL_LIFESPAN_MS: 400,
  TRAIL_FREQUENCY_MS: 26,
  TRAIL_QUANTITY: 2,
  TRAIL_SCALE_START: 0.6,
  // Citizen silhouette (head + torso + two legs); a warm grey before liberation.
  GREYSCALE_FILL: 0x6b6258,
  CITIZEN_HEAD_RADIUS: 10,
  CITIZEN_TORSO_W: 24,
  CITIZEN_TORSO_H: 40,
  CITIZEN_LEG_W: 9,
  CITIZEN_LEG_H: 26,
  CITIZEN_LEG_GAP: 4,
  CITIZEN_COLOR_TWEEN_MS: 600,
  BURST_COUNT: 20,
  BURST_SPEED: 200,
  BURST_LIFESPAN_MS: 600,
  // Obstacle: a dark angular chevron pointing left.
  OBSTACLE_W: 46,
  OBSTACLE_H: 120,
  OBSTACLE_FILL: 0x2c1410,
  OBSTACLE_STROKE: 0xb9472a,
  OBSTACLE_STROKE_W: 3,
  // Dawn sky: a four-stop vertical gradient, night-purple → ember → gold.
  SKY_CROWN: 0x2c1f33,
  SKY_UPPER: 0x6e2f33,
  SKY_LOWER: 0xb9472a,
  SKY_HORIZON: 0xf2a65a,
  // The rising sun: a soft radial bloom that breathes near the horizon.
  SUN_INNER: 0xffe6b0,
  SUN_OUTER: 0xf7b65c,
  SUN_RADIUS: 200,
  SUN_Y_FRACTION: 0.74,
  SUN_BREATHE_SCALE: 1.06,
  SUN_BREATHE_MS: 6000,
  // Two rounded hill silhouettes layered for depth along the horizon.
  HILL_FAR_COLOR: 0x5a2b2c,
  HILL_FAR_ALPHA: 0.7,
  HILL_FAR_HEIGHT: 200,
  HILL_FAR_WIDTH: 1.7, // multiples of the screen width
  HILL_MID_COLOR: 0x7a3a26,
  HILL_MID_ALPHA: 1,
  HILL_MID_HEIGHT: 150,
  HILL_MID_WIDTH: 1.4,
  // Ground band along the bottom (warm earth fading dark).
  GROUND_Y_FRACTION: 0.82,
  GROUND_TOP: 0x7a3d22,
  GROUND_BOTTOM: 0x3a1d12,
  DEPTH_BG: -10,
  DEPTH_SUN: -9,
  DEPTH_HILL_FAR: -8,
  DEPTH_HILL_MID: -7,
  DEPTH_GROUND: -6,
  DEPTH_TRAIL: 4,
  DEPTH_CITIZEN: 5,
  DEPTH_OBSTACLE: 6,
  DEPTH_PLAYER: 8,
  DEPTH_HUD: 100,
};

export const CH2_HUD = {
  PADDING: 20,
  LIFE_DOT_RADIUS: 7,
  LIFE_DOT_GAP: 22,
  LIFE_DOT_COLOR: 0xf5c842,
  LIFE_DOT_EMPTY: 0x3a2f12,
  PRIDE_DOT_RADIUS: 7,
  PRIDE_DOT_GAP: 22,
  PRIDE_EMPTY_COLOR: 0x444444,
};

export const CHAPTER_3 = {
  SOLSTICE_MONTH: 5, // 0-indexed, June
  SOLSTICE_DAY: 21,
  MAX_SIGNAL_LENGTH: 280,
  NARRATIVE_LOADING_DELAY_MS: 800,
  TYPEWRITER_SPEED_MS: 35,
};

// Chapter 3 — "Solstice". The longest night: a deep sky glowing warm at the
// horizon, an ambient field of stars, and a faint aurora low on the screen
// (scene from the art-direction board). The signature moment lives here — the
// player's own words rise and hold as a new point of light among the others.
export const CH3_VIEW = {
  // Radial night sky: a violet glow low and centred, fading up to deep blue.
  SKY_GLOW: 0x3a2b66,
  SKY_MID: 0x241a45,
  SKY_DEEP: 0x0d1330,
  SKY_FOCUS_X_FRAC: 0.5,
  SKY_FOCUS_Y_FRAC: 1.15,
  DEPTH_SKY: -20,
  // Ambient starfield: a still layer plus a few hand-twinkled stars.
  DEPTH_STARS: -16,
  STAR_COUNT: 64,
  STAR_FIELD_HEIGHT_FRAC: 0.72,
  STAR_COLOR: 0xffffff,
  STAR_MIN_ALPHA: 0.2,
  STAR_MAX_ALPHA: 0.7,
  STAR_MIN_SIZE: 1,
  STAR_MAX_SIZE: 2.6,
  STAR_TWINKLE_COUNT: 8,
  STAR_TWINKLE_MIN_MS: 2400,
  STAR_TWINKLE_MAX_MS: 5200,
  // Aurora glow along the horizon (green → violet → rose), very faint.
  DEPTH_AURORA: -15,
  AURORA_HEIGHT: 240,
  AURORA_GREEN: 0x5fe0a0,
  AURORA_VIOLET: 0xb87dff,
  AURORA_ROSE: 0xff5a7a,
  AURORA_ALPHA: 0.16,
  // The full spectrum a sent signal can take its hue from.
  SPECTRUM: [0xff5a7a, 0xff9a4d, 0xffd24d, 0x5fe0a0, 0x5aa0ff, 0xb87dff],
  DATE_Y: 40,
  DATE_FONT: '20px',
  DATE_COLOR: '#cfc8e6',
  SOLSTICE_LABEL: 'The longest day.',
  SOLSTICE_Y: 70,
  SOLSTICE_FONT: '18px',
  SOLSTICE_COLOR: '#e9d8ff',
  NARRATIVE_Y: 150,
  NARRATIVE_WRAP: 680,
  NARRATIVE_FONT: '24px',
  NARRATIVE_COLOR: '#f0ecff',
  NARRATIVE_LINE_SPACING: 14,
  NARRATIVE_PANEL_COLOR: 0x0d1330,
  NARRATIVE_PANEL_ALPHA: 0.4,
  NARRATIVE_PANEL_PAD: 40,
  LOADING_Y: 360,
  LOADING_FONT: '22px',
  LOADING_COLOR: '#9b8fd6',
  PROMPT_LABEL: 'What signal will you send?',
  PROMPT_Y: 430,
  PROMPT_FONT: '18px',
  PROMPT_COLOR: '#b8b1cf',
  // The player's message, then its rise into a point of light.
  MESSAGE_COLOR: '#f0ecff',
  MESSAGE_FONT: '34px',
  MESSAGE_WRAP: 900,
  MESSAGE_START_Y: 360,
  STAR_RISE_X_FRAC: 0.5,
  STAR_RISE_Y_FRAC: 0.32,
  STAR_RISE_MS: 1500,
  STAR_RISE_END_SCALE: 0.18,
  STAR_HUE: 0xffd24d,
  STAR_DOT_RADIUS: 9,
  STAR_GLOW_RADIUS_MULT: 4,
  STAR_BLOOM_MS: 600,
  STAR_BLOOM_FROM_SCALE: 0.3,
  STAR_TWINKLE_ALPHA: 0.6,
  STAR_LABEL_FONT: '14px',
  STAR_LABEL_COLOR: '#f0ecff',
  STAR_LABEL_OFFSET_Y: 26,
  STAR_LABEL_WRAP: 360,
  STAR_TWINKLE_MS: 2600,
  DEPTH_SIGNAL: 1,
  COUNTER_LABEL: 'LIGHTS IN THE SKY',
  COUNTER_OFFSET_Y: 44,
  COUNTER_FONT: '18px',
  COUNTER_COLOR: '#9b8fd6',
  INPUT_Y_FRACTION: 0.78,
  INPUT_WIDTH_PX: 600,
  INPUT_FONT_PX: 22,
  INPUT_TEXT_COLOR: '#f0ecff',
  INPUT_BORDER_COLOR: 'rgba(184,125,255,0.55)',
  FADE_IN_MS: 1200,
  LOADING_MS: 1800,
  LOADING_FADE_MS: 400,
  POST_NARRATIVE_MS: 1000,
  PROMPT_FADE_MS: 600,
  PRE_COMPOSER_MS: 600,
  POST_MESSAGE_MS: 2600,
  FADE_WHITE_MS: 2600,
  WHITE: 0xffffff,
};

// Menu — animated pre-solstice sky. A light, wide-tracked Newsreader masthead
// over a deep night that drifts navy ⇄ violet, with an art-direction eyebrow.
export const MENU = {
  BG_NAVY: 0x050510,
  BG_PURPLE: 0x0d0520,
  BG_CYCLE_MS: 8000,
  EYEBROW_LABEL: 'A GAME IN THREE TRANSMISSIONS',
  EYEBROW_FONT: '12px',
  EYEBROW_COLOR: '#8a8478',
  EYEBROW_LETTER_SPACING: 10,
  EYEBROW_Y: 244,
  TITLE: 'SIGNAL',
  TITLE_FONT: '108px',
  TITLE_WEIGHT: '300',
  TITLE_COLOR: '#f4efe5',
  TITLE_LETTER_SPACING: 12,
  TITLE_Y: 312,
  TITLE_PULSE_SCALE: 1.015,
  TITLE_PULSE_MS: 2500,
  PROMPT_LABEL: 'PRESS ENTER TO BEGIN',
  PROMPT_FONT: '14px',
  PROMPT_COLOR: '#8a8478',
  PROMPT_LETTER_SPACING: 6,
  PROMPT_Y: 444,
  PROMPT_BLINK_MIN: 0.4,
  PROMPT_BLINK_MS: 1200,
  SIGNAL_LINE_COUNT: 4,
  SIGNAL_LINE_COLOR: 0xffffff,
  SIGNAL_LINE_ALPHA: 0.03,
  SIGNAL_LINE_MIN_MS: 9000,
  SIGNAL_LINE_MAX_MS: 16000,
  SIGNAL_LINE_LENGTH: 220,
};

export const CREDITS = {
  BG_START: 0xffffff,
  BG_END: 0xfffdf5,
  BG_SHIFT_MS: 4000,
  CENTER_X: 640,
  START_Y: 54,
  TITLE_FONT: '56px',
  TITLE_HEIGHT: 80,
  HEADER_FONT: '20px',
  HEADER_HEIGHT: 30,
  BODY_FONT: '17px',
  BODY_HEIGHT: 28,
  BODY_LINE_SPACING: 10,
  SECTION_GAP: 40,
  TEXT_COLOR: '#1a1a1a',
  SPEED_MS: 18,
  BETWEEN_MS: 400,
  POST_MS: 3000,
  REPLAY_LABEL: 'PRESS ENTER TO PLAY AGAIN',
  REPLAY_Y: 670,
  REPLAY_FONT: '20px',
  REPLAY_COLOR: '#888888',
  REPLAY_BLINK_MIN: 0.4,
  REPLAY_BLINK_MS: 1200,
};

export const GEMINI = {
  // Current unified SDK (@google/genai) + a model on Google's free tier. Thinking
  // is disabled (budget 0): SIGNAL's short creative prose gains nothing from
  // reasoning tokens, and turning it off keeps calls fast and frugal on free quota.
  MODEL: 'gemini-2.5-flash',
  THINKING_BUDGET: 0,
  MAX_OUTPUT_TOKENS: 300,
  TEMPERATURE: 0.8,
  API_TIMEOUT_MS: 10000,
};

// Transition — documentary-style title card.
export const TRANSITION = {
  BG_COLOR: '#0d0c10',
  TEXT_COLOR: '#efe9dd',
  TEXT_SIZE: '28px',
  TEXT_WRAP: 600,
  TEXT_LINE_SPACING: 20, // ~1.8 line height at 28px
  RULE_COLOR: 0x3a352c,
  RULE_WIDTH: 400,
  RULE_OFFSET_Y: 104, // distance of each rule from the text centre
  RULE_FADE_DELAY_MS: 200,
  RULE_FADE_MS: 500,
  HOLD_AFTER_MS: 1200,
  FADE_MS: 800,
};

// Narrative copy shown on the cinematic TransitionScene between scenes.
export const TRANSITION_TEXT = {
  INTRO_CH1: '1943. Bletchley Park.\nA machine built to decode secrets\nby a man keeping one.',
  CH2_TO_CH3:
    'June 19, 1865. The word reached them.\nAll of them.\nWhat we carry forward is what we choose to carry.',
  CH1_TO_CH2:
    'He decoded a thousand secrets.\nHe could not decode his own freedom.\nBut you can carry his signal forward.',
};
