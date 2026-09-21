# Veyrin — Master Build Specification

> **Status:** Initial Product Specification
> **Project Name:** Veyrin *(working name — subject to change)*
> **Product Category:** Church Presentation & Live Production Platform
> **Primary Development Environment:** Antigravity
> **Source of Truth:** GitHub repository
> **Future Development:** Designed for eventual Codex handoff

---

# 1. Product Vision

Veyrin is a modern church presentation and live-production platform designed around the speed, clarity, and reliability of the presentation operator.

The product should make it easy to prepare and control:

* Scripture
* Songs and lyrics
* Sermon content
* Images
* Videos
* Text
* Announcements
* Service schedules
* Presentation layouts
* Live production outputs

The long-term vision is a cross-platform presentation engine with:

* Web interface
* Desktop application
* Multiple presentation outputs
* Mobile/tablet remote control
* AI-assisted Scripture detection
* OBS and production integrations
* Offline-first presentation
* Cloud synchronization
* Advanced live-production workflows

Veyrin is **not** intended to be a church management system.

The focus is presentation, content control, and live production.

---

# 2. Core Product Philosophy

## Primary Principle

> The operator should never have to fight the software while the service is happening.

During a live service, the operator has limited attention.

Every interaction should therefore be:

* Fast
* Predictable
* Clear
* Keyboard accessible
* Visually understandable
* Recoverable
* Reliable

The interface should prioritize the operator's immediate task over decorative UI.

## Design Rule

> If a UI element does not provide tangible value, remove it.

Do not add interface elements simply because they make the application appear more feature-rich.

Avoid:

* Decorative cards
* Redundant buttons
* Excessive badges
* Unnecessary borders
* Fake AI visual effects
* Giant empty dashboard widgets
* Excessive settings
* Duplicate controls
* Information that is irrelevant during a live service

---

# 3. Target Users

### Primary User

Church presentation/media operator.

Typical responsibilities:

* Prepare service presentation
* Display lyrics
* Display Scripture
* Display sermon content
* Control slides
* Manage media
* Operate screens
* Support livestream production

### Secondary Users

* Pastors
* Worship leaders
* Media directors
* Production teams
* Church administrators
* Livestream operators
* Stage operators

### Future Users

* Remote operators
* Multi-campus production teams
* Content managers
* Technical directors

---

# 4. Problems We Are Solving

Existing presentation software can be powerful but often introduces unnecessary complexity.

Veyrin should address:

1. Slow content navigation
2. Cluttered operator interfaces
3. Poor keyboard workflows
4. Difficult Scripture navigation
5. Difficult lyric navigation
6. Limited modern layouts
7. Weak remote workflows
8. Poor integration between presentation and production tools
9. Dependence on internet connectivity
10. Poor recovery from operational errors
11. Difficult multi-screen configuration
12. Lack of intelligent assistance

---

# 5. Product Principles

The following principles are non-negotiable.

## 5.1 Operator First

The live operator is the primary UX priority.

## 5.2 Keyboard First

Common operations must be executable without requiring a mouse.

## 5.3 Offline First

Live presentation must not depend on an internet connection.

## 5.4 Reliability Over Novelty

A boring feature that works every time is more valuable than an impressive feature that fails during a service.

## 5.5 AI Assists; Humans Control

AI may suggest content.

AI must not automatically send uncertain content live.

## 5.6 Accessible by Default

Accessibility is a day-one requirement.

## 5.7 Reusable Architecture

Business logic must not be duplicated between UI components.

## 5.8 Minimal Dependencies

Do not introduce dependencies without a clear technical reason.

## 5.9 Progressive Complexity

Simple tasks should remain simple.

Advanced functionality should become available when needed without overwhelming new users.

## 5.10 No Premature Features

Do not build future functionality merely to make the UI appear complete.

---

# 6. V1 Scope

The first production milestone is the **Operator Workstation**.

V1 must support:

### Content

* Songs
* Lyrics
* Scripture
* Text
* Images
* Videos
* Service schedules
* Presentation items

### Service Management

* Create service
* Rename service
* Save service
* Open service
* Add content
* Remove content
* Reorder content
* Group content
* Duplicate content
* Search content

### Presentation

* Current slide
* Next slide
* Slide navigation
* Live preview
* Send live
* Black screen
* Clear output
* Background selection
* Layout selection

### Layouts

At minimum:

* Full Screen
* Lower Third
* Caption
* Corner
* Overlay
* Custom

### Operator Controls

* Keyboard shortcuts
* Mouse interaction
* Search
* Drag and drop
* Preview before going live
* Emergency controls

