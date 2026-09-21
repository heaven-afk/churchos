"use client";

import React, { useState, useEffect } from "react";
import { bibleProvider } from "@/providers/bible/web.provider";
import { parseScriptureReference } from "@/lib/bible/reference-parser";
import {
  passageToPresentationSlides,
  createScriptureServiceItem,
} from "@/lib/bible/scripture.service";
import { dispatch } from "@/actions/presentation.actions";
import { useServiceStore } from "@/store/service.store";
import type { BiblePassage, BibleTranslation } from "@/types/bible.types";

const QUICK_PASSAGES = [
  "John 3:16-18",
  "Psalm 23",
  "1 Cor 13:4-7",
  "Romans 8:28",
  "Gen 1:1-5",
  "Matt 5:1-12",
  "Phil 4:4-8",
];

export function ScripturePanel() {
  const [query, setQuery] = useState("John 3:16-18");
  const [translation, setTranslation] = useState("WEB");
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<BiblePassage | null>(null);

  const currentService = useServiceStore((s) => s.currentService);
  const setCurrentService = useServiceStore((s) => s.setCurrentService);
  const addItem = useServiceStore((s) => s.addItem);

  // Load available translations
  useEffect(() => {
    bibleProvider.getTranslations().then(setTranslations);
  }, []);

  // Resolve passage whenever query or translation changes
  useEffect(() => {
    let isCancelled = false;

    async function loadPassage() {
      if (!query.trim()) {
        setPassage(null);
        return;
      }

      setIsLoading(true);
      try {
        const parsed = parseScriptureReference(query);
        if (parsed && parsed.isValid) {
          const result = await bibleProvider.getPassage(
            parsed.bookId,
            parsed.chapter,
            parsed.startVerse,
            parsed.endVerse,
            translation
          );
          if (!isCancelled) {
            setPassage(result);
          }
        } else {
          if (!isCancelled) setPassage(null);
        }
      } catch (err) {
        console.error("Failed to load scripture passage:", err);
        if (!isCancelled) setPassage(null);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    const timer = setTimeout(loadPassage, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, translation]);

  // Stage preview in operator window
  const handleStagePreview = () => {
    if (!passage || passage.verses.length === 0) return;
    const slides = passageToPresentationSlides(passage);
    dispatch({ type: "SET_SLIDES", slides });
    dispatch({ type: "SET_PREVIEW", slide: slides[0] });
  };

  // Send directly to live presentation output
  const handleSendLive = () => {
    if (!passage || passage.verses.length === 0) return;
    const slides = passageToPresentationSlides(passage);
    dispatch({ type: "SET_SLIDES", slides });
    dispatch({ type: "SEND_LIVE", slide: slides[0] });
  };

  // Add to the current service schedule
  const handleAddToService = () => {
    if (!passage || passage.verses.length === 0) return;

    let targetService = currentService;
    if (!targetService) {
      targetService = {
        id: `svc-${Date.now()}`,
        title: "Sunday Service",
        date: new Date().toISOString().split("T")[0],
        items: [],
        organizationId: "org-default",
        isSynced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentService(targetService);
    }

    const order = targetService.items.length;
    const serviceItem = createScriptureServiceItem(passage, order);
    addItem(serviceItem);

    // Also stage in presentation store
    handleStagePreview();
  };

  return (
    <div className="flex flex-col gap-4 text-white/90">
      {/* Search Input & Version Dropdown */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="scripture-search-input"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Search Scripture
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase text-zinc-500 font-mono">Version:</span>
            <select
              id="select-bible-translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-blue-400 font-semibold outline-none cursor-pointer"
              aria-label="Bible translation version"
            >
              {translations.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} ({t.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <input
            id="scripture-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. John 3:16-18, Psalm 23, Romans 8:28..."
            className="w-full px-3 py-2 rounded-lg bg-black/40 border text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors"
            style={{ borderColor: "var(--color-border)" }}
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5 text-xs text-blue-400 animate-spin">
              ◌
            </div>
          )}
        </div>
      </div>

      {/* Quick Passage Chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PASSAGES.map((qp) => (
          <button
            key={qp}
            type="button"
            onClick={() => setQuery(qp)}
            className="text-[11px] px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Passage Results Preview Card */}
      {passage && passage.verses.length > 0 ? (
        <div
          className="flex flex-col gap-2 p-3 rounded-lg border bg-black/30"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-sm text-blue-400">
              {passage.reference}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300 font-bold">
              {passage.translation} · {passage.verses.length}{" "}
              {passage.verses.length === 1 ? "verse" : "verses"}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-2 text-xs leading-relaxed text-zinc-300">
            {passage.verses.map((v) => (
              <p key={`${v.chapter}-${v.verse}`}>
                <strong className="text-zinc-500 mr-1.5 select-none">
                  {v.verse}
                </strong>
                {v.text}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <button
              id="btn-stage-scripture"
              type="button"
              onClick={handleStagePreview}
              className="flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors border"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-fg-default)",
                borderColor: "var(--color-border)",
              }}
              title="Preview without taking live"
            >
              Stage Preview
            </button>

            <button
              id="btn-add-scripture"
              type="button"
              onClick={handleAddToService}
              className="flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors border text-blue-400 hover:text-blue-300"
              style={{
                background: "var(--color-primary-subtle)",
                borderColor: "var(--color-primary)",
              }}
              title="Add to Service Schedule"
            >
              + To Service
            </button>

            <button
              id="btn-live-scripture"
              type="button"
              onClick={handleSendLive}
              className="flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-fg)",
              }}
              title="Send live immediately"
            >
              Take Live ↗
            </button>
          </div>
        </div>
      ) : (
        !isLoading && (
          <div
            className="p-4 rounded-lg border text-center text-xs text-zinc-500 bg-black/20"
            style={{ borderColor: "var(--color-border)" }}
          >
            Enter a reference above (e.g. John 3:16) to load Scripture verses.
          </div>
        )
      )}
    </div>
  );
}
