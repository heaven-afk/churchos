/**
 * Scripture Reference Parser — Phase 1 §5.2
 *
 * Robust parser capable of understanding:
 * - John 3:16
 * - John 3:16-18 / John 3:16–18
 * - Psalm 23
 * - Romans 8
 * - Romans 8:28
 * - 1 Corinthians 13:4-7
 * - Gen 1:1-5
 * - Numbered books ("1 Cor", "2 Kings", "1 Jn", "First John")
 *
 * Returns structured data rather than using fragile string manipulation.
 */

import type { BibleBook } from '@/types/bible.types';

export interface ParsedScriptureRef {
  bookId: string; // OSIS identifier (e.g. "JHN")
  bookName: string; // Standard canonical name (e.g. "John")
  shortName: string; // Standard abbreviation (e.g. "John")
  chapter: number;
  startVerse: number;
  endVerse?: number;
  isFullChapter: boolean;
  isValid: boolean;
}

export interface BookDefinition extends BibleBook {
  aliases: string[];
}

export const CANONICAL_BOOKS: BookDefinition[] = [
  // ─── Old Testament (39 books) ───────────────────────────────────────────────
  { id: 'GEN', osis: 'GEN', name: 'Genesis', shortName: 'Gen', chapters: 50, testament: 'OT', aliases: ['gen', 'genesis', 'ge', 'gn'] },
  { id: 'EXO', osis: 'EXO', name: 'Exodus', shortName: 'Exod', chapters: 40, testament: 'OT', aliases: ['exo', 'exodus', 'ex', 'exod'] },
  { id: 'LEV', osis: 'LEV', name: 'Leviticus', shortName: 'Lev', chapters: 27, testament: 'OT', aliases: ['lev', 'leviticus', 'le', 'lv'] },
  { id: 'NUM', osis: 'NUM', name: 'Numbers', shortName: 'Num', chapters: 36, testament: 'OT', aliases: ['num', 'numbers', 'nu', 'nm', 'nb'] },
  { id: 'DEU', osis: 'DEU', name: 'Deuteronomy', shortName: 'Deut', chapters: 34, testament: 'OT', aliases: ['deu', 'deuteronomy', 'dt', 'deut'] },
  { id: 'JOS', osis: 'JOS', name: 'Joshua', shortName: 'Josh', chapters: 24, testament: 'OT', aliases: ['jos', 'joshua', 'josh'] },
  { id: 'JDG', osis: 'JDG', name: 'Judges', shortName: 'Judg', chapters: 21, testament: 'OT', aliases: ['jdg', 'judges', 'judg', 'jg'] },
  { id: 'RUT', osis: 'RUT', name: 'Ruth', shortName: 'Ruth', chapters: 4, testament: 'OT', aliases: ['rut', 'ruth', 'rth', 'ru'] },
  { id: '1SA', osis: '1SA', name: '1 Samuel', shortName: '1 Sam', chapters: 31, testament: 'OT', aliases: ['1sa', '1 samuel', '1samuel', '1 sam', '1sam', 'first samuel', 'i samuel', '1 s', '1s'] },
  { id: '2SA', osis: '2SA', name: '2 Samuel', shortName: '2 Sam', chapters: 24, testament: 'OT', aliases: ['2sa', '2 samuel', '2samuel', '2 sam', '2sam', 'second samuel', 'ii samuel', '2 s', '2s'] },
  { id: '1KI', osis: '1KI', name: '1 Kings', shortName: '1 Kgs', chapters: 22, testament: 'OT', aliases: ['1ki', '1 kings', '1kings', '1 kgs', '1kgs', 'first kings', 'i kings', '1 k', '1k'] },
  { id: '2KI', osis: '2KI', name: '2 Kings', shortName: '2 Kgs', chapters: 25, testament: 'OT', aliases: ['2ki', '2 kings', '2kings', '2 kgs', '2kgs', 'second kings', 'ii kings', '2 k', '2k'] },
  { id: '1CH', osis: '1CH', name: '1 Chronicles', shortName: '1 Chr', chapters: 29, testament: 'OT', aliases: ['1ch', '1 chronicles', '1chronicles', '1 chr', '1chr', 'first chronicles', 'i chronicles'] },
  { id: '2CH', osis: '2CH', name: '2 Chronicles', shortName: '2 Chr', chapters: 36, testament: 'OT', aliases: ['2ch', '2 chronicles', '2chronicles', '2 chr', '2chr', 'second chronicles', 'ii chronicles'] },
  { id: 'EZR', osis: 'EZR', name: 'Ezra', shortName: 'Ezra', chapters: 10, testament: 'OT', aliases: ['ezr', 'ezra', 'ez'] },
  { id: 'NEH', osis: 'NEH', name: 'Nehemiah', shortName: 'Neh', chapters: 13, testament: 'OT', aliases: ['neh', 'nehemiah', 'ne'] },
  { id: 'EST', osis: 'EST', name: 'Esther', shortName: 'Esth', chapters: 10, testament: 'OT', aliases: ['est', 'esther', 'esth', 'es'] },
  { id: 'JOB', osis: 'JOB', name: 'Job', shortName: 'Job', chapters: 42, testament: 'OT', aliases: ['job', 'jb'] },
  { id: 'PSA', osis: 'PSA', name: 'Psalms', shortName: 'Ps', chapters: 150, testament: 'OT', aliases: ['psa', 'psalms', 'psalm', 'ps', 'pss'] },
  { id: 'PRO', osis: 'PRO', name: 'Proverbs', shortName: 'Prov', chapters: 31, testament: 'OT', aliases: ['pro', 'proverbs', 'prov', 'pr'] },
  { id: 'ECC', osis: 'ECC', name: 'Ecclesiastes', shortName: 'Eccl', chapters: 12, testament: 'OT', aliases: ['ecc', 'ecclesiastes', 'eccl', 'ec'] },
  { id: 'SNG', osis: 'SNG', name: 'Song of Songs', shortName: 'Song', chapters: 8, testament: 'OT', aliases: ['sng', 'song of songs', 'song of solomon', 'song', 'sos', 'canticles'] },
  { id: 'ISA', osis: 'ISA', name: 'Isaiah', shortName: 'Isa', chapters: 66, testament: 'OT', aliases: ['isa', 'isaiah', 'is'] },
  { id: 'JER', osis: 'JER', name: 'Jeremiah', shortName: 'Jer', chapters: 52, testament: 'OT', aliases: ['jer', 'jeremiah', 'je', 'jr'] },
  { id: 'LAM', osis: 'LAM', name: 'Lamentations', shortName: 'Lam', chapters: 5, testament: 'OT', aliases: ['lam', 'lamentations', 'la'] },
  { id: 'EZK', osis: 'EZK', name: 'Ezekiel', shortName: 'Ezek', chapters: 48, testament: 'OT', aliases: ['ezk', 'ezekiel', 'ezek', 'eze'] },
  { id: 'DAN', osis: 'DAN', name: 'Daniel', shortName: 'Dan', chapters: 12, testament: 'OT', aliases: ['dan', 'daniel', 'da', 'dn'] },
  { id: 'HOS', osis: 'HOS', name: 'Hosea', shortName: 'Hos', chapters: 14, testament: 'OT', aliases: ['hos', 'hosea', 'ho'] },
  { id: 'JOL', osis: 'JOL', name: 'Joel', shortName: 'Joel', chapters: 3, testament: 'OT', aliases: ['jol', 'joel', 'jl'] },
  { id: 'AMO', osis: 'AMO', name: 'Amos', shortName: 'Amos', chapters: 9, testament: 'OT', aliases: ['amo', 'amos', 'am'] },
  { id: 'OBA', osis: 'OBA', name: 'Obadiah', shortName: 'Obad', chapters: 1, testament: 'OT', aliases: ['oba', 'obadiah', 'obad', 'ob'] },
  { id: 'JON', osis: 'JON', name: 'Jonah', shortName: 'Jonah', chapters: 4, testament: 'OT', aliases: ['jon', 'jonah', 'jnh'] },
  { id: 'MIC', osis: 'MIC', name: 'Micah', shortName: 'Mic', chapters: 7, testament: 'OT', aliases: ['mic', 'micah', 'mc'] },
  { id: 'NAM', osis: 'NAM', name: 'Nahum', shortName: 'Nah', chapters: 3, testament: 'OT', aliases: ['nam', 'nahum', 'nah', 'na'] },
  { id: 'HAB', osis: 'HAB', name: 'Habakkuk', shortName: 'Hab', chapters: 3, testament: 'OT', aliases: ['hab', 'habakkuk', 'hb'] },
  { id: 'ZEP', osis: 'ZEP', name: 'Zephaniah', shortName: 'Zeph', chapters: 3, testament: 'OT', aliases: ['zep', 'zephaniah', 'zeph', 'zp'] },
  { id: 'HAG', osis: 'HAG', name: 'Haggai', shortName: 'Hag', chapters: 2, testament: 'OT', aliases: ['hag', 'haggai', 'hg'] },
  { id: 'ZEC', osis: 'ZEC', name: 'Zechariah', shortName: 'Zech', chapters: 14, testament: 'OT', aliases: ['zec', 'zechariah', 'zech', 'zc'] },
  { id: 'MAL', osis: 'MAL', name: 'Malachi', shortName: 'Mal', chapters: 4, testament: 'OT', aliases: ['mal', 'malachi', 'ml'] },

  // ─── New Testament (27 books) ───────────────────────────────────────────────
  { id: 'MAT', osis: 'MAT', name: 'Matthew', shortName: 'Matt', chapters: 28, testament: 'NT', aliases: ['mat', 'matthew', 'matt', 'mt'] },
  { id: 'MRK', osis: 'MRK', name: 'Mark', shortName: 'Mark', chapters: 16, testament: 'NT', aliases: ['mrk', 'mark', 'mk'] },
  { id: 'LUK', osis: 'LUK', name: 'Luke', shortName: 'Luke', chapters: 24, testament: 'NT', aliases: ['luk', 'luke', 'lk'] },
  { id: 'JHN', osis: 'JHN', name: 'John', shortName: 'John', chapters: 21, testament: 'NT', aliases: ['jhn', 'john', 'jn', 'joh'] },
  { id: 'ACT', osis: 'ACT', name: 'Acts', shortName: 'Acts', chapters: 28, testament: 'NT', aliases: ['act', 'acts', 'ac'] },
  { id: 'ROM', osis: 'ROM', name: 'Romans', shortName: 'Rom', chapters: 16, testament: 'NT', aliases: ['rom', 'romans', 'ro', 'rm'] },
  { id: '1CO', osis: '1CO', name: '1 Corinthians', shortName: '1 Cor', chapters: 16, testament: 'NT', aliases: ['1co', '1 corinthians', '1corinthians', '1 cor', '1cor', '1 co', '1co', 'first corinthians', 'i corinthians'] },
  { id: '2CO', osis: '2CO', name: '2 Corinthians', shortName: '2 Cor', chapters: 13, testament: 'NT', aliases: ['2co', '2 corinthians', '2corinthians', '2 cor', '2cor', '2 co', '2co', 'second corinthians', 'ii corinthians'] },
  { id: 'GAL', osis: 'GAL', name: 'Galatians', shortName: 'Gal', chapters: 6, testament: 'NT', aliases: ['gal', 'galatians', 'ga'] },
  { id: 'EPH', osis: 'EPH', name: 'Ephesians', shortName: 'Eph', chapters: 6, testament: 'NT', aliases: ['eph', 'ephesians', 'ep'] },
  { id: 'PHP', osis: 'PHP', name: 'Philippians', shortName: 'Phil', chapters: 4, testament: 'NT', aliases: ['php', 'philippians', 'phil', 'pp'] },
  { id: 'COL', osis: 'COL', name: 'Colossians', shortName: 'Col', chapters: 4, testament: 'NT', aliases: ['col', 'colossians', 'cl'] },
  { id: '1TH', osis: '1TH', name: '1 Thessalonians', shortName: '1 Thess', chapters: 5, testament: 'NT', aliases: ['1th', '1 thessalonians', '1thessalonians', '1 thess', '1thess', 'first thessalonians', 'i thessalonians'] },
  { id: '2TH', osis: '2TH', name: '2 Thessalonians', shortName: '2 Thess', chapters: 3, testament: 'NT', aliases: ['2th', '2 thessalonians', '2thessalonians', '2 thess', '2thess', 'second thessalonians', 'ii thessalonians'] },
  { id: '1TI', osis: '1TI', name: '1 Timothy', shortName: '1 Tim', chapters: 6, testament: 'NT', aliases: ['1ti', '1 timothy', '1timothy', '1 tim', '1tim', 'first timothy', 'i timothy'] },
  { id: '2TI', osis: '2TI', name: '2 Timothy', shortName: '2 Tim', chapters: 4, testament: 'NT', aliases: ['2ti', '2 timothy', '2timothy', '2 tim', '2tim', 'second timothy', 'ii timothy'] },
  { id: 'TIT', osis: 'TIT', name: 'Titus', shortName: 'Titus', chapters: 3, testament: 'NT', aliases: ['tit', 'titus', 'ti'] },
  { id: 'PHM', osis: 'PHM', name: 'Philemon', shortName: 'Phlm', chapters: 1, testament: 'NT', aliases: ['phm', 'philemon', 'phlm', 'pm'] },
  { id: 'HEB', osis: 'HEB', name: 'Hebrews', shortName: 'Heb', chapters: 13, testament: 'NT', aliases: ['heb', 'hebrews', 'he'] },
  { id: 'JAS', osis: 'JAS', name: 'James', shortName: 'Jas', chapters: 5, testament: 'NT', aliases: ['jas', 'james', 'jm'] },
  { id: '1PE', osis: '1PE', name: '1 Peter', shortName: '1 Pet', chapters: 5, testament: 'NT', aliases: ['1pe', '1 peter', '1peter', '1 pet', '1pet', '1 pt', 'first peter', 'i peter'] },
  { id: '2PE', osis: '2PE', name: '2 Peter', shortName: '2 Pet', chapters: 3, testament: 'NT', aliases: ['2pe', '2 peter', '2peter', '2 pet', '2pet', '2 pt', 'second peter', 'ii peter'] },
  { id: '1JN', osis: '1JN', name: '1 John', shortName: '1 John', chapters: 5, testament: 'NT', aliases: ['1jn', '1 john', '1john', '1 jn', 'first john', 'i john'] },
  { id: '2JN', osis: '2JN', name: '2 John', shortName: '2 John', chapters: 1, testament: 'NT', aliases: ['2jn', '2 john', '2john', '2 jn', 'second john', 'ii john'] },
  { id: '3JN', osis: '3JN', name: '3 John', shortName: '3 John', chapters: 1, testament: 'NT', aliases: ['3jn', '3 john', '3john', '3 jn', 'third john', 'iii john'] },
  { id: 'JUD', osis: 'JUD', name: 'Jude', shortName: 'Jude', chapters: 1, testament: 'NT', aliases: ['jud', 'jude', 'jd'] },
  { id: 'REV', osis: 'REV', name: 'Revelation', shortName: 'Rev', chapters: 22, testament: 'NT', aliases: ['rev', 'revelation', 'revelations', 'apocalypse', 'rv'] },
];

/**
 * Finds a Bible book definition by name, OSIS, or abbreviation.
 */
export function findBook(input: string): BookDefinition | undefined {
  const normalised = input.trim().toLowerCase().replace(/\./g, '');
  return CANONICAL_BOOKS.find(
    (b) =>
      b.id.toLowerCase() === normalised ||
      b.osis.toLowerCase() === normalised ||
      b.name.toLowerCase() === normalised ||
      b.shortName.toLowerCase() === normalised ||
      b.aliases.includes(normalised)
  );
}

/**
 * Parses a natural language Scripture query into structured reference data.
 *
 * Supported patterns:
 * - "John 3:16"       -> chapter: 3, startVerse: 16, endVerse: 16
 * - "John 3:16-18"    -> chapter: 3, startVerse: 16, endVerse: 18
 * - "John 3:16–18"    -> en-dash handling
 * - "Psalm 23"        -> chapter: 23, isFullChapter: true
 * - "Romans 8:28"     -> chapter: 8, startVerse: 28, endVerse: 28
 * - "1 Cor 13:4-7"    -> book: "1CO", chapter: 13, start: 4, end: 7
 */
export function parseScriptureReference(query: string): ParsedScriptureRef | null {
  if (!query || typeof query !== 'string') return null;

  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  // Regex pattern matching:
  // Group 1: Book name with optional leading digit/prefix (e.g. "1 Corinthians", "John", "Ps")
  // Group 2: Chapter number
  // Group 3: Optional start verse (after : or .)
  // Group 4: Optional end verse (after - or –)
  const pattern =
    /^((?:[1-3]\s*)?[a-zA-Z]+(?:\s+of\s+[a-zA-Z]+)?)\s*(\d+)(?:(?::|\.)\s*(\d+)(?:\s*(?:-|–)\s*(\d+))?)?$/i;

  const match = trimmed.match(pattern);
  if (!match) {
    // Check if query is simply a book name by itself
    const bookOnly = findBook(trimmed);
    if (bookOnly) {
      return {
        bookId: bookOnly.id,
        bookName: bookOnly.name,
        shortName: bookOnly.shortName,
        chapter: 1,
        startVerse: 1,
        endVerse: undefined,
        isFullChapter: true,
        isValid: true,
      };
    }
    return null;
  }

  const rawBook = match[1];
  const rawChapter = parseInt(match[2], 10);
  const rawStartVerse = match[3] ? parseInt(match[3], 10) : undefined;
  const rawEndVerse = match[4] ? parseInt(match[4], 10) : undefined;

  const book = findBook(rawBook);
  if (!book) return null;

  // Validate chapter bounds
  if (rawChapter < 1 || rawChapter > book.chapters) {
    return null;
  }

  const isFullChapter = rawStartVerse === undefined;
  const startVerse = rawStartVerse ?? 1;
  const endVerse = isFullChapter ? undefined : (rawEndVerse ?? startVerse);

  // Validate verse order
  if (endVerse !== undefined && endVerse < startVerse) {
    return null;
  }

  return {
    bookId: book.id,
    bookName: book.name,
    shortName: book.shortName,
    chapter: rawChapter,
    startVerse,
    endVerse,
    isFullChapter,
    isValid: true,
  };
}

/**
 * Formats a parsed or structured reference back into human-readable notation.
 * e.g. "John 3:16–18" or "Psalm 23"
 */
export function formatScriptureReference(ref: {
  bookName: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}): string {
  if (!ref.startVerse) {
    return `${ref.bookName} ${ref.chapter}`;
  }

  if (ref.endVerse && ref.endVerse !== ref.startVerse) {
    return `${ref.bookName} ${ref.chapter}:${ref.startVerse}–${ref.endVerse}`;
  }

  return `${ref.bookName} ${ref.chapter}:${ref.startVerse}`;
}