### Media

* Images
* Videos
* Basic media library
* Local media references

---

# 7. Explicitly Out of Scope for Initial V1

Do not build these as core V1 functionality:

* AI Scripture detection
* AI sermon analysis
* AI-generated presentations
* Mobile application
* Cloud collaboration
* Full church management
* Church accounting
* Church member management
* Giving/donations
* Attendance management
* Complex CRM
* Advanced analytics
* Social media management
* Automated livestream production

These belong to future phases.

The architecture must allow them later without requiring the V1 application to be rewritten.

---

# 8. Presentation Engine

The presentation engine is the most important subsystem.

It must be designed independently from the user interface.

The UI should issue presentation actions rather than directly controlling rendering logic.

Examples:

```text
NEXT_SLIDE
PREVIOUS_SLIDE
GO_TO_SLIDE
SEND_LIVE
BLACK_SCREEN
CLEAR_OUTPUT
FREEZE_OUTPUT
SHOW_SCRIPTURE
SHOW_LOWER_THIRD
CHANGE_LAYOUT
CHANGE_BACKGROUND
```

Keyboard controls, remote controls, Stream Deck controls, and future APIs should all trigger the same action system.

This prevents different control systems from implementing duplicate business logic.

---

# 9. Scripture System

The Scripture system must support:

* Bible reference search
* Book selection
* Chapter selection
* Verse selection
* Verse ranges
* Translation selection
* Scripture preview
* Scripture presentation
* Previous/next navigation
* Scripture formatting
* Scripture layouts

The architecture must support replaceable Bible providers.

Do not hard-code copyrighted Bible translations into the application.

Bible translation licensing must be considered before production distribution.

The Scripture provider should be abstracted behind a provider interface.

Example:

```text
BibleProvider
├── searchReference()
├── getPassage()
├── getBook()
├── getChapter()
└── getTranslations()
```

---

# 10. Scripture Navigation

Scripture navigation must be optimized for live operation.

If Scripture is currently live:

* Arrow Right / Down → next verse
* Arrow Left / Up → previous verse

The operator should not have to reopen the Scripture item or double-click the content to continue navigating.

The same principle applies to lyrics.

---

# 11. Lyrics System

Songs should support:

* Song title
* Artist/author
* Lyrics
* Sections
* Verses
* Chorus
* Bridge
* Intro
* Outro
* Custom sections

Operators must be able to:

* Navigate lyrics quickly
* Reorder sections
* Edit lyrics
* Preview slides
* Send individual slides live
* Navigate while live

The system should eventually support song arrangements.

---

# 12. AI Architecture

AI is a future subsystem.

The initial architecture should reserve clear boundaries for AI without implementing unnecessary AI functionality in V1.

Future pipeline:

```text
Audio Input
    ↓
Speech-to-Text
    ↓
Reference Detection
    ↓
Scripture Candidate Extraction
    ↓
Confidence Scoring
    ↓
Suggestions Panel
    ↓
Operator Approval
    ↓
Presentation Action
    ↓
Live Output
```

Example:

Pastor says:

> "Let's look at John chapter three, verse sixteen."

The system may detect:

```text
John 3:16
Confidence: 96%
```

The operator sees:

> John 3:16
> [Preview] [Send Live]

The system must **never automatically send uncertain AI results live**.

---

# 13. Suggestions System

AI suggestions should exist as a dedicated UI concept.

Suggestions may eventually include:

* Scripture references
* Related verses
* Song suggestions
* Content suggestions
* Presentation actions

Suggestions must remain separate from the live output state.

A suggestion becomes live only after an explicit operator action.

---

# 14. Visual Presentation System

Veyrin must separate:

### Content

What is being displayed.

### Layout

Where the content is displayed.

### Background

What exists behind the content.

### Output

Where the result is displayed.

This separation is fundamental.

Example:

```text
Content
  ↓
Layout
  ↓
Background
  ↓
Presentation Scene
  ↓
Output
```

---

# 15. Background System

Support:

* Solid colors
* Gradients
* Images
* Videos
* Transparent/no background

A content item should not be permanently tied to one background.

Operators should be able to change presentation appearance without modifying the underlying content.

---

# 16. Output Architecture

The architecture must support multiple outputs.

Potential outputs:

```text
Operator Interface
        │
        ├── Congregation Display
        ├── Stage Display
        ├── Confidence Monitor
        ├── Livestream Output
        └── Recording/Production Output
```

The initial web application may not fully implement every output.

However, the architecture must not assume that one browser window equals one presentation output.

