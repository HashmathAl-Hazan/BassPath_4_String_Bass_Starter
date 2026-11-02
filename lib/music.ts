import type { Score, ScoreEvent, TempoUnit } from '../content-types';

export const OPEN_MIDI = { 1: 43, 2: 38, 3: 33, 4: 28 } as const;
export const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export const ticksPerBeat = (unit: TempoUnit) => unit === 'quarter' ? 96 : unit === 'dotted-quarter' ? 144 : 48;
export const barTicks = (ppq: number, numerator: number, denominator: number) => ppq * 4 * numerator / denominator;
export const secondsForTicks = (ticks: number, bpm: number, tempoUnitTicks: number) => ticks / tempoUnitTicks * 60 / bpm;
export const noteFrequency = (string: 1 | 2 | 3 | 4, fret: number) => midiToFrequency(OPEN_MIDI[string] + fret);
export const scoreEndTick = (score: Score) => Math.max(score.bars * barTicks(score.ppq, score.meter.numerator, score.meter.denominator), ...score.events.map(event => event.start_tick + event.duration_ticks));

type AudioPreferences = { master: number; bass: number; drums: number; click: number; muted: boolean };
const envNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};
const defaultPreferences: AudioPreferences = {
  master: envNumber(process.env.NEXT_PUBLIC_AUDIO_MASTER_VOLUME, 0.82),
  bass: envNumber(process.env.NEXT_PUBLIC_AUDIO_BASS_VOLUME, 0.9),
  drums: envNumber(process.env.NEXT_PUBLIC_AUDIO_DRUMS_VOLUME, 0.65),
  click: envNumber(process.env.NEXT_PUBLIC_AUDIO_CLICK_VOLUME, 0.58),
  muted: false
};
let preferences: AudioPreferences = defaultPreferences;
let context: AudioContext | null = null;
let output: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let activeStop: (() => void) | null = null;

export function getAudioPreferences() { return preferences; }
export function loadAudioPreferences(): AudioPreferences {
  if (typeof localStorage === 'undefined') return preferences;
  try { preferences = { ...defaultPreferences, ...JSON.parse(localStorage.getItem('basspath-audio') || '{}') }; } catch { preferences = defaultPreferences; }
  return preferences;
}
export function setAudioPreferences(next: Partial<AudioPreferences>) {
  preferences = { ...preferences, ...next };
  if (typeof localStorage !== 'undefined') localStorage.setItem('basspath-audio', JSON.stringify(preferences));
  if (output && compressor) {
    const now = output.context.currentTime;
    output.gain.cancelScheduledValues(now);
    output.gain.setTargetAtTime(preferences.muted ? 0 : preferences.master, now, 0.025);
    compressor.threshold.value = -8;
  }
  return preferences;
}
export function getAudioState() { return context ? context.state : 'uninitialized'; }

export async function ensureAudio() {
  if (typeof window === 'undefined') return false;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return false;
  if (!context) {
    context = new AudioContextCtor();
    output = context.createGain();
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -8; compressor.knee.value = 12; compressor.ratio.value = 4;
    compressor.attack.value = 0.003; compressor.release.value = 0.16;
    output.connect(compressor).connect(context.destination);
    setAudioPreferences(preferences);
  }
  if (context.state === 'suspended') await context.resume();
  return context.state === 'running';
}

function pluck(frequency: number, start: number, duration: number, volume: number, type: OscillatorType = 'triangle') {
  if (!context || !output) return null;
  const osc = context.createOscillator(); const amp = context.createGain(); const tone = context.createBiquadFilter();
  osc.type = type; osc.frequency.value = frequency; tone.type = 'lowpass'; tone.frequency.setValueAtTime(Math.min(1800, frequency * 10), start);
  const peak = Math.min(0.55, Math.max(0.015, volume));
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.14), start + Math.max(0.09, duration * 0.55));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.14, duration));
  osc.connect(tone).connect(amp).connect(output); osc.start(start); osc.stop(start + Math.max(0.18, duration) + 0.03);
  return osc;
}

export async function playMidi(midi: number, seconds = 0.8, volume = 0.58) {
  if (!(await ensureAudio()) || !context) return false;
  pluck(midiToFrequency(midi), context.currentTime + 0.01, seconds, volume * preferences.bass);
  return true;
}

export async function playScore(score: Score, bpm: number, master = 1, bassVolume = 1, clickVolume = 1) {
  if (!(await ensureAudio()) || !context) return () => undefined;
  activeStop?.(); const scheduled: OscillatorNode[] = []; const now = context.currentTime + 0.06; const unit = score.tempo_unit_ticks;
  const schedule = (frequency: number, start: number, duration: number, gain: number, type: OscillatorType) => {
    const before = context; if (!before) return;
    const node = pluck(frequency, start, duration, gain * master, type);
    if (node) scheduled.push(node);
  };
  for (const event of score.events) {
    const start = now + secondsForTicks(event.start_tick, bpm, unit);
    const duration = secondsForTicks(event.duration_ticks * score.gate_ratio, bpm, unit);
    if (event.kind === 'note') schedule(noteFrequency(event.string, event.fret), start, duration, (event.velocity / 127) * bassVolume * preferences.bass, 'triangle');
    if (event.kind === 'ghost') schedule(110, start, Math.min(0.06, duration), (event.velocity / 127) * bassVolume * preferences.bass * 0.35, 'square');
  }
  const end = scoreEndTick(score);
  for (let tick = -score.count_in_bars * score.ppq * 4; tick < end; tick += unit) {
    const start = now + secondsForTicks(tick, bpm, unit);
    if (start > now) schedule(tick % (score.ppq * 4) === 0 ? 880 : 440, start, 0.045, clickVolume * preferences.click, 'square');
  }
  const timeout = window.setTimeout(() => { activeStop = null; }, Math.max(100, secondsForTicks(end + score.count_in_bars * score.ppq * 4, bpm, unit) * 1000 + 300));
  activeStop = () => { window.clearTimeout(timeout); scheduled.forEach(node => { try { node.stop(); } catch { /* already stopped */ } }); };
  return activeStop;
}

export function stopAudio() { activeStop?.(); activeStop = null; }
export const eventDuration = (event: ScoreEvent) => event.duration_ticks;
