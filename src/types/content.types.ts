/**
 * Content domain types.
 *
 * Content is what gets displayed on the presentation output.
 * The same content can be presented through different Layouts and Backgrounds.
 */

// ─── Lyrics ──────────────────────────────────────────────────────────────────

export type LyricSectionType =
  | 'verse'
  | 'chorus'
  | 'bridge'
  | 'intro'
  | 'outro'
  | 'pre-chorus'
  | 'interlude'
  | 'tag'
  | 'custom';

export interface LyricSection {
  id: string;
  type: LyricSectionType;
  /** Human label, e.g. "Verse 1" or "Chorus" */
  label: string;
  /** Lyric body — newlines separate lines, double-newlines separate slides */
  body: string;
  /** Optional alias for body per Phase 1 §6.1 */
  content?: string;
  /** Explicit order of section in the song */
  order?: number;
  /** Resolved slides derived from body at edit time */
  slides?: string[];
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  author?: string;
  ccliNumber?: string;
  sections: LyricSection[];
  /** Ordered section IDs for the default arrangement */
  arrangement: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Scripture ───────────────────────────────────────────────────────────────

export interface ScriptureRef {
  book: string;
  chapter: number;
  /** Single verse or start of range */
  verse: number;
  /** End of range — omit for a single verse */
  verseEnd?: number;
  translation: string;
}

export interface ScriptureSlide {
  ref: ScriptureRef;
  text: string;
}

export interface Scripture {
  id: string;
  ref: ScriptureRef;
  slides: ScriptureSlide[];
  createdAt: string;
}

// ─── Text ────────────────────────────────────────────────────────────────────

export interface TextContent {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
