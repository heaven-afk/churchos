/**
 * BibleProvider interface — spec §9
 *
 * All Scripture data access goes through this interface.
 * Never import a concrete Bible provider directly in UI components.
 * Use the provider registered in src/providers/bible/index.ts.
 */

import type {
  BibleBook,
  BibleChapter,
  BiblePassage,
  BibleTranslation,
  ScriptureSearchResult,
} from '@/types/bible.types';

export interface BibleProvider {
  /**
   * Search for a Scripture reference by natural language or OSIS notation.
   * e.g. "John 3:16", "Genesis 1:1-3", "Ps 23"
   */
  searchReference(query: string): Promise<ScriptureSearchResult[]>;

  /**
   * Retrieve the full text of a passage.
   * @param book   OSIS book identifier, e.g. "JHN"
   * @param chapter Chapter number (1-indexed)
   * @param verse   Starting verse (1-indexed)
   * @param verseEnd  Optional end verse for a range
   * @param translation Translation abbreviation, e.g. "WEB"
   */
  getPassage(
    book: string,
    chapter: number,
    verse: number,
    verseEnd?: number,
    translation?: string
  ): Promise<BiblePassage>;

  /**
   * Retrieve the full chapter.
   */
  getChapter(
    book: string,
    chapter: number,
    translation?: string
  ): Promise<BibleChapter>;

  /**
   * Retrieve metadata for a single book.
   */
  getBook(bookId: string): Promise<BibleBook>;

  /**
   * List all books in order.
   */
  getBooks(): Promise<BibleBook[]>;

  /**
   * List available translations.
   */
  getTranslations(): Promise<BibleTranslation[]>;
}
