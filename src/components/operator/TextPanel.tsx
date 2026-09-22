"use client";

import { useState } from "react";
import { dispatch } from "@/actions/presentation.actions";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import {
  createTextPresentationSlides,
  createTextServiceItem,
} from "@/lib/content/text.service";
import type { LayoutId } from "@/types/presentation.types";

interface TextTemplate {
  label: string;
  title: string;
  body: string;
  subtext: string;
  layout: LayoutId;
  textAlign: "left" | "center" | "right";
}

const TEMPLATES: TextTemplate[] = [
  {
    label: "Announcement",
    title: "WELCOME HOME",
    body: "We are delighted to worship together today.\nJoin us for fellowship right after the service in the lobby!",
    subtext: "Grace Community Church",
    layout: "full-screen",
    textAlign: "center",
  },
  {
    label: "Sermon Note",
    title: "WALKING IN FAITH",
    body: "Point 1: Faith looks beyond present circumstances and trusts in God's eternal promise.",
    subtext: "Series: The Unshakable Life",
    layout: "full-screen",
    textAlign: "left",
  },
  {
    label: "Speaker Name",
    title: "Pastor Michael Davis",
    body: "Senior Pastor",
    subtext: "Grace Community Church",
    layout: "lower-third",
    textAlign: "left",
  },
  {
    label: "Quote",
    title: "",
    body: '"Grace means that all of our struggles are surrounded by the boundless love of God."',
    subtext: "— C.S. Lewis",
    layout: "caption",
    textAlign: "center",
  },
];

export function TextPanel() {
  const [title, setTitle] = useState("WELCOME HOME");
  const [body, setBody] = useState(
    "We are delighted to worship together today.\nJoin us for fellowship right after the service in the lobby!"
  );
  const [subtext, setSubtext] = useState("Grace Community Church");
  const [layout, setLayout] = useState<LayoutId>("full-screen");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");

  const addItem = useServiceStore((s) => s.addItem);
  const items = useServiceStore(selectActiveItems);

  const handleApplyTemplate = (tpl: TextTemplate) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setSubtext(tpl.subtext);
    setLayout(tpl.layout);
    setTextAlign(tpl.textAlign);
  };

  const getSlides = () => {
    return createTextPresentationSlides({
      title: title.trim() || undefined,
      body,
      subtext: subtext.trim() || undefined,
      layout,
      textAlign,
    });
  };

  const handleStagePreview = () => {
    const slides = getSlides();
    if (slides.length > 0) {
      dispatch({ type: "SET_SLIDES", slides });
      dispatch({ type: "SET_PREVIEW", slide: slides[0] });
    }
  };

  const handleTakeLive = () => {
    handleStagePreview();
    dispatch({ type: "SEND_LIVE" });
  };

  const handleAddToService = () => {
    const item = createTextServiceItem(
      {
        title: title.trim() || undefined,
        body,
        subtext: subtext.trim() || undefined,
        layout,
        textAlign,
      },
      items.length
    );
    addItem(item);
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-fg-muted)" }}
        >
          Text & Announcements
        </span>
      </div>

      {/* Preset Templates */}
      <div className="flex flex-wrap gap-1">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.label}
            type="button"
            onClick={() => handleApplyTemplate(tpl)}
            className="px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer"
            style={{
              background: "var(--color-surface-1)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg-default)",
            }}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. WELCOME TO CHURCH"
            className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
            style={{
              background: "var(--color-surface-1)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg-default)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Body Text *
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter announcement, quote, or note text..."
            className="w-full rounded-lg p-3 text-sm border focus:outline-none resize-y"
            style={{
              background: "var(--color-surface-1)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg-default)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Subtext / Speaker Title
          </label>
          <input
            type="text"
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder="e.g. Senior Pastor · Pastor Michael"
            className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
            style={{
              background: "var(--color-surface-1)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg-default)",
            }}
          />
        </div>

        {/* Alignment & Layout selectors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Align
            </label>
            <div
              className="flex rounded-lg border p-0.5"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-border)",
              }}
            >
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setTextAlign(a)}
                  className="flex-1 py-1 text-xs capitalize rounded transition-colors"
                  style={{
                    background:
                      textAlign === a
                        ? "var(--color-surface-2)"
                        : "transparent",
                    color:
                      textAlign === a
                        ? "var(--color-primary)"
                        : "var(--color-fg-muted)",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Layout
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as LayoutId)}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none cursor-pointer"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg-default)",
              }}
            >
              <option value="full-screen">Full Screen</option>
              <option value="lower-third">Lower Third</option>
              <option value="caption">Caption</option>
              <option value="overlay">Overlay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t flex items-center gap-2 shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <button
          type="button"
          onClick={handleStagePreview}
          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-fg-default)",
            background: "var(--color-surface-1)",
          }}
        >
          Stage Preview
        </button>

        <button
          type="button"
          onClick={handleAddToService}
          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-fg-default)",
            background: "var(--color-surface-1)",
          }}
        >
          + To Service
        </button>

        <button
          type="button"
          onClick={handleTakeLive}
          className="py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{
            background: "var(--color-live)",
            color: "#ffffff",
          }}
        >
          Take Live ↗
        </button>
      </div>
    </div>
  );
}
