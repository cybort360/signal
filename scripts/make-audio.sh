#!/usr/bin/env bash
# Generates SIGNAL's original audio with ffmpeg — three seamless chapter loops and
# four SFX, encoded to both .ogg (primary) and .mp3 (fallback). All tones are
# license-free and authored here. Music loops use integer-Hz tones over an
# integer-second length so every partial completes a whole number of cycles and
# the loop is seamless (no afade on music — AudioManager fades volume at runtime).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/audio"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT/chapter1" "$OUT/chapter2" "$OUT/chapter3" "$OUT/ui"

# Encode a wav into ogg + mp3 next to the given output path stem.
encode() {
  local wav="$1" stem="$2"
  ffmpeg -y -loglevel error -i "$wav" -ac 2 -c:a vorbis -strict experimental -q:a 4 "$stem.ogg"
  ffmpeg -y -loglevel error -i "$wav" -ac 1 -c:a libmp3lame -q:a 5 "$stem.mp3"
}

LEN=24 # seconds per music loop

# --- Chapter 1: "Night" — a stark open-fifth drone (A power chord), cold and
# precise, breathing slowly. Heavily low-passed; a faint high E wavers above. ---
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=55:duration=$LEN" \
  -f lavfi -i "sine=frequency=110:duration=$LEN" \
  -f lavfi -i "sine=frequency=165:duration=$LEN" \
  -f lavfi -i "sine=frequency=330:duration=$LEN" \
  -filter_complex "[0]volume=0.34[a];[1]volume=0.26[b];[2]volume=0.20[c];[3]volume=0.10,tremolo=f=0.25:d=0.7[d];[a][b][c][d]amix=inputs=4:normalize=0,lowpass=f=820,tremolo=f=0.125:d=0.3,aecho=0.8:0.35:90:0.25,alimiter=limit=0.9" \
  "$TMP/night.wav"
encode "$TMP/night.wav" "$OUT/chapter1/night"

# --- Chapter 2: "Dawn" — a warm A-major pad, hopeful and forward, a higher tone
# pulsing gently like light spreading. Brighter low-pass than Ch1. ---
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=110:duration=$LEN" \
  -f lavfi -i "sine=frequency=139:duration=$LEN" \
  -f lavfi -i "sine=frequency=165:duration=$LEN" \
  -f lavfi -i "sine=frequency=220:duration=$LEN" \
  -f lavfi -i "sine=frequency=330:duration=$LEN" \
  -filter_complex "[0]volume=0.26[a];[1]volume=0.20[b];[2]volume=0.20[c];[3]volume=0.18[d];[4]volume=0.12,tremolo=f=0.5:d=0.6[e];[a][b][c][d][e]amix=inputs=5:normalize=0,lowpass=f=1700,aecho=0.8:0.4:140:0.3,alimiter=limit=0.9" \
  "$TMP/dawn.wav"
encode "$TMP/dawn.wav" "$OUT/chapter2/dawn"

# --- Chapter 3: "Solstice" — a high, shimmering A-major-add9 chord, still and
# luminous, drenched in reverb. Soft. ---
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=220:duration=$LEN" \
  -f lavfi -i "sine=frequency=277:duration=$LEN" \
  -f lavfi -i "sine=frequency=330:duration=$LEN" \
  -f lavfi -i "sine=frequency=494:duration=$LEN" \
  -filter_complex "[0]volume=0.22[a];[1]volume=0.18[b];[2]volume=0.18[c];[3]volume=0.12,tremolo=f=0.5:d=0.5[d];[a][b][c][d]amix=inputs=4:normalize=0,lowpass=f=2600,aecho=0.85:0.45:220:0.35,aecho=0.85:0.3:480:0.25,tremolo=f=0.125:d=0.25,alimiter=limit=0.85" \
  "$TMP/solstice.wav"
encode "$TMP/solstice.wav" "$OUT/chapter3/solstice"

# --- SFX ---

# Key click — a short high tick.
ffmpeg -y -loglevel error -f lavfi -i "sine=frequency=2000:duration=0.05" \
  -filter_complex "afade=t=out:st=0.012:d=0.038,volume=0.5" "$TMP/key.wav"
encode "$TMP/key.wav" "$OUT/ui/key-click"

# Decode — a bright rising C–E–G arpeggio: the cipher resolves.
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=523:duration=0.12" \
  -f lavfi -i "sine=frequency=659:duration=0.12" \
  -f lavfi -i "sine=frequency=784:duration=0.18" \
  -filter_complex "[0]afade=t=out:st=0.09:d=0.03[a];[1]afade=t=out:st=0.09:d=0.03[b];[2]afade=t=in:d=0.01,afade=t=out:st=0.11:d=0.07[c];[a][b][c]concat=n=3:v=0:a=1,volume=0.55,aecho=0.8:0.3:45:0.2" \
  "$TMP/decode.wav"
encode "$TMP/decode.wav" "$OUT/ui/decode"

# Liberation — a warm A-major chord bloom: a citizen regains color.
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=220:duration=1.0" \
  -f lavfi -i "sine=frequency=277:duration=1.0" \
  -f lavfi -i "sine=frequency=330:duration=1.0" \
  -f lavfi -i "sine=frequency=440:duration=1.0" \
  -filter_complex "[0]volume=0.30[a];[1]volume=0.24[b];[2]volume=0.24[c];[3]volume=0.16[d];[a][b][c][d]amix=inputs=4:normalize=0,afade=t=in:d=0.22,afade=t=out:st=0.62:d=0.38,aecho=0.8:0.4:130:0.3,alimiter=limit=0.9" \
  "$TMP/liberation.wav"
encode "$TMP/liberation.wav" "$OUT/ui/liberation"

# Transition — a soft falling chirp, a signal passing between chapters.
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc=0.45*sin(2*PI*(620+(120-620)*t/1.4)*t):d=0.7" \
  -filter_complex "afade=t=in:d=0.12,afade=t=out:st=0.45:d=0.25,lowpass=f=2200,aecho=0.8:0.4:160:0.3,volume=0.7" \
  "$TMP/transition.wav"
encode "$TMP/transition.wav" "$OUT/ui/transition"

echo "--- generated ---"
find "$OUT" -type f \( -name '*.ogg' -o -name '*.mp3' \) | sort
du -sh "$OUT"