---

# 17. Desktop Architecture

Veyrin begins as a web application but must be designed to eventually become a desktop application.

The preferred future desktop framework is:

**Tauri 2**

The web interface should remain independent from desktop-specific APIs.

Desktop-specific functionality should exist behind adapters/services.

Examples:

```text
FileSystemAdapter
DisplayAdapter
WindowAdapter
MediaAdapter
```

The goal is to avoid rewriting the application when moving from web to desktop.

---

# 18. Offline-First Architecture

The live presentation engine must continue functioning without internet access.

Internet should not be required for:

* Loading an existing service
* Navigating slides
* Showing Scripture already stored locally
* Playing local media
* Changing layouts
* Changing backgrounds
* Using keyboard controls
* Sending content to outputs

Future cloud functionality may require internet, but the presentation engine must remain functional without it.

---

# 19. Data Architecture

Recommended architecture:

### Cloud

Supabase / PostgreSQL for:

* Users
* Organizations
* Services
* Songs
* Scripture metadata
* Templates
* Layouts
* Settings
* Permissions
* Cloud media metadata
* Synchronization
* Backup

### Local

SQLite for desktop/local presentation data.

Local storage should contain enough information for a downloaded service to operate independently.

---

# 20. Technical Stack

Initial stack:

### Frontend

* React
* TypeScript
* Next.js
* Tailwind CSS
* shadcn/ui
* Base UI

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Realtime
* Row Level Security

### Hosting

* Vercel

### Source Control

* GitHub

### Future Desktop

* Tauri 2

### Future Production Integrations

* OBS WebSocket
* NDI
* MIDI
* Stream Deck
* ATEM
* vMix

Technology choices may be changed if a strong technical reason emerges, but changes must be documented.

---

# 21. Design System

The UI must use a centralized design system.

Do not create arbitrary styling independently inside every component.

The design system should define:

* Typography
* Spacing
* Border radius
* Shadows
* Surface hierarchy
* Motion
* Icons
* Interactive states
* Focus states
* Semantic colors

---

# 22. Semantic Colors

Colors must have semantic meaning.

Example token categories:

```text
primary
secondary
success
warning
error
info
neutral
background
surface
foreground
muted
border
focus
```

Do not use arbitrary colors for individual components.

Color must never be the only method of communicating state.

Example:

Bad:

> Red = error

Better:

> Error icon + text + semantic color + appropriate interaction state

---

# 23. Accessibility

Accessibility is a day-one requirement.

The application must support:

* Keyboard navigation
* Visible focus states
* Logical tab order
* Accessible dialogs
* Accessible menus
* Semantic HTML
* Appropriate ARIA usage
* Sufficient contrast
* Accessible text sizing
* Reduced-motion preferences
* Screen-reader-friendly controls
* Non-color-only state indicators

Keyboard operation is both:

1. An accessibility requirement
2. A core operator workflow

---

# 24. Loading States

Use skeleton loaders for meaningful asynchronous loading states.

Skeletons should represent the actual structure of the content being loaded.

Do not add skeleton loaders to operations that are effectively instantaneous.

Avoid unnecessary loading animation.

The interface should communicate:

* Loading
* Success
* Error
* Empty state
* Offline state

clearly and consistently.

---

# 25. Error Handling

Errors must be:

* Understandable
* Actionable
* Recoverable where possible

Do not expose raw technical errors to normal users.

Example:

Bad:

```text
TypeError: Cannot read properties of undefined
```

Better:

```text
Unable to load this presentation.

Try again or reopen the service.
```

Developer diagnostics may still be available through logs.

---

# 26. Empty States

Empty states should explain what the user can do next.

Avoid decorative empty states.

Example:

```text
No services yet.

Create your first service to begin.

[Create Service]
```

---

# 27. Emergency Controls

Emergency controls must remain accessible during presentation.

Core controls:

* BLACK
* CLEAR
* FREEZE
* LIVE
* PAUSE

These controls should have keyboard shortcuts.

They must not be buried inside settings.

---

# 28. Keyboard Architecture

Keyboard shortcuts must be centralized.

Do not implement shortcut logic independently in individual UI components.

Use a centralized action/command system.

Example:

```text
ArrowRight → NEXT_SLIDE
ArrowLeft  → PREVIOUS_SLIDE
B          → BLACK_SCREEN
C          → CLEAR_OUTPUT
Space      → NEXT_SLIDE
```

Exact shortcuts may evolve.

The architecture must support:

* Global shortcuts
* Context-specific shortcuts
* User customization
* Conflict detection
* Shortcut documentation

