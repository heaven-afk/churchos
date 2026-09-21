# AGENTS.md — Veyrin Contributor Rules

> Rules for AI coding agents and human contributors.
> Read this before making any changes to the codebase.

---

## Non-Negotiables

These rules must NEVER be violated:

1. **All presentation state changes go through `src/actions/presentation.actions.ts`.**
   Do not call `usePresentationStore.getState()` and mutate state directly from UI components.

2. **All keyboard shortcuts are defined in `src/config/shortcuts.ts`.**
   Do not add `window.addEventListener('keydown', ...)` in individual components for shared presentation operations.

3. **All Scripture data access goes through the `BibleProvider` interface.**
   Do not import `WebBibleProvider` directly in UI components. Use the `bibleProvider` singleton from `src/providers/bible/web.provider.ts`.

4. **Do not hard-code the product name ("Veyrin") in business logic, APIs, or database identifiers.**

5. **Do not build features that are explicitly Out of Scope for the current phase.**
   Check the current development phase in `MASTER_BUILD.md` before adding functionality.

6. **TypeScript strict mode is required. No `any` types.**

7. **Do not use arbitrary colors.** All colors must reference CSS custom properties from `src/styles/tokens.css`.

8. **Emergency controls (BLACK, CLEAR, FREEZE) must always be accessible from the operator workstation.**
   They must never be placed inside a modal, settings panel, or collapsed sidebar.

---

## Architecture Rules

### State

- `ui.store` — UI-only state (open/closed, tabs, modals)
- `service.store` — Service content (items, selection)
- `presentation.store` — Live output state
- `keyboard.store` — Active shortcut context

Do NOT create a single global store. Keep stores focused.

### Components

- Operator workstation components live in `src/components/operator/`
- Presentation canvas components live in `src/components/presentation/`
- Shared UI primitives live in `src/components/ui/`

Do NOT create presentation-aware logic in operator components, and vice versa.

### Providers

- New Bible providers implement `BibleProvider` from `src/providers/bible/bible.provider.ts`
- New display adapters implement `DisplayAdapter` from `src/providers/display/display.adapter.ts`
- New media adapters implement `MediaAdapter` from `src/providers/media/media.adapter.ts`

### Types

All shared types live in `src/types/`. Do not inline type definitions in components.

---

## Before Making Changes

1. Read `MASTER_BUILD.md` to understand the product.
2. Read `ARCHITECTURE.md` to understand the system.
3. Identify which phase the feature belongs to.
4. Understand which stores, actions, and providers are affected.
5. Implement the smallest complete change.
6. Run `npm run type-check` and `npm run test` before committing.

---

## Commit Message Format

```
feat: add scripture search panel
fix: prevent duplicate slide navigation on keydown
refactor: extract slide renderer into SlideContent component
docs: update ARCHITECTURE.md with output routing diagram
test: add service item reorder tests
```

Do not commit with messages like "update stuff" or "fix bug".

---

## What Is Currently Implemented (Phase 0)

- Project scaffold (Next.js 15, TypeScript, Tailwind)
- Design token system (`src/styles/tokens.css`)
- Zustand stores (ui, service, presentation, keyboard)
- Centralized presentation action system
- Keyboard hook and shortcut configuration
- BibleProvider interface + WEB stub implementation
- DisplayAdapter + MediaAdapter interfaces
- Operator workstation shell (TopBar, ServicePanel, PreviewPanel, ControlPanel, OutputMonitor)
- PresentationCanvas (output window)
- Supabase browser and server clients
- Vitest test suite (presentation actions, shortcuts)
- Vercel deployment configuration
- Documentation (README, ARCHITECTURE, MASTER_BUILD, AGENTS)

## What Is NOT Yet Implemented

- Real service data (no Supabase tables yet)
- Real Bible data (WEB JSON files not yet loaded)
- Song/lyric editor
- Scripture search UI
- Media library
- Service persistence
- Authentication
- Real presentation output (no second window management yet)
- All Phase 1+ features (see MASTER_BUILD.md §46)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
