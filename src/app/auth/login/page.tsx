"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const setError = useAuthStore((s) => s.setError);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(
          email,
          password,
          displayName || email.split("@")[0],
          organizationName || "Grace Community Church"
        );
      }
      router.push("/");
    } catch {
      // Error is stored in useAuthStore
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "var(--color-bg-base)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 shadow-2xl flex flex-col gap-6"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1">
          <span
            className="text-xs font-bold tracking-widest uppercase mb-1 px-2.5 py-0.5 rounded"
            style={{
              background: "var(--color-primary-subtle)",
              color: "var(--color-primary)",
            }}
          >
            VEYRIN
          </span>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--color-fg-default)" }}
          >
            {mode === "signin" ? "Sign In to Operator Workstation" : "Create Veyrin Account"}
          </h1>
          <p className="text-xs" style={{ color: "var(--color-fg-subtle)" }}>
            {mode === "signin"
              ? "Enter your credentials to access your church presentations."
              : "Set up your workspace and organization."}
          </p>
        </div>

        {/* Tab switch */}
        <div
          className="flex p-1 rounded-lg border"
          style={{
            background: "var(--color-surface-1)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
            style={{
              background:
                mode === "signin" ? "var(--color-surface-2)" : "transparent",
              color:
                mode === "signin"
                  ? "var(--color-primary)"
                  : "var(--color-fg-muted)",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
            style={{
              background:
                mode === "signup" ? "var(--color-surface-2)" : "transparent",
              color:
                mode === "signup"
                  ? "var(--color-primary)"
                  : "var(--color-fg-muted)",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="p-3 rounded-lg text-xs flex items-center justify-between border"
            style={{
              background: "var(--color-error-subtle)",
              borderColor: "var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-bold hover:opacity-80 p-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
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
                  Church / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Grace Community Church"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@church.org"
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
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
              style={{
                background: "var(--color-surface-1)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg-default)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer mt-2 disabled:opacity-50"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
            }}
          >
            {isLoading
              ? "Connecting..."
              : mode === "signin"
              ? "Sign In ↗"
              : "Create Account & Workspace"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs" style={{ color: "var(--color-fg-subtle)" }}>
            Offline or local deployment? Default operator session is active automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
