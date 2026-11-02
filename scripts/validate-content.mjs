#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;
function ok(condition, message) { checks++; if (!condition) throw new Error(message); }
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'content', name), 'utf8'));
const manifest = read('manifest.json');
const cache = new Map();
for (const entry of manifest.files) {
  const p = path.join(root, entry.path), raw = fs.readFileSync(p);
  ok(raw.length === entry.bytes, `${entry.path}: byte count differs; update manifest after intentional edits`);
  ok(createHash('sha256').update(raw).digest('hex') === entry.sha256, `${entry.path}: SHA-256 mismatch`);
  const data = JSON.parse(raw.toString('utf8')); cache.set(path.basename(p), data);
  ok(data.schema_version === manifest.schema_version, `${entry.path}: schema_version mismatch`);
  if (entry.items !== null) ok(data.items.length === entry.items, `${entry.path}: item count mismatch`);
}
const items = name => cache.get(`${name}.json`).items;
const lessons = Array.from({ length: 7 }, (_, level) => items(`lessons-level-${level}`)).flat();
const exercises = items('exercises'), quizzes = items('quizzes'), resources = items('resources');
const ear = items('ear-training'), studies = items('studies'), grooves = items('grooves');
const milestones = items('milestones'), glossary = items('glossary');
const instrument = cache.get('instrument.json'), theory = cache.get('theory.json');
const curriculum = cache.get('curriculum.json'), practice = cache.get('practice-plans.json');
function idMap(list, label) {
  const map = new Map();
  for (const item of list) { ok(typeof item.id === 'string' && item.id.length > 0, `${label}: missing ID`); ok(!map.has(item.id), `${label}: duplicate ${item.id}`); map.set(item.id, item); }
  return map;
}
const lm = idMap(lessons, 'lessons'), em = idMap(exercises, 'exercises'), qm = idMap(quizzes, 'quizzes'), rm = idMap(resources, 'resources');
const mm = idMap(curriculum.modules, 'modules');
for (const [list,label] of [[ear,'ear'],[studies,'studies'],[grooves,'grooves'],[milestones,'milestones'],[glossary,'glossary']]) idMap(list,label);
for (const l of lessons) {
  ok(Number.isInteger(l.level) && l.level >= 0 && l.level <= 6, `${l.id}: level`);
  ok(l.content.explanation.length >= 2 && l.content.explanation.join(' ').length > 180, `${l.id}: teaching text too short`);
  ok(l.content.guided_steps.length >= 3 && l.content.common_mistakes.length > 0 && l.completion_criteria.length > 0, `${l.id}: missing teaching structure`);
  ok(mm.get(l.module_id)?.lesson_ids.includes(l.id), `${l.id}: module membership`);
  for (const p of l.prerequisite_ids) ok(lm.has(p) && lm.get(p).order < l.order, `${l.id}: invalid/backward prerequisite`);
  for (const e of l.exercise_ids) ok(em.get(e)?.lesson_id === l.id, `${l.id}: exercise reference ${e}`);
  for (const q of l.quiz_ids) ok(qm.get(q)?.lesson_id === l.id, `${l.id}: quiz reference ${q}`);
  for (const r of l.resource_ids) ok(rm.has(r), `${l.id}: resource reference ${r}`);
  ok(l.optional === (l.level === 5), `${l.id}: optional level flag`);
}
const tuning = new Map(instrument.strings.map(s => [s.number,s.open_midi]));
ok(JSON.stringify(instrument.strings.map(s => s.open_midi)) === '[28,33,38,43]', 'EADG sounding pitch must be 28/33/38/43');
ok(JSON.stringify(instrument.tab_display_top_to_bottom) === '[1,2,3,4]', 'Tab orientation must be G/D/A/E');
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
const validPosition = (s,f,m,id) => { ok(tuning.has(s), `${id}: string`); ok(Number.isInteger(f) && f >= 0 && f <= 24, `${id}: fret`); ok(m === tuning.get(s)+f, `${id}: pitch`); };
for (const p of instrument.fretboard) { validPosition(p.string,p.fret,p.midi,'fretboard'); ok(Math.abs(p.frequency_hz-frequency(p.midi)) < .001,'Fretboard frequency'); ok(p.pitch_class===p.midi%12,'Pitch class'); ok(p.sounding_octave===Math.floor(p.midi/12)-1,'Octave'); }
ok(instrument.fretboard.length===100,'Four strings x 25 fret positions expected');
const units={quarter:96,'dotted-quarter':144,eighth:48};
const barTicks = score => score.ppq*4*score.meter.numerator/score.meter.denominator;
function timeline(events,total,id) {
  let end=0;
  for(const e of events){ok(Number.isInteger(e.start_tick)&&e.start_tick===end,`${id}: gap/overlap at ${e.start_tick}`);ok(Number.isInteger(e.duration_ticks)&&e.duration_ticks>0,`${id}: duration`);end+=e.duration_ticks;}
  ok(end===total,`${id}: score duration ${end} != ${total}`);
}
for(const e of exercises){
  ok(lm.has(e.lesson_id)&&lm.get(e.lesson_id).exercise_ids.includes(e.id),`${e.id}: orphan exercise`);
  if(e.kind==='task'){ok(e.score===null&&e.tempo===null,`${e.id}: task must not fake a score`);continue;}
  ok(e.score&&e.tempo,`${e.id}: missing score/tempo`);const s=e.score;
  ok(s.ppq===96&&s.bars>0,`${e.id}: timing header`);
  ok(units[e.tempo.bpm_unit]===s.tempo_unit_ticks,`${e.id}: tempo unit`);
  ok(e.tempo.start_bpm>0&&e.tempo.target_bpm>=e.tempo.start_bpm,`${e.id}: tempo range`);
  timeline(s.events,s.bars*barTicks(s),e.id);
  for(const ev of s.events){ok(['note','rest','ghost'].includes(ev.kind),`${e.id}: event kind`);if(ev.kind==='note')validPosition(ev.string,ev.fret,ev.midi,e.id);if(ev.kind!=='rest')ok(ev.velocity>0&&ev.velocity<=1,`${e.id}: velocity`);if(ev.articulation==='natural-harmonic')ok(ev.fret===12,`${e.id}: unsupported harmonic node`);}
}
function choice(q){ok(q.options.length>=2,`${q.id}: too few choices`);ok(new Set(q.options.map(o=>o.id)).size===q.options.length,`${q.id}: option ID duplicate`);ok(q.options.filter(o=>o.id===q.answer_id).length===1,`${q.id}: answer missing/ambiguous`);}
for(const q of quizzes){choice(q);ok(lm.get(q.lesson_id)?.quiz_ids.includes(q.id),`${q.id}: orphan question`);}
for(const q of ear){choice(q);ok(q.stimuli.length>0,`${q.id}: no actual audio stimulus`);for(const s of q.stimuli){ok(s.start_seconds>=0&&s.duration_seconds>0,`${q.id}: stimulus time`);ok(s.velocity>0&&s.velocity<=1,`${q.id}: stimulus velocity`);ok((Number.isInteger(s.midi)&&s.midi>=28&&s.midi<=88&&!s.voice)||(s.voice==='click'&&s.midi===undefined),`${q.id}: stimulus sound`);}}
for(const s of studies){ok(s.ppq===96&&units[s.bpm_unit]===s.tempo_unit_ticks,`${s.id}: tempo`);timeline(s.chord_events,s.bars*barTicks(s),s.id);for(const e of s.chord_events)validPosition(e.bass_string,e.bass_fret,e.bass_midi,s.id);for(const section of s.section_plan)ok(section.chart_start_bar>=1&&section.chart_start_bar+section.bar_count-1<=s.bars&&section.repeats>0,`${s.id}: section bounds`);}
for(const g of grooves){ok(g.ppq===96&&units[g.bpm_unit]===g.tempo_unit_ticks,`${g.id}: tempo`);for(const e of g.events){ok(e.start_tick>=0&&e.start_tick<g.bars*barTicks(g),`${g.id}: event outside loop`);ok(['kick','snare','hat'].includes(e.voice)&&e.velocity>0&&e.velocity<=1,`${g.id}: drum voice/velocity`);}}
for(const formula of [...theory.scales,...theory.chords]){ok(formula.semitones[0]===0&&formula.semitones.length===formula.degrees.length,`${formula.id}: formula`);ok(formula.semitones.every((s,i,a)=>Number.isInteger(s)&&s>=0&&s<12&&(i===0||s>a[i-1])),`${formula.id}: sorted semitones`);}
for(const m of theory.rhythm.meters)ok(m.bar_ticks===96*4*m.numerator/m.denominator,'Theory meter ticks');
for(const r of resources){ok(new URL(r.url).protocol==='https:',`${r.id}: URL`);ok(r.required_for_progression===false,`${r.id}: external resource gate`);ok(['free_page','paid_optional'].includes(r.access),`${r.id}: access classification`);}
for(const t of practice.templates)ok(t.blocks.reduce((sum,b)=>sum+b.minutes,0)===t.total_minutes,`${t.id}: template duration`);
for(const d of practice.starter_days){ok(practice.templates.some(t=>t.id===d.session_template_id&&t.total_minutes===d.minutes),`day ${d.day}: template`);for(const id of d.lesson_ids)ok(lm.has(id),`day ${d.day}: unknown lesson`);}
for(const level of curriculum.levels){ok(level.lesson_ids.length===12,`${level.id}: lesson count`);for(const id of level.lesson_ids)ok(lm.get(id)?.level===level.number,`${level.id}: membership`);ok(milestones.some(m=>m.id===level.milestone_id),`${level.id}: checkpoint`);}
for(const m of milestones)for(const id of m.lesson_ids)ok(lm.get(id)?.level===m.level,`${m.id}: membership`);
const seconds=(ticks,unit,bpm)=>ticks/unit*60/bpm;
ok(seconds(288,144,60)===2,'6/8 dotted-quarter conversion');
ok(seconds(336,48,140)===3,'7/8 eighth-note conversion');
ok(seconds(768,96,60)===8,'Two bars of 4/4 at quarter-note 60');
ok(Math.abs(frequency(28)-41.2034)<.001,'Low E pitch');
ok(frequency(40)===frequency(28)*2,'Octave pitch');
const slash=em.get('e3-06').score.events.map(e=>e.midi);
ok(JSON.stringify(slash)==='[36,35,33,29]','Slash study must be C-B-A-F');
const counts={levels:curriculum.levels.length,modules:curriculum.modules.length,lessons:lessons.length,exercises:exercises.length,scored_exercises:exercises.filter(e=>e.kind==='scored').length,knowledge_questions:quizzes.length,ear_questions:ear.length,resources:resources.length,original_studies:studies.length,drum_loops:grooves.length,glossary_terms:glossary.length,starter_days:practice.starter_days.length};
for(const [key,value] of Object.entries(counts))ok(manifest.counts[key]===value,`Manifest count ${key}`);
const report={status:'passed',checked_at:new Date().toISOString(),checks,counts,scope:['JSON parsing and manifest integrity','Content IDs, relationships and prerequisite order','Lesson structure and optional-level flags','Pitch/fret/frequency and octave invariants','Complete score timelines and tempo units','Quiz answers and audio stimulus structure','Original charts, drum events, theory formulas and practice durations'],limitations:['No website is included or tested.','Publisher pages were checked separately; video playback and JavaScript interactive behaviour were not tested.','Content consistency checks do not certify playing technique or replace human pedagogical review.']};
if(process.argv.includes('--write-report'))fs.writeFileSync(path.join(root,'VALIDATION_REPORT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
