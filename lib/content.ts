import curriculum from '../content/curriculum.json';
import instrument from '../content/instrument.json';
import theory from '../content/theory.json';
import ear from '../content/ear-training.json';
import exercises from '../content/exercises.json';
import studies from '../content/studies.json';
import grooves from '../content/grooves.json';
import glossary from '../content/glossary.json';
import quizzes from '../content/quizzes.json';
import resources from '../content/resources.json';
import practicePlans from '../content/practice-plans.json';
import milestones from '../content/milestones.json';
import type { Curriculum, Instrument, Theory, EarQuestion, Exercise, Study, Groove, GlossaryTerm, Quiz, Resource, PracticePlans, Milestone, Lesson } from '../content-types';

export const course = curriculum as Curriculum;
export const bass = instrument as Instrument;
export const theoryData = theory as Theory;
export const earQuestions = ear.items as EarQuestion[];
export const allExercises = exercises.items as Exercise[];
export const allStudies = studies.items as Study[];
export const allGrooves = grooves.items as Groove[];
export const glossaryTerms = glossary.items as GlossaryTerm[];
export const allQuizzes = quizzes.items as Quiz[];
export const allResources = resources.items as Resource[];
export const plans = practicePlans as PracticePlans;
export const allMilestones = milestones.items as Milestone[];

export async function getLessons(level: number): Promise<Lesson[]> {
  const data = await import(`../content/lessons-level-${level}.json`);
  return data.items as Lesson[];
}

export function lessonById(id: string): Lesson | undefined {
  return undefined;
}
