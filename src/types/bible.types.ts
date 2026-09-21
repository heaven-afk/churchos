/**
 * Bible / Scripture provider types.
 *
 * The BibleProvider interface is the sole abstraction for all Scripture data.
 * Implementations may be local JSON, a REST API, or any future source.
 * Never import a concrete provider directly in UI components.
 */

export interface BibleBook {
  id: string;
  /** OSIS identifier, e.g. "GEN", "JHN" */
  osis: string;
  name: string;
  shortName: string;
  chapters: number;
  testament: 'OT' | 'NT';
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BiblePassage {
  reference: string;
  translation: string;
  verses: BibleVerse[];
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  /** Whether this translation can be shown publicly without per-use licensing */
  isPublicDomain: boolean;
}

export interface ScriptureSearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  verseEnd?: number;
  translation: string;
  preview: string;
}
