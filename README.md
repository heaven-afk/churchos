# Veyrin

> Modern church presentation and live production platform.

Veyrin is a keyboard-first, offline-capable presentation platform designed for church operators. It makes it fast, clear, and reliable to control Scripture, lyrics, sermon content, images, video, and announcements during a live service.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase project URL and anon key

# 3. Start the development server
npm run dev

# 4. Open the operator workstation
open http://localhost:3000

# 5. Open the presentation output (in a separate window)
open http://localhost:3000/presentation
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (operator)/         # Operator workstation route group
│   │   ├── layout.tsx      # Operator shell layout
│   │   └── page.tsx        # Main workstation page
│   ├── presentation/       # Presentation output window
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
│
├── actions/                # Presentation action system (spec §8)
│   └── presentation.actions.ts
│
├── components/
│   ├── operator/           # Operator workstation UI components
│   └── presentation/       # Presentation canvas components
│
├── config/                 # Static configuration
│   └── shortcuts.ts        # Keyboard shortcut bindings
│
├── hooks/                  # Custom React hooks
│   └── useKeyboard.ts      # Global keyboard handler
│
├── lib/
│   └── supabase/           # Supabase client factories
│       ├── client.ts       # Browser client
│       └── server.ts       # Server client (RSC / Route Handlers)
│
├── providers/              # Data provider interfaces and implementations
│   ├── bible/              # Scripture data
│   ├── display/            # Display output abstraction
│   └── media/              # Media file abstraction
│
├── store/                  # Zustand state stores
│   ├── ui.store.ts
│   ├── service.store.ts
│   ├── presentation.store.ts
│   └── keyboard.store.ts
│
├── styles/
│   └── tokens.css          # Design token CSS variables
│
└── types/                  # Shared TypeScript types
    ├── service.types.ts
    ├── content.types.ts
    ├── presentation.types.ts
    ├── media.types.ts
    └── bible.types.ts
```

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Unit tests in watch mode |

---

## Key Architecture Principles

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

**All presentation state changes flow through `src/actions/presentation.actions.ts`.** Never mutate the presentation store directly from UI components.

**All keyboard shortcuts are defined in `src/config/shortcuts.ts`.** Never implement keyboard handler logic inside individual components.

**All Scripture data access goes through the `BibleProvider` interface.** Never import a concrete provider directly in UI components.

---

## Development Phase

This repository is at **Phase 0 — Foundation**.

See [MASTER_BUILD.md](./MASTER_BUILD.md) for the full product specification and roadmap.
