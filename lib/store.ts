export type ProgressState = { completedLessons: string[]; quizAttempts: Record<string, { correct: boolean; at: string }[]>; earAttempts: Record<string, { correct: boolean; at: string }[]>; practiceMinutes: number; notes: { id: string; text: string; at: string }[]; bestBpm: Record<string, number>; sessions: { date: string; minutes: number }[] };
export const emptyProgress: ProgressState = { completedLessons: [], quizAttempts: {}, earAttempts: {}, practiceMinutes: 0, notes: [], bestBpm: {}, sessions: [] };
const DB = 'basspath-progress'; const STORE = 'records';
export async function loadProgress(): Promise<ProgressState> {
  if (typeof indexedDB === 'undefined') return emptyProgress;
  return new Promise(resolve => { const req = indexedDB.open(DB, 1); req.onupgradeneeded = () => req.result.createObjectStore(STORE); req.onsuccess = () => { const get = req.result.transaction(STORE).objectStore(STORE).get('progress'); get.onsuccess = () => resolve(get.result || emptyProgress); get.onerror = () => resolve(emptyProgress); }; req.onerror = () => resolve(emptyProgress); });
}
export async function saveProgress(progress: ProgressState) {
  if (typeof indexedDB === 'undefined') return;
  const req = indexedDB.open(DB, 1); req.onsuccess = () => { const tx = req.result.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(progress, 'progress'); };
}
export function exportBackup(progress: ProgressState) { return JSON.stringify({ basspath_backup_version: 1, exported_at: new Date().toISOString(), progress }, null, 2); }
export function parseBackup(text: string): ProgressState {
  const value = JSON.parse(text) as { basspath_backup_version?: number; progress?: ProgressState };
  if (value.basspath_backup_version !== 1 || !value.progress || !Array.isArray(value.progress.completedLessons)) throw new Error('Unsupported or malformed BassPath backup.');
  return { ...emptyProgress, ...value.progress };
}
