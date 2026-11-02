/** Contract for supplied content v1.0.0. MIDI values are sounding pitch. */
export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BassString = 1 | 2 | 3 | 4;
export type TempoUnit = 'quarter' | 'dotted-quarter' | 'eighth';
export interface Envelope<T> { schema_version: string; items: T[] }
export interface Meter { numerator: number; denominator: number }
export type Articulation = 'normal' | 'hammer-on' | 'pull-off' | 'slide' | 'slap' | 'pop' | 'thumb-down' | 'thumb-up' | 'natural-harmonic' | 'tap';
interface TimedEvent { start_tick: number; duration_ticks: number }
export interface NoteEvent extends TimedEvent { kind: 'note'; string: BassString; fret: number; midi: number; articulation: Articulation; velocity: number }
export interface RestEvent extends TimedEvent { kind: 'rest' }
export interface GhostEvent extends TimedEvent { kind: 'ghost'; string: BassString; velocity: number }
export type ScoreEvent = NoteEvent | RestEvent | GhostEvent;
export interface Score { ppq: 96; meter: Meter; bars: number; events: ScoreEvent[]; loop_count: number; key_hint: string | null; playback: string; tempo_unit_ticks: 48 | 96 | 144; gate_ratio: number; count_in_bars: number; swing_is_already_encoded: boolean }
export interface Tempo { start_bpm: number; target_bpm: number; increase_by: number; clean_repetitions: number; bpm_unit: TempoUnit }
export interface Exercise { id: string; lesson_id: string; title: string; level: Level; kind: 'scored' | 'task'; origin: 'original_basspath'; duration_minutes: number; instructions: string[]; completion_criteria: string[]; recording_optional: boolean; tempo: Tempo | null; score: Score | null }
export interface Lesson { id: string; slug: string; module_id: string; level: Level; order: number; title: string; summary: string; estimated_minutes: number; objectives: string[]; prerequisite_ids: string[]; content: { explanation: string[]; guided_steps: string[]; common_mistakes: { problem: string; correction: string }[]; musical_application: string; reflection: string; assignment: string }; exercise_ids: string[]; quiz_ids: string[]; resource_ids: string[]; tags: string[]; completion_criteria: string[]; assessment_method: string; mastery_status_default: 'not_assessed'; content_origin: 'original_basspath'; resource_relationship: string; optional: boolean; prerequisites_are_recommendations: boolean }
export interface Option { id: string; text: string }
export interface Quiz { id: string; lesson_id: string; level: Level; kind: 'single_choice'; question: string; options: Option[]; answer_id: string; explanation: string; tags: string[]; source: 'original_basspath' }
export interface Resource { id: string; title: string; provider: string; url: string; kind: 'guide' | 'lesson' | 'interactive' | 'article' | 'course' | 'collection'; levels: Level[]; tags: string[]; language: string; summary: string; access: 'free_page' | 'paid_optional'; access_note: string; checked_on: string; verification: string; internet_required: boolean; required_for_progression: false; reuse: string; video: null }
export interface Module { id: string; level: Level; title: string; order: number; lesson_ids: string[] }
export interface CourseLevel { id: string; number: Level; title: string; module_ids: string[]; lesson_ids: string[]; goals: string[]; milestone_id: string; optional: boolean; suggested_practice_weeks: null; pace_note: string }
export interface Curriculum { schema_version: string; title: string; subtitle: string; audience: string; instrument_id: string; daily_minutes: number; levels: CourseLevel[]; modules: Module[]; progression: { all_content_browsable: boolean; suggestions_not_locks: boolean; core_levels: Level[]; optional_levels: Level[]; require_paid_resources: boolean; lesson_completion: string; level_completion: string; review_intervals_days: number[] }; teaching_policy: string[] }
export interface StringDefinition { number: BassString; name: string; open_midi: number; sounding_octave: number; frequency_hz: number }
export interface FretPosition { string: BassString; fret: number; midi: number; pitch_class: number; sharp_name: string; flat_name: string; sounding_octave: number; frequency_hz: number }
export interface Instrument { schema_version: string; id: string; name: string; tuning_low_to_high: string[]; strings: StringDefinition[]; default_max_fret: number; supported_max_fret: number; tab_display_top_to_bottom: BassString[]; fretboard: FretPosition[]; conventions: Record<string, string> }
export interface Formula { id: string; name: string; semitones: number[]; degrees: string[] }
export interface Theory { schema_version: string; scales: Formula[]; chords: Formula[]; intervals: { id: string; semitones: number; name: string }[]; circle_of_fifths: string[]; major_diatonic_qualities: string[]; natural_minor_diatonic_qualities: string[]; rhythm: { ppq: number; whole_ticks: number; half_ticks: number; quarter_ticks: number; eighth_ticks: number; sixteenth_ticks: number; eighth_triplet_ticks: number; sixteenth_triplet_ticks: number; meters: (Meter & { bar_ticks: number; bpm_unit: TempoUnit; grouping: number[] })[] }; notes: string[] }
export interface ChordEvent extends TimedEvent { symbol: string; bass_midi: number; bass_string: BassString; bass_fret: number }
export interface Study { id: string; title: string; origin: 'original_basspath'; not_a_song_transcription: boolean; level: Level; key: string; meter: Meter; ppq: number; bpm: number; bpm_unit: TempoUnit; tempo_unit_ticks: number; bars: number; chord_events: ChordEvent[]; focus: string; section_plan: { label: string; chart_start_bar: number; bar_count: number; repeats: number; instruction: string }[]; ending: string; transpose_policy: string }
export interface DrumEvent { voice: 'kick' | 'snare' | 'hat'; start_tick: number; velocity: number }
export interface Groove { id: string; title: string; origin: 'original_basspath'; ppq: number; meter: Meter; bars: number; bpm: number; bpm_unit: TempoUnit; tempo_unit_ticks: number; events: DrumEvent[]; audio_source: 'locally_synthesized'; description: string }
export type EarMode = 'direction' | 'interval' | 'chord_quality' | 'scale_degree' | 'rhythm' | 'progression';
interface StimulusTiming { start_seconds: number; duration_seconds: number; velocity: number }
export type EarStimulus = StimulusTiming & ({ midi: number; voice?: never } | { voice: 'click'; midi?: never });
export interface EarQuestion { id: string; mode: EarMode; level: Level; question: string; stimuli: EarStimulus[]; options: Option[]; answer_id: string; explanation: string; origin: 'original_basspath' }
export interface Milestone { id: string; level: Level; title: string; lesson_ids: string[]; performance_task: string[]; criteria: string[]; rubric: { skill: string; scale: string[]; evidence_required: boolean }[]; pass_rule: { type: 'self_assessed'; all_criteria_confirmed: boolean; knowledge_quiz_min_percent: number; repeat_on_two_separate_sessions: boolean }; optional: boolean; disclaimer: string }
export interface PracticeBlock { id: string; minutes: number; action: string }
export interface PracticeTemplate { id: string; title: string; total_minutes: number; blocks: PracticeBlock[] }
export interface PracticeDay { day: number; title: string; lesson_ids: string[]; minutes: number; session_template_id: string; mode: 'review' | 'new_or_repeat'; instructions: string; review_rule: string }
export interface PracticePlans { schema_version: string; templates: PracticeTemplate[]; starter_days: PracticeDay[]; weekly_cycle: string[]; scheduling: { timezone: string; session_date: string; due_review_days: number[]; on_missed_day: string; new_lesson_rule: string; weekly_minutes_are_goal_not_gate: boolean } }
export interface GlossaryTerm { id: string; term: string; definition: string }
export interface Manifest { schema_version: string; pack_title: string; created_on: string; instrument: string; language: string; counts: Record<string, number>; files: { path: string; bytes: number; items: number | null; sha256: string }[]; agent_read_order: string[]; research_scope: string; content_scope: string }
/** User records are intentionally separate from immutable content. Design and version them during implementation. */