---

# 29. Service Builder

The service builder should allow an operator to construct a complete service.

Example:

```text
Sunday Service

01  Opening
02  Praise
03  Worship
04  Scripture
05  Sermon
06  Altar Call
07  Announcements
08  Closing
```

Each item may contain:

* Lyrics
* Scripture
* Text
* Images
* Videos
* Presentation scenes

Operators must be able to reorder items quickly.

Drag-and-drop should be supported but should not be the only method of reordering.

---

# 30. Media Library

The media library should eventually support:

* Images
* Videos
* Backgrounds
* Audio
* Templates
* Imported assets

Media metadata should be separated from actual media files.

Local and cloud media should use an abstraction layer.

---

# 31. Integrations

Integrations must use adapters.

Example architecture:

```text
Presentation Core
        │
        ├── Display Adapter
        ├── OBS Adapter
        ├── NDI Adapter
        ├── MIDI Adapter
        ├── Stream Deck Adapter
        └── ATEM Adapter
```

Do not couple the presentation engine directly to one production platform.

---

# 32. OBS Integration

OBS integration is a future priority.

The architecture should eventually support:

* Scene switching
* Source visibility
* Presentation output
* Livestream control
* Production triggers

Use an adapter rather than placing OBS-specific code throughout the application.

---

# 33. Remote Control

Future mobile/tablet remote control should allow operators or authorized users to:

* Navigate slides
* Select service items
* Send content live
* Black screen
* Clear output
* View current/next slide
* Trigger presentation actions

Remote control must use the same action system as the main application.

---

# 34. Security

Security requirements include:

* Authentication
* Authorization
* Organization boundaries
* Role-based permissions
* Secure API access
* Row Level Security
* Protected media
* Safe local storage
* No exposed secrets
* Environment variables for credentials

Never place secrets directly in frontend code.

---

# 35. Component Architecture

Components should be reusable.

Avoid creating multiple components that solve the same problem differently.

Prefer:

```text
components/
├── ui/
├── presentation/
├── scripture/
├── lyrics/
├── media/
├── service/
├── operator/
└── settings/
```

Business logic should live outside purely visual components where appropriate.

---

# 36. Code Quality

Code must prioritize:

* Readability
* Maintainability
* Strong typing
* Reusability
* Small focused components
* Clear naming
* Predictable state management

Avoid:

* Giant components
* Duplicate logic
* Magic values
* Unnecessary abstractions
* Premature optimization
* Dead code
* Temporary hacks becoming permanent architecture

---

# 37. State Management

Separate different categories of state.

Examples:

### UI State

* Sidebar open
* Modal open
* Selected tab

### Application State

* Current service
* Selected item
* Current slide

### Presentation State

* Live slide
* Output state
* Black screen
* Active layout

### Persistent Data

* Songs
* Services
* Media
* Templates
* Settings

Do not place every piece of state into one global store.

---

# 38. Testing

Testing must cover critical presentation workflows.

At minimum:

### Unit Tests

* Scripture parsing
* Slide navigation
* Service ordering
* Action dispatching
* Shortcut mapping

### Integration Tests

* Service creation
* Content insertion
* Presentation actions
* Media loading

### End-to-End Tests

Critical operator workflow:

```text
Create service
→ Add content
→ Preview
→ Send live
→ Navigate
→ Change layout
→ Black screen
→ Clear output
```

---

# 39. Performance

The application must prioritize live-service performance.

Avoid:

* Unnecessary re-renders
* Large blocking operations
* Heavy animations
* Unoptimized media loading
* Excessive network requests

Presentation transitions should feel immediate.

---

# 40. Motion

Motion should communicate state or hierarchy.

Do not use animation simply because it looks impressive.

Support:

```text
prefers-reduced-motion
```

Avoid excessive:

* Glows
* Particle effects
* Gradients
* AI-style animated backgrounds
* Large transition animations

---

# 41. Antigravity Development Rules

Antigravity must not attempt to build the entire application in one pass.

Development should be incremental.

Preferred sequence:

```text
Specification
↓
Architecture
↓
Foundation
↓
Core presentation engine
↓
Content systems
↓
Operator workflow
↓
Output architecture
↓
Integrations
↓
Future AI
```

Before implementing a major subsystem:

1. Read the relevant documentation.
2. Understand existing architecture.
3. Identify affected interfaces.
4. Implement the smallest complete version.
5. Test it.
6. Refactor if necessary.
7. Commit the change.

Do not fabricate future functionality merely to make screens look complete.

---

