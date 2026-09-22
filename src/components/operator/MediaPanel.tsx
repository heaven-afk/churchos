"use client";

import { useState, useEffect, useRef } from "react";
import { mediaAdapter } from "@/providers/media/web.media.adapter";
import type { MediaItem, MediaType } from "@/types/media.types";
import { dispatch } from "@/actions/presentation.actions";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import {
  createMediaPresentationSlide,
  createMediaServiceItem,
} from "@/lib/content/media.service";

export function MediaPanel() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<MediaType | "all">("all");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = useServiceStore((s) => s.addItem);
  const items = useServiceStore(selectActiveItems);

  const loadMedia = async () => {
    const list = await mediaAdapter.listMedia("org-default");
    setMediaList(list);
  };

  useEffect(() => {
    let isMounted = true;
    mediaAdapter.listMedia("org-default").then((list) => {
      if (isMounted) {
        setMediaList(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await mediaAdapter.uploadMedia(files[i], {
          organizationId: "org-default",
        });
      }
      await loadMedia();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filterType === "all") return true;
    return m.type === filterType;
  });

  const handleStagePreview = (media: MediaItem) => {
    const slide = createMediaPresentationSlide(media);
    dispatch({ type: "SET_SLIDES", slides: [slide] });
    dispatch({ type: "SET_PREVIEW", slide });
  };

  const handleTakeLive = (media: MediaItem) => {
    handleStagePreview(media);
    dispatch({ type: "SEND_LIVE" });
  };

  const handleAddToService = (media: MediaItem) => {
    const serviceItem = createMediaServiceItem(media, items.length);
    addItem(serviceItem);
  };

  const handleSetAsBackground = (media: MediaItem) => {
    const background = {
      id: `bg-${media.id}`,
      type: media.type === "video" ? ("video" as const) : ("image" as const),
      name: media.name,
      value: media.url,
      mediaId: media.id,
    };
    dispatch({ type: "CHANGE_BACKGROUND", background });
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header & Upload */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-fg-muted)" }}
        >
          Media Library
        </span>

        <label
          htmlFor="media-file-upload"
          className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
          style={{
            background: "var(--color-primary-subtle)",
            color: "var(--color-primary)",
          }}
        >
          {isUploading ? "Uploading..." : "+ Upload File"}
          <input
            id="media-file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex rounded-lg border p-0.5"
        style={{
          background: "var(--color-surface-1)",
          borderColor: "var(--color-border)",
        }}
      >
        {(["all", "image", "video"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className="flex-1 py-1 text-xs capitalize rounded transition-colors font-medium cursor-pointer"
            style={{
              background:
                filterType === t ? "var(--color-surface-2)" : "transparent",
              color:
                filterType === t
                  ? "var(--color-primary)"
                  : "var(--color-fg-muted)",
            }}
          >
            {t === "all" ? "All Media" : `${t}s`}
          </button>
        ))}
      </div>

      {/* Media Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" role="list">
        {filteredMedia.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center gap-1"
            style={{ color: "var(--color-fg-subtle)" }}
          >
            <p className="text-sm font-medium">No media found</p>
            <p className="text-xs">Upload an image or video above.</p>
          </div>
        ) : (
          filteredMedia.map((media) => (
            <div
              key={media.id}
              role="listitem"
              className="rounded-xl border overflow-hidden transition-all group"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Media Thumbnail / Preview */}
              <div
                className="h-28 w-full relative overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                onClick={() => handleStagePreview(media)}
                title="Click to stage preview"
              >
                {media.type === "video" ? (
                  <video
                    src={media.url}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Type badge */}
                <span
                  className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-md"
                  style={{
                    background: "rgba(0, 0, 0, 0.75)",
                    color:
                      media.type === "video"
                        ? "var(--color-info)"
                        : "var(--color-success)",
                  }}
                >
                  {media.type === "video" ? "🎬 Video" : "🖼️ Image"}
                </span>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <p
                    className="text-xs font-semibold truncate flex-1"
                    style={{ color: "var(--color-fg-default)" }}
                    title={media.name}
                  >
                    {media.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStagePreview(media)}
                    className="flex-1 py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg-default)",
                      background: "var(--color-surface-2)",
                    }}
                    title="Stage preview"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToService(media)}
                    className="flex-1 py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg-default)",
                      background: "var(--color-surface-2)",
                    }}
                    title="Add to service rundown"
                  >
                    + Service
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetAsBackground(media)}
                    className="py-1 px-1.5 rounded text-[11px] font-medium border transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-primary)",
                      background: "var(--color-primary-subtle)",
                    }}
                    title="Set as presentation background"
                  >
                    Bg
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTakeLive(media)}
                    className="py-1 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                    style={{
                      background: "var(--color-live)",
                      color: "#ffffff",
                    }}
                    title="Send live immediately"
                  >
                    Live ↗
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
