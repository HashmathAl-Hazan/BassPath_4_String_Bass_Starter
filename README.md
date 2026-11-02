# 🎸 BassPath

> **Four strings. A steady pulse. A clear next step.**

BassPath is a local-first learning website for four-string electric bass in standard **E1–A1–D2–G2** tuning. It turns a substantial curriculum into a practical daily companion for beginners progressing toward confident worship, rehearsal and band playing.

## ✨ What the website does

| Area | Experience |
|---|---|
| 🏠 **Today** | A rotating 28-day practice suggestion, daily blocks, review guidance and progress snapshot |
| 📚 **Learn** | Seven levels, 21 modules and 84 complete lessons with explanations, guided steps, exercises and quizzes |
| 🎛️ **Practice** | Scored exercises, tempo-aware playback, tuning tones, fretboard exploration, studies and journal |
| 🎧 **Ear training** | Six modes with 120 synthesized questions, replayable stimuli and answer history |
| 🎸 **Bass Lab** | Playable EADG fretboard with touch, mouse and keyboard interaction, note labels and lesson-following mode |
| 🔗 **Resources** | Searchable publisher links filtered by level and topic |
| 📈 **Progress** | Completed lessons, practice minutes, ear results, notes, backups and settings |

The app never pretends that time spent equals musical accuracy. Practical playing criteria remain explicit learner or teacher self-assessments.

## 🎨 Visual direction

- Deep navy navigation for focus
- Warm off-white learning canvas for comfortable reading
- Teal controls and highlights for musical action
- Gold callouts for reminders and technique corrections
- Responsive cards, touch-sized controls and safe-area mobile navigation
- Reduced-motion support for accessible practice feedback

## 🔊 Audio experience

BassPath uses the browser’s native Web Audio API:

- Correct sounding MIDI frequencies for EADG bass
- Shared lazy `AudioContext` rather than one context per note
- Plucked oscillator timbre with decaying harmonics
- Shared output compressor and smooth gain ramps
- Master, bass, drums and click levels
- Mute, sound unlock and stop-all controls
- Persisted audio preferences in local storage
- Correct PPQ, meter and tempo-unit interpretation for supplied scores

The browser can control application gain, but cannot override a phone’s physical speaker or system volume limits.

## 🧱 How it is built

```text
Next.js App Router
├── app/page.tsx          Main client experience and navigation
├── app/BassLab.tsx       Interactive playable fretboard
├── app/AudioControls.tsx Persistent audio controls
├── app/globals.css       Responsive visual system
├── lib/content.ts        Typed JSON content repository
├── lib/music.ts          Shared Web Audio engine and timing math
├── lib/store.ts          IndexedDB progress and backup helpers
├── content/              Immutable lessons, exercises and music data
└── scripts/              Content and focused validation checks
```

### Data architecture

The supplied JSON remains the source of truth. Content is imported through TypeScript contracts in `content-types.ts`; lesson files are loaded by level so the entire curriculum is not placed into the first page bundle.

User data is separate from immutable content:

- IndexedDB stores progress, attempts and sessions
- Local storage stores small preferences such as theme and audio mix
- JSON backups are versioned and validated before replacement
- Audio recordings are intentionally kept separate from JSON backups

## 🚀 Run locally

```powershell
cd C:\Users\nhaha\Downloads\BassPath_4_String_Bass_Starter_Pack\basspath-pack
npm install
npm run dev
```

Open `http://localhost:3000`.

The included `.env` contains the non-secret app and audio defaults. BassPath does not require API keys, cloud credentials, a database, or sign-in.

## ✅ Verification commands

```powershell
npm run validate-content
npm run test:focused
npm run typecheck
npm run lint
npm run build
```

The content validator covers the supplied curriculum’s IDs, relationships, pitch invariants, score timelines, tempo units, audio stimuli and resource references.

## 🎼 Musical correctness highlights

- Open strings are MIDI **28, 33, 38, 43**
- `MIDI = open-string MIDI + fret`
- `frequency = 440 × 2^((MIDI - 69) / 12)`
- E-string fret 5 equals open A
- Any string’s fret 12 is exactly one octave above its open note
- Tab orientation is G / D / A / E from top to bottom
- Rests remain silent and supplied swing/triplet timing is not reinterpreted

## 🧭 Honest limitations

- Actual iOS and Android speaker loudness has not been physically tested.
- Microphone recording depends on browser permission and device support.
- Publisher resources require internet access and are never embedded or scraped.
- Bass Lab currently follows the first available scored exercise rather than offering a full exercise picker.
- Playing quality is not automatically judged by the browser.

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for the latest implementation checkpoints and verification record.
