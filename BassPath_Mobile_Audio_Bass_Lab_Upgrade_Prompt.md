# BassPath upgrade prompt: mobile UI, louder audio and Bass Lab

You are working in my EXISTING BassPath website repository. Implement the following upgrade directly in the project. First inspect the current UI, dependencies, navigation, audio engine and relevant project instructions. Preserve the existing curriculum, routes, progress, recordings, backups and working features. Use the current stack and design language; avoid a rewrite.

If BUILD_SPEC.md exists, read its relevant sections. This request replaces its earlier "keep defaults quiet" direction with clear, comfortably audible playback and proper user volume control. Diagnose the actual implementation before deciding what causes the low volume.

## 1. Make the entire website work well on phones

Audit every existing screen, including lessons, exercises, quizzes, ear training, practice tools, progress and settings.

- Use fluid layouts. Stack desktop columns on small screens and make cards, dialogs, forms and media fit their containers.
- Adapt navigation to a compact mobile menu or bottom navigation consistent with the current app.
- Keep primary practice controls easy to reach. Respect device safe areas and ensure sticky controls never cover content.
- Use readable text, visible focus states and touch targets at least 44 by 44 CSS pixels. No essential hover-only actions.
- Remove accidental page-level horizontal overflow. Allow local scrolling only where necessary, such as long tablature.
- Support portrait and landscape without requiring rotation. Keep the desktop experience polished.
- Verify at 360, 390, 430, 768 and 1440 CSS pixels, including long text, open dialogs and navigation.

## 2. Diagnose and improve quiet playback throughout the app

Inspect all app-controlled audio: lesson demonstrations, guide bass, ear-training examples, metronome, drums and the new instrument. Check source amplitude, envelopes, duplicated attenuation, track/master gains, media volume, compression and suspended audio state.

- Fix the real cause. Produce a clearly louder, balanced mix without distortion; do not blindly multiply every source's gain.
- Reuse one shared, lazily initialized AudioContext and output graph. Keep browser audio code client-side and clean up sources correctly.
- Provide a useful master volume control, mute, and separate bass/drums/click levels where relevant. Persist preferences and preserve explicit user choices.
- Use smooth gain changes, brief attack/release ramps, polyphony headroom and measured peak control. A compressor alone is not a guaranteed hard limiter.
- Make sound available after a tap or click. Resume suspended audio during a valid user gesture and show an actionable Enable Sound control if needed.
- Improve bass timbre with a plucked attack and decaying harmonics. Offer a speaker-friendly tone with audible upper harmonics while preserving the correct fundamental pitch. Do not transpose bass notes up an octave to make them louder.
- Preserve the existing shared transport, tempo interpretation, count-in, loops and stop behavior. Repeated Play must not create duplicate playback.
- Check representative notes and the loudest supported bass/drum/click combination for clipping. Explain any remaining device-speaker limitation without claiming the browser can change system volume.

## 3. Add a creative, playable Bass Lab screen

Add a discoverable Bass Lab entry to the existing navigation.

Visual direction: a warm wooden bass/fretboard against the existing dark interface, metallic strings with appropriate thickness, clean fret markers, subtle teal highlights and a prominent current-note label. Use lightweight SVG/HTML and Framer Motion for string vibration, fret selection and transitions. Reuse the installed animation package; do not install both framer-motion and motion or introduce a heavy 3D engine.

The instrument must be playable, not just decorative:

- Four strings in standard tuning. In a horizontal tab-style view, display G, D, A, E from top to bottom.
- Implement frets 0–12. On desktop show the full range when space permits. On phones show about five frets at a time with clear previous/next range controls and always-accessible open-string buttons.
- Place generous transparent hit targets over the string/fret cells. Tapping a cell immediately plucks that note, highlights the selected fret and animates a short, decaying vibration on the played string.
- Include a small picking area with one target per string to replay that string's selected fret. Default to its open note. Two simultaneous touches on different strings should work.
- Show note name, octave, string and fret. A simple note-label toggle should help beginners explore without clutter.
- Provide Explore mode and Follow Lesson mode. Reuse an existing scored exercise in Follow Lesson; highlight its notes against the existing audio transport and expose play/pause, tempo and loop. Keep rests silent and preserve the exercise's meter and timing.
- Animate visual feedback with Motion, but trigger notes from native pointer/keyboard handling. Do not wait for an animation or React render to start audio.
- Support touch, mouse and keyboard. Provide accessible note labels, arrow-key navigation and Enter/Space activation. Avoid double-triggering from both pointer and click handlers.
- Handle pointer IDs, cancellation, capture loss, blur, hidden tabs and route changes so no notes or animations remain stuck. Restrict touch-action overrides to the instrument surface so the page remains scrollable.
- Respect reduced-motion preferences with simple highlighting instead of string movement. Keep sound and interaction fully functional.
- Reuse existing synthesis where suitable. If new samples are needed, use only appropriately licensed local assets; core playback should not depend on a paid API or runtime download.

Musical correctness is mandatory. Use SOUNDING MIDI pitches:

| String number | Open note | MIDI |
| --- | --- | --- |
| 4 | E1 | 28 |
| 3 | A1 | 33 |
| 2 | D2 | 38 |
| 1 | G2 | 43 |

For a fretted note: MIDI = open-string MIDI + fret.
Frequency in Hz = 440 * 2 ** ((MIDI - 69) / 12).

Verify that E-string fret 5 equals open A, and fret 12 is exactly one octave above the same open string. Screen resizing and fret-range changes must preserve correct hit-to-note mapping.

## 4. Finish and verify

Implement the work; do not stop at a proposal. Keep changes focused and reuse existing components, content and tests.

Run relevant existing validation, typecheck, lint and production build. Add focused tests for pitch mapping and audio lifecycle where useful. Browser-check mobile layouts, rapid tapping, simultaneous strings, sound unlock, mute/volume persistence, range changes, reduced motion and existing lesson playback. Listen to audio if the environment permits; distinguish browser emulation from actual iOS/Android testing and report any untested behavior honestly.

Update the existing implementation status/README briefly. Finish with a concise report: what changed, the diagnosed volume cause, checks actually run and any remaining limitations. Keep chat output short, avoid dumping full files or curriculum JSON, and continue through routine implementation decisions without repeated confirmation.

