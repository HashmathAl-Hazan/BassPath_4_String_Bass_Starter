'use client';

import { useEffect, useMemo, useState } from 'react';
import { allExercises, bass } from '../lib/content';
import { ensureAudio, midiToFrequency, playMidi, playScore, stopAudio } from '../lib/music';

const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const strings = [1, 2, 3, 4] as const;
const openMidi = (string: 1 | 2 | 3 | 4) => bass.strings.find(item => item.number === string)?.open_midi ?? 28;

export default function BassLab() {
  const [range, setRange] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [played, setPlayed] = useState<number | null>(null);
  const [labels, setLabels] = useState(true);
  const [mode, setMode] = useState<'explore' | 'follow'>('explore');
  const [bpm, setBpm] = useState(80);
  const follow = allExercises.find(exercise => exercise.score);
  useEffect(() => () => stopAudio(), []);
  const cells = useMemo(() => Array.from({ length: 5 }, (_, index) => range + index), [range]);
  const trigger = (string: 1 | 2 | 3 | 4, fret = selected[string] ?? 0) => {
    void ensureAudio().then(() => playMidi(openMidi(string) + fret, 0.9, 0.72));
    setSelected(current => ({ ...current, [string]: fret })); setPlayed(string);
    window.setTimeout(() => setPlayed(current => current === string ? null : current), 260);
  };
  const noteText = (string: 1 | 2 | 3 | 4, fret: number) => {
    const midi = openMidi(string) + fret;
    return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
  };
  return <div className="lab-shell">
    <div className="lab-header"><div><span className="eyebrow">Interactive instrument</span><h2 className="h2">Bass Lab</h2><p className="muted">Explore EADG or follow a real scored exercise. Every cell is a playable sounding pitch.</p></div><div className="lab-mode tabs"><button className={mode === 'explore' ? 'active' : ''} onClick={() => setMode('explore')}>Explore</button><button className={mode === 'follow' ? 'active' : ''} onClick={() => setMode('follow')}>Follow lesson</button></div></div>
    <section className="lab-card">
      <div className="lab-current"><div className="lab-note">{noteText(1, selected[1] ?? 0)}</div><div><b>Current note</b><br/><span className="small muted">String 1 · fret {selected[1] ?? 0} · {midiToFrequency(openMidi(1) + (selected[1] ?? 0)).toFixed(1)} Hz</span></div><label className="toggle"><input type="checkbox" checked={labels} onChange={event => setLabels(event.target.checked)} /> Note labels</label></div>
      <div className="lab-instrument" aria-label="Playable four-string bass fretboard">
        <div className="lab-fret-labels"><span>String</span>{cells.map(fret => <span key={fret}>{fret}</span>)}</div>
        {strings.map(string => <div className="lab-string-row" key={string}><button className="lab-open" aria-label={`Play open ${noteText(string, 0)}`} onPointerDown={event => { event.preventDefault(); trigger(string, 0); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trigger(string, 0); } }}>{['G', 'D', 'A', 'E'][string - 1]}</button>{cells.map(fret => { const midi = openMidi(string) + fret; return <button key={`${string}-${fret}`} className={`lab-fret fret-${fret} ${selected[string] === fret ? 'selected' : ''} ${played === string ? 'vibrate' : ''}`} aria-label={`Play ${noteText(string, fret)}, string ${string}, fret ${fret}`} onPointerDown={event => { event.preventDefault(); trigger(string, fret); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trigger(string, fret); } }}>{labels && <span>{names[midi % 12]}</span>}</button>; })}</div>)}
      </div>
      <div className="lab-picking"><b>Picking area</b>{strings.map(string => <button key={string} className="button secondary" onPointerDown={() => trigger(string)} aria-label={`Replay selected ${noteText(string, selected[string] ?? 0)}`}>Pick {['G', 'D', 'A', 'E'][string - 1]} · {noteText(string, selected[string] ?? 0)}</button>)}</div>
      <div className="lab-range"><button className="button ghost" disabled={range === 0} onClick={() => setRange(Math.max(0, range - 5))}>← Previous frets</button><span>Frets {range}–{Math.min(12, range + 4)}</span><button className="button ghost" disabled={range >= 8} onClick={() => setRange(Math.min(8, range + 5))}>Next frets →</button></div>
    </section>
    {mode === 'follow' && follow?.score && <section className="lab-card follow-card"><span className="pill">Follow lesson · {follow.id}</span><h3>{follow.title}</h3><p>{follow.instructions[0]}</p><label className="field"><span>Tempo: {bpm} BPM</span><input type="range" min="40" max="180" value={bpm} onChange={event => setBpm(Number(event.target.value))} /></label><button className="button" onClick={() => void playScore(follow.score!, bpm)}>▶ Play scored exercise</button><button className="button secondary" onClick={stopAudio}>■ Stop</button><p className="small muted">The supplied meter, count-in, rests, gate ratio and tempo unit remain authoritative.</p></section>}
  </div>;
}
