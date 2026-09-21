/**
 * WebBibleProvider Tests — Phase 1 §5.1 & §5.3
 */

import { describe, it, expect } from "vitest";
import { WebBibleProvider } from "@/providers/bible/web.provider";

describe("WebBibleProvider", () => {
  const provider = new WebBibleProvider();

  it("returns all 66 canonical Bible books", async () => {
    const books = await provider.getBooks();
    expect(books).toHaveLength(66);
    expect(books[0].id).toBe("GEN");
    expect(books[65].id).toBe("REV");
  });

  it("retrieves a single book by ID or name", async () => {
    const book = await provider.getBook("JHN");
    expect(book.name).toBe("John");
    expect(book.chapters).toBe(21);
    expect(book.testament).toBe("NT");
  });

  it("retrieves authentic passage verses for John 3:16-18", async () => {
    const passage = await provider.getPassage("JHN", 3, 16, 18);
    expect(passage.reference).toBe("John 3:16–18");
    expect(passage.translation).toBe("WEB");
    expect(passage.verses).toHaveLength(3);
    expect(passage.verses[0].verse).toBe(16);
    expect(passage.verses[0].text).toContain("For God so loved the world");
    expect(passage.verses[2].verse).toBe(18);
  });

  it("retrieves authentic passage verses for Psalm 23", async () => {
    const passage = await provider.getPassage("PSA", 23, 1, 6);
    expect(passage.reference).toBe("Psalms 23:1–6");
    expect(passage.verses).toHaveLength(6);
    expect(passage.verses[0].text).toContain("Yahweh is my shepherd");
  });

  it("searches and parses valid references via searchReference", async () => {
    const results = await provider.searchReference("John 3:16");
    expect(results).toHaveLength(1);
    expect(results[0].reference).toBe("John 3:16");
    expect(results[0].preview).toContain("For God so loved the world");
  });

  it("provides fallback results when query is a book name", async () => {
    const results = await provider.searchReference("Romans");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].reference).toContain("Romans");
  });
});
