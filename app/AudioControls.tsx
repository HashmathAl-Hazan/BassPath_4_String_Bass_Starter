'use client';

import { useEffect, useState } from 'react';
import { ensureAudio, getAudioPreferences, getAudioState, loadAudioPreferences, setAudioPreferences, stopAudio } from '../lib/music';

export default function AudioControls() {
  const [prefs, setPrefs] = useState(getAudioPreferences());
  const [state, setState] = useState(getAudioState());
  useEffect(() => { setPrefs(loadAudioPreferences()); }, []);
  const update = (key: 'master' | 'bass' | 'drums' | 'click', value: number) => setPrefs(setAudioPreferences({ [key]: value }));
  const enable = async () => { await ensureAudio(); setState(getAudioState()); };
  return <div className="audio-controls card">
    {state !== 'running' && <button className="button" onClick={enable}>Enable sound</button>}
    <button className="button ghost" onClick={() => setPrefs(setAudioPreferences({ muted: !prefs.muted }))}>{prefs.muted ? 'Unmute' : 'Mute'}</button>
    <details><summary>Mix</summary><div className="mix-grid">
      {(['master', 'bass', 'drums', 'click'] as const).map(key => <label key={key}>{key}<input aria-label={`${key} volume`} type="range" min="0" max="1" step="0.01" value={prefs[key]} onChange={event => update(key, Number(event.target.value))} /></label>)}
    </div></details>
    <button className="button secondary" onClick={stopAudio}>Stop all</button>
  </div>;
}