# 42. Git Workflow

GitHub is the source of truth.

Recommended branches:

```text
main
development
feature/*
fix/*
refactor/*
```

Do not make large uncontrolled changes across the repository.

Commits should be:

* Focused
* Descriptive
* Reversible

Example:

```text
feat: add service item navigation
```

rather than:

```text
update stuff
```

---

# 43. Documentation

The repository should eventually contain:

```text
MASTER_BUILD.md
PRODUCT.md
ARCHITECTURE.md
DESIGN-SYSTEM.md
DATABASE.md
ROADMAP.md
AGENTS.md
```

Each document has a specific responsibility.

`MASTER_BUILD.md`

Product constitution and technical direction.

`PRODUCT.md`

Detailed product behavior and requirements.

`ARCHITECTURE.md`

Technical architecture and system boundaries.

`DESIGN-SYSTEM.md`

Visual language and UI standards.

`DATABASE.md`

Data model and persistence architecture.

`ROADMAP.md`

Development phases and priorities.

`AGENTS.md`

Rules for AI coding agents and contributors.

---

# 44. Future Codex Handoff

The project must not depend on conversation history.

A future coding agent must be able to enter the repository and understand:

* What the product is
* Why it exists
* What has been built
* What remains
* How the architecture works
* What conventions must be followed
* What must not be changed casually

All important architectural decisions should therefore be documented in the repository.

---

# 45. V1 Acceptance Criteria

V1 is considered functional when an operator can:

1. Create a service.
2. Add songs.
3. Add Scripture.
4. Add text.
5. Add images.
6. Add videos.
7. Arrange service items.
8. Preview current content.
9. Preview next content.
10. Send content live.
11. Navigate slides using keyboard.
12. Navigate Scripture efficiently.
13. Navigate lyrics efficiently.
14. Change layouts.
15. Change backgrounds.
16. Use lower-third presentation.
17. Use caption presentation.
18. Clear output.
19. Black output.
20. Recover from common errors without restarting the application.

The interface must remain understandable without extensive training.

---

# 46. Development Roadmap

## Phase 0 — Foundation

* Repository
* Project structure
* Design tokens
* UI foundation
* Routing
* State architecture
* Documentation
* Testing foundation

## Phase 1 — Operator Workstation

* Service builder
* Content management
* Lyrics
* Scripture
* Text
* Images
* Videos
* Preview
* Live presentation
* Keyboard controls

## Phase 2 — Presentation Engine

* Layout system
* Background system
* Output abstraction
* Multi-window architecture
* Emergency controls

## Phase 3 — Desktop

* Tauri integration
* Local database
* Local media
* Multiple displays
* Offline presentation

## Phase 4 — Remote

* Remote control
* Mobile/tablet interface
* Real-time presentation actions

## Phase 5 — Production

* OBS
* NDI
* MIDI
* Stream Deck
* ATEM
* vMix

## Phase 6 — Intelligence

* Speech-to-text
* Scripture detection
* Suggestions
* Smart search
* AI-assisted workflows

## Phase 7 — Cloud

* Cloud sync
* Backup
* Collaboration
* Organization management
* Permissions

---

# 47. Non-Negotiables

The following must not be sacrificed for speed:

1. Reliability
2. Keyboard-first operation
3. Accessibility
4. Offline presentation
5. Clean UI
6. Semantic design system
7. Reusable architecture
8. Human approval of AI actions
9. Clear separation between presentation logic and UI
10. Maintainable code
11. Secure data handling
12. Proper error handling
13. Proper loading states
14. No unnecessary dependencies
15. No premature feature development

---

# 48. Final Product Principle

Veyrin should feel like a professional production tool, not a complicated piece of church software.

The operator should be able to sit down, understand the interface quickly, prepare a service, and control the presentation confidently.

Every major feature should answer one question:

> **Does this make the live presentation workflow faster, clearer, safer, or more powerful?**

If the answer is no, reconsider building it.

---

# 49. Working Brand Note

**Veyrin** is the current working product name.

The name is intentionally isolated from the technical architecture so it can be changed later without requiring structural changes to the application.

Do not hard-code the brand name throughout business logic, database identifiers, or internal APIs.

Use configurable product metadata where appropriate.

---

# 50. Initial Build Directive

Begin with the **Operator Workstation**.

Do not implement AI, remote control, cloud collaboration, advanced production integrations, or a full desktop environment during the first implementation pass.

Build the foundation correctly first.

The first objective is simple:

> **Create a presentation system that an operator can confidently use during a real church service.**

Everything else builds on that foundation.