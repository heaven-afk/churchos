/**
 * Scripture Reference Parser Tests — Phase 1 §5.2
 */

import { describe, it, expect } from "vitest";
import {
  parseScriptureReference,
  formatScriptureReference,
  findBook,
} from "@/lib/bible/reference-parser";

describe("Scripture Reference Parser", () => {
  describe("findBook", () => {
    it("finds books by full name", () => {
      expect(findBook("Genesis")?.id).toBe("GEN");
      expect(findBook("John")?.id).toBe("JHN");
      expect(findBook("1 Corinthians")?.id).toBe("1CO");
    });

    it("finds books by abbreviation", () => {
      expect(findBook("Gen")?.id).toBe("GEN");
      expect(findBook("Ps")?.id).toBe("PSA");
      expect(findBook("1 Cor")?.id).toBe("1CO");
      expect(findBook("Rom")?.id).toBe("ROM");
    });

    it("is case-insensitive", () => {
      expect(findBook("john")?.id).toBe("JHN");
      expect(findBook("PSALMS")?.id).toBe("PSA");
      expect(findBook("1 cor")?.id).toBe("1CO");
    });
  });

  describe("parseScriptureReference", () => {
    it("parses single verse (John 3:16)", () => {
      const parsed = parseScriptureReference("John 3:16");
      expect(parsed).not.toBeNull();
      expect(parsed?.bookId).toBe("JHN");
      expect(parsed?.bookName).toBe("John");
      expect(parsed?.chapter).toBe(3);
      expect(parsed?.startVerse).toBe(16);
      expect(parsed?.endVerse).toBe(16);
      expect(parsed?.isFullChapter).toBe(false);
    });

    it("parses verse range with hyphen (John 3:16-18)", () => {
      const parsed = parseScriptureReference("John 3:16-18");
      expect(parsed).not.toBeNull();
      expect(parsed?.chapter).toBe(3);
      expect(parsed?.startVerse).toBe(16);
      expect(parsed?.endVerse).toBe(18);
    });

    it("parses verse range with en-dash (John 3:16–18)", () => {
      const parsed = parseScriptureReference("John 3:16–18");
      expect(parsed).not.toBeNull();
      expect(parsed?.chapter).toBe(3);
      expect(parsed?.startVerse).toBe(16);
      expect(parsed?.endVerse).toBe(18);
    });

    it("parses full chapter reference (Psalm 23)", () => {
      const parsed = parseScriptureReference("Psalm 23");
      expect(parsed).not.toBeNull();
      expect(parsed?.bookId).toBe("PSA");
      expect(parsed?.chapter).toBe(23);
      expect(parsed?.isFullChapter).toBe(true);
      expect(parsed?.endVerse).toBeUndefined();
    });

    it("parses numbered books (1 Corinthians 13:4-7)", () => {
      const parsed = parseScriptureReference("1 Corinthians 13:4-7");
      expect(parsed).not.toBeNull();
      expect(parsed?.bookId).toBe("1CO");
      expect(parsed?.chapter).toBe(13);
      expect(parsed?.startVerse).toBe(4);
      expect(parsed?.endVerse).toBe(7);
    });

    it("parses abbreviated numbered books (1 Cor 13:4-7)", () => {
      const parsed = parseScriptureReference("1 Cor 13:4-7");
      expect(parsed).not.toBeNull();
      expect(parsed?.bookId).toBe("1CO");
      expect(parsed?.chapter).toBe(13);
      expect(parsed?.startVerse).toBe(4);
      expect(parsed?.endVerse).toBe(7);
    });

    it("parses Romans 8 and Romans 8:28", () => {
      const fullCh = parseScriptureReference("Romans 8");
      expect(fullCh?.chapter).toBe(8);
      expect(fullCh?.isFullChapter).toBe(true);

      const singleV = parseScriptureReference("Romans 8:28");
      expect(singleV?.chapter).toBe(8);
      expect(singleV?.startVerse).toBe(28);
      expect(singleV?.endVerse).toBe(28);
    });

    it("rejects invalid chapter numbers exceeding book chapters", () => {
      // Jude only has 1 chapter
      const parsed = parseScriptureReference("Jude 5");
      expect(parsed).toBeNull();
    });

    it("rejects reversed verse ranges (John 3:18-16)", () => {
      const parsed = parseScriptureReference("John 3:18-16");
      expect(parsed).toBeNull();
    });

    it("returns null for nonsense strings", () => {
      expect(parseScriptureReference("")).toBeNull();
      expect(parseScriptureReference("xyz 99")).toBeNull();
    });
  });

  describe("formatScriptureReference", () => {
    it("formats single verse", () => {
      expect(
        formatScriptureReference({ bookName: "John", chapter: 3, startVerse: 16 })
      ).toBe("John 3:16");
    });

    it("formats verse range", () => {
      expect(
        formatScriptureReference({
          bookName: "John",
          chapter: 3,
          startVerse: 16,
          endVerse: 18,
        })
      ).toBe("John 3:16–18");
    });

    it("formats full chapter", () => {
      expect(
        formatScriptureReference({ bookName: "Psalm", chapter: 23 })
      ).toBe("Psalm 23");
    });
  });
});
