/**
 * World English Bible (WEB) Local Provider
 *
 * Implements BibleProvider using locally-stored JSON data.
 * The WEB translation is in the public domain — no licensing required.
 *
 * Data loading strategy:
 * - Book metadata is loaded eagerly at startup (small payload).
 * - Chapter/verse data is loaded lazily on demand.
 * - All data is cached in memory after first load.
 *
 * Phase 0: Provider interface is fully implemented.
 *          Data files will be added in Phase 1 (Scripture system).
 *          Until then, stub data is returned so the UI can be built.
 */

import type { BibleProvider } from "./bible.provider";
import type {
  BibleBook,
  BibleChapter,
  BiblePassage,
  BibleTranslation,
  BibleVerse,
  ScriptureSearchResult,
} from "@/types/bible.types";

// ─── Stub data for Phase 0 ────────────────────────────────────────────────────

const STUB_BOOKS: BibleBook[] = [
  { id: "GEN", osis: "GEN", name: "Genesis", shortName: "Gen", chapters: 50, testament: "OT" },
  { id: "PSA", osis: "PSA", name: "Psalms", shortName: "Ps", chapters: 150, testament: "OT" },
  { id: "MAT", osis: "MAT", name: "Matthew", shortName: "Matt", chapters: 28, testament: "NT" },
  { id: "JHN", osis: "JHN", name: "John", shortName: "John", chapters: 21, testament: "NT" },
  { id: "ROM", osis: "ROM", name: "Romans", shortName: "Rom", chapters: 16, testament: "NT" },
  { id: "EPH", osis: "EPH", name: "Ephesians", shortName: "Eph", chapters: 6, testament: "NT" },
  { id: "PHP", osis: "PHP", name: "Philippians", shortName: "Phil", chapters: 4, testament: "NT" },
  { id: "REV", osis: "REV", name: "Revelation", shortName: "Rev", chapters: 22, testament: "NT" },
];

const STUB_VERSE: BibleVerse = {
  book: "JHN",
  chapter: 3,
  verse: 16,
  text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.",
};

const WEB_TRANSLATION: BibleTranslation = {
  id: "WEB",
  name: "World English Bible",
  abbreviation: "WEB",
  language: "en",
  isPublicDomain: true,
};

// ─── Provider Implementation ──────────────────────────────────────────────────

export class WebBibleProvider implements BibleProvider {
  private readonly translation = "WEB";
  private booksCache: BibleBook[] | null = null;
  private chapterCache = new Map<string, BibleChapter>();

  async getBooks(): Promise<BibleBook[]> {
    if (this.booksCache) return this.booksCache;
    // Phase 1: load from /data/web/books.json
    this.booksCache = STUB_BOOKS;
    return this.booksCache;
  }

  async getBook(bookId: string): Promise<BibleBook> {
    const books = await this.getBooks();
    const book = books.find(
      (b) => b.id === bookId || b.osis === bookId || b.name === bookId
    );
    if (!book) throw new Error(`Book not found: ${bookId}`);
    return book;
  }

  async getChapter(
    book: string,
    chapter: number,
    translation?: string
  ): Promise<BibleChapter> {
    const activeTranslation = translation ?? "WEB";
    const cacheKey = `${book}-${chapter}-${activeTranslation}`;
    if (this.chapterCache.has(cacheKey)) {
      return this.chapterCache.get(cacheKey)!;
    }

    // Phase 1: load from /data/web/{book}/{chapter}.json
    const stub: BibleChapter = {
      book,
      chapter,
      verses: [{ ...STUB_VERSE, book, chapter }],
    };

    this.chapterCache.set(cacheKey, stub);
    return stub;
  }

  async getPassage(
    book: string,
    chapter: number,
    verse: number,
    verseEnd?: number,
    translation?: string
  ): Promise<BiblePassage> {
    const activeTranslation = translation ?? "WEB";
    const chapterData = await this.getChapter(book, chapter, activeTranslation);
    const verses = chapterData.verses.filter(
      (v) =>
        v.verse >= verse && (verseEnd === undefined || v.verse <= verseEnd)
    );

    const bookData = await this.getBook(book);
    const verseRange =
      verseEnd && verseEnd !== verse ? `${verse}–${verseEnd}` : `${verse}`;
    const reference = `${bookData.shortName} ${chapter}:${verseRange}`;

    return {
      reference,
      translation: activeTranslation,
      verses,
    };
  }

  async searchReference(query: string): Promise<ScriptureSearchResult[]> {
    // Phase 1: implement reference parsing (e.g. "John 3:16", "Ps 23")
    // For now, return a stub result if the query resembles a reference
    const trimmed = query.trim();
    if (!trimmed) return [];

    return [
      {
        reference: "John 3:16",
        book: "JHN",
        chapter: 3,
        verse: 16,
        translation: this.translation,
        preview: STUB_VERSE.text.slice(0, 80) + "…",
      },
    ];
  }

  async getTranslations(): Promise<BibleTranslation[]> {
    return [WEB_TRANSLATION];
  }
}

/** Singleton instance for use throughout the application */
export const bibleProvider: BibleProvider = new WebBibleProvider();
