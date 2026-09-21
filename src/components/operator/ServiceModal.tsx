"use client";

import { useState } from "react";
import { useServiceStore } from "@/store/service.store";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ isOpen, onClose }: ServiceModalProps) {
  const currentService = useServiceStore((s) => s.currentService);
  const savedServices = useServiceStore((s) => s.savedServices);
  const createService = useServiceStore((s) => s.createService);
  const switchService = useServiceStore((s) => s.switchService);
  const deleteService = useServiceStore((s) => s.deleteService);

  const [activeTab, setActiveTab] = useState<"switch" | "new">("switch");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createService(newTitle.trim(), new Date(newDate).toISOString());
    setNewTitle("");
    onClose();
  };

  const handleSelectService = async (id: string) => {
    await switchService(id);
    onClose();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this service?")) {
      await deleteService(id);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-xl border flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-strong)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <h2
              id="service-modal-title"
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-fg-default)" }}
            >
              Services
            </h2>
            <div className="flex rounded p-0.5 bg-black/20 border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab("switch")}
                className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                style={{
                  background:
                    activeTab === "switch"
                      ? "var(--color-surface-2)"
                      : "transparent",
                  color:
                    activeTab === "switch"
                      ? "var(--color-primary)"
                      : "var(--color-fg-muted)",
                }}
              >
                Saved ({savedServices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                style={{
                  background:
                    activeTab === "new"
                      ? "var(--color-surface-2)"
                      : "transparent",
                  color:
                    activeTab === "new"
                      ? "var(--color-primary)"
                      : "var(--color-fg-muted)",
                }}
              >
                + Create New
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-base leading-none rounded p-1 transition-colors cursor-pointer"
            style={{ color: "var(--color-fg-muted)" }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "switch" ? (
            <div className="space-y-2">
              {savedServices.length === 0 ? (
                <p
                  className="text-xs text-center py-6"
                  style={{ color: "var(--color-fg-subtle)" }}
                >
                  No saved services found.
                </p>
              ) : (
                savedServices.map((service) => {
                  const isCurrent = service.id === currentService?.id;
                  const dateStr = new Date(service.date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <div
                      key={service.id}
                      onClick={() => handleSelectService(service.id)}
                      className="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group"
                      style={{
                        background: isCurrent
                          ? "var(--color-surface-2)"
                          : "var(--color-surface-1)",
                        borderColor: isCurrent
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{
                              color: isCurrent
                                ? "var(--color-primary)"
                                : "var(--color-fg-default)",
                            }}
                          >
                            {service.title}
                          </p>
                          {isCurrent && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider"
                              style={{
                                background: "var(--color-primary-subtle)",
                                color: "var(--color-primary)",
                              }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-fg-subtle)" }}
                        >
                          {dateStr} · {service.items?.length ?? 0} items
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {savedServices.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(service.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-xs rounded hover:opacity-100 transition-opacity"
                            style={{ color: "var(--color-error)" }}
                            title="Delete service"
                            aria-label={`Delete ${service.title}`}
                          >
                            🗑️
                          </button>
                        )}
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: isCurrent
                              ? "var(--color-primary)"
                              : "var(--color-fg-subtle)",
                          }}
                        >
                          {isCurrent ? "Active" : "Open ↗"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sunday Morning Service"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("switch")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-muted)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-primary-fg)",
                  }}
                >
                  Create Service
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
