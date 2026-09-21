# Veyrin — Phase 1: Operator Workstation

> **Status:** Active
> **Phase:** 1
> **Phase Name:** Operator Workstation
> **Prerequisite:** Phase 0 — Foundation complete
> **Primary Goal:** Turn the Veyrin foundation into a functional presentation application capable of supporting a basic real-world church service.

---

# 1. Phase Objective

Phase 1 is the first major product-building phase.

The objective is to move Veyrin from a technical/UI foundation into a working **Operator Workstation**.

At the end of Phase 1, an operator must be able to:

```text
Sign In
   ↓
Enter Organization
   ↓
Create Service
   ↓
Add Content
   ↓
Arrange Service
   ↓
Preview Content
   ↓
Open Presentation Output
   ↓
Send Content Live
   ↓
Navigate During Service
   ↓
Black / Clear Output
```

The application must be functional enough to simulate a real basic church service.

---

# 2. Phase 1 Scope

Phase 1 contains six major workstreams:

1. Presentation Output Foundation
2. Scripture System
3. Song/Lyric System
4. Service Persistence
5. Authentication & Organization Boundaries
6. Text/Image/Video Content Types

These systems must integrate with the existing Phase 0 architecture.

Do not rebuild the Phase 0 foundation unless a documented architectural problem requires it.

---

# 3. Implementation Order

Work should generally proceed in this order:

```text
1. Presentation Output Foundation
        ↓
2. Scripture System
        ↓
3. Song/Lyric System
        ↓
4. Service Persistence
        ↓
5. Authentication & Organizations
        ↓
6. Text / Image / Video
        ↓
7. End-to-End Integration
        ↓
8. Phase 1 Acceptance Testing
```

Some workstreams may be developed in parallel when there are no dependency conflicts.

The presentation engine should remain the central integration point.

---

# 4. Workstream 1 — Presentation Output Foundation

## Objective

Create the first real presentation output system.

The operator interface and presentation output must be treated as separate concerns.

---

## 4.1 Second Window

Implement a presentation output window that can be opened separately from the operator interface.

Conceptually:

```text
┌───────────────────────┐
│ Operator Window       │
│                       │
│ Controls presentation│
└───────────┬───────────┘
            │
            │ Presentation State
            ↓
┌───────────────────────┐
│ Presentation Window   │
│                       │
│ Live Output           │
└───────────────────────┘
```

The presentation window must not contain operator controls.

It is an output surface.

---

## 4.2 Live / Preview Separation

The operator must be able to preview content without changing the live output.

There must be a clear distinction between:

```text
Preview State
```

and

```text
Live State
```

Changing the preview must not automatically change the live output.

---

## 4.3 Presentation State

Create a centralized presentation state model.

At minimum:

```text
liveContent
previewContent
liveSlide
previewSlide
activeLayout
activeBackground
outputState
```

Output states should include:

```text
LIVE
BLACK
CLEAR
```

Additional states may be introduced when necessary.

---

## 4.4 Presentation Actions

All presentation changes must go through a centralized action system.

Initial actions:

```text
SEND_LIVE
NEXT_SLIDE
PREVIOUS_SLIDE
GO_TO_SLIDE

BLACK_SCREEN
CLEAR_OUTPUT

SET_LAYOUT
SET_BACKGROUND
```

UI buttons and keyboard shortcuts must dispatch these actions rather than implementing presentation logic independently.

---

## 4.5 Current / Next

The operator interface must clearly communicate:

### Current

What is currently live.

### Next

What will be presented next.

The operator must not have to infer the current state from subtle UI indicators.

---

## 4.6 Emergency Controls

Persistent controls:

```text
BLACK
CLEAR
```

These must remain accessible during a presentation.

Keyboard shortcuts should also exist.

Exact key mappings should follow the centralized shortcut system established in Phase 0.

---

## 4.7 Initial Layouts

Implement:

* Full Screen
* Lower Third
* Caption
* Overlay

Custom positioning can remain limited in Phase 1.

The layout architecture must be extensible.

---

## 4.8 Backgrounds

Initial background support:

* Solid
* Image
* None

Video backgrounds are optional for the first implementation if they introduce unnecessary complexity.

The architecture should allow them later.

---

# 5. Workstream 2 — Scripture System

## Objective

Create the first real Scripture content workflow.

Phase 1 will use the **World English Bible (WEB)** dataset as the initial local Bible data source.

This is an implementation choice for Phase 1 and must remain behind the `BibleProvider` abstraction.

---

# 5.1 Scripture Data

Load the WEB data into the application's Scripture system.

The data layer must not be tightly coupled to the UI.

The application should interact with the data through a provider interface.

Example:

```text
BibleProvider

getBooks()
getBook()
getChapter()
getVerse()
getPassage()
search()
```

---

# 5.2 Reference Parser

Create a Scripture reference parser capable of understanding references such as:

```text
John 3:16
John 3:16-18
Psalm 23
Romans 8
Romans 8:28
1 Corinthians 13:4-7
```

The parser should return structured data.

Example:

```text
{
  book: "John",
  chapter: 3,
  startVerse: 16,
  endVerse: 16
}
```

Do not use fragile string matching throughout the application.

Reference parsing belongs in a reusable service/module.

---

# 5.3 Scripture Search

The operator should be able to search Scripture.

Initial search should support:

* Book name
* Book abbreviation
* Chapter
* Verse
* Passage reference

Example:

```text
John 3:16
```

should return the corresponding passage.

---

# 5.4 Scripture Navigation

When a Scripture item is active:

```text
NEXT
```

moves to the next verse/slide.

```text
PREVIOUS
```

moves to the previous verse/slide.

The operator must not need to reopen the Scripture item.

This is a core Veyrin workflow.

---

# 5.5 Scripture Item

A Scripture service item should contain structured information.

Example:

```text
type: scripture

reference:
  book
  chapter
  startVerse
  endVerse

translation
passage
layout
background
```

Do not store Scripture only as an unstructured text blob.

---

# 5.6 Scripture Preview

Before going live, the operator must be able to see:

* Reference
* Translation
* Passage
* Layout
* Background

The preview must use the same presentation renderer as live output where practical.

This reduces discrepancies between preview and live.

---

# 5.7 Scripture Live Workflow

Required workflow:

```text
Search Scripture
      ↓
Select Passage
      ↓
Preview
      ↓
Send Live
      ↓
Next / Previous
```

---

# 6. Workstream 3 — Song & Lyric System

## Objective

Create the first usable song library and lyric presentation workflow.

---

# 6.1 Song Model

A song should contain at minimum:

```text
id
title
artist
sections
createdAt
updatedAt
```

Sections should contain:

```text
id
type
label
content
order
```

Supported section types:

```text
Verse
Chorus
Bridge
Intro
Outro
Pre-Chorus
Interlude
Custom
```

---

# 6.2 Song Library

Operators must be able to:

* View songs
* Search songs
* Create song
* Edit song
* Delete song
* Add song to service

The library should remain simple.

Do not build advanced music-management functionality in Phase 1.

---

# 6.3 Lyric Editor

The lyric editor must support:

* Editing section content
* Creating sections
* Deleting sections
* Reordering sections
* Renaming sections
* Previewing lyrics

The editor should prioritize speed over decorative functionality.

---

# 6.4 Lyric Presentation

A song should generate presentation slides from its sections.

Example:

```text
Verse 1
→ Slide 1

Verse 1 continued
→ Slide 2

Chorus
→ Slide 3
```

The exact automatic splitting algorithm can remain simple initially.

---

# 6.5 Lyric Navigation

When a song is live:

```text
NEXT
PREVIOUS
```

must navigate the generated lyric slides.

The operator should not have to reopen the song.

---

# 6.6 Song Live Workflow

Required workflow:

```text
Open Song Library
      ↓
Select Song
      ↓
Add to Service
      ↓
Select Section / Slide
      ↓
Preview
      ↓
Send Live
      ↓
Navigate Lyrics
```

---

# 7. Workstream 4 — Service Persistence

## Objective

Persist actual Veyrin service data using Supabase.

Phase 1 introduces the first production database layer.

---

# 7.1 Core Entities

Initial database entities:

```text
organizations
users / profiles
services
service_items
songs
song_sections
```

Scripture should remain provider-driven.

A service item may reference Scripture metadata rather than duplicating the entire Bible dataset in Supabase.

---

# 7.2 Services

A service should contain:

```text
id
organization_id
name
description
scheduled_at
created_at
updated_at
```

---

# 7.3 Service Items

A service item should contain:

```text
id
service_id
type
position
content_reference
created_at
updated_at
```

The exact schema may evolve during implementation.

Do not duplicate large content payloads unnecessarily.

---

# 7.4 Ordering

Service item ordering must be deterministic.

Do not rely on database insertion order.

Use an explicit ordering mechanism.

The operator must be able to reorder service items.

---

# 7.5 Persistence Workflow

When an operator changes a service:

```text
UI
 ↓
Application State
 ↓
Persistence Layer
 ↓
Supabase
```

The UI should not contain raw database logic throughout individual components.

Use a repository/service abstraction.

---

# 7.6 Loading States

Database-backed views must implement proper loading states.

Use skeleton loaders where content is meaningfully asynchronous.

Do not use skeletons for actions that resolve immediately.

---

# 7.7 Error States

Database failures must provide understandable UI feedback.

Example:

```text
Unable to save service.

Your changes are still available locally.
Try again.
```

Do not expose raw Supabase/database errors to ordinary users.

---

# 8. Workstream 5 — Authentication & Organizations

## Objective

Introduce secure user authentication and organization boundaries.

---

# 8.1 Authentication

Use Supabase Auth.

Initial requirements:

* Sign up
* Sign in
* Sign out
* Session persistence
* Protected application routes

---

# 8.2 User Profile

Authenticated users should have a profile record.

At minimum:

```text
id
email
display_name
created_at
updated_at
```

Do not duplicate authentication credentials in application tables.

Supabase Auth remains the authentication authority.

---

# 8.3 Organization

Veyrin should use an organization-based data model.

Conceptually:

```text
User
 ↓
Organization Membership
 ↓
Organization
 ↓
Services / Songs / Content
```

A user's organization membership determines which resources they can access.

---

# 8.4 Organization Boundaries

A user must never be able to access another organization's data simply by modifying an ID in a request.

Use Supabase Row Level Security.

Every organization-owned resource must have a clear relationship to its organization.

---

# 8.5 Initial Roles

Phase 1 may implement:

```text
OWNER
ADMIN
OPERATOR
```

Role capabilities should remain minimal.

Do not build a complex permissions system before it is needed.

---

# 8.6 Authentication UX

Authentication screens should be:

* Simple
* Accessible
* Responsive
* Clear
* Fast

Do not turn authentication into a marketing landing page.

---

# 9. Workstream 6 — Text / Image / Video

## Objective

Add the remaining initial content types required for a basic presentation.

---

# 9.1 Text

Text content should support:

* Title
* Body
* Basic formatting
* Alignment
* Size
* Position
* Layout

Text must be usable for:

* Announcements
* Speaker names
* Sermon points
* Quotes
* Notices

---

# 9.2 Image

Image content should support:

* Local image selection
* Preview
* Service insertion
* Presentation
* Basic positioning

Do not build an advanced asset-management system yet.

---

# 9.3 Video

Video content should support:

* Local video selection
* Preview
* Playback
* Pause
* Resume
* Presentation

The implementation must account for browser autoplay restrictions and user interaction requirements.

---

# 9.4 Media Abstraction

Do not make presentation rendering dependent on one specific storage mechanism.

Use an abstraction such as:

```text
MediaProvider
```

Future providers may include:

```text
LocalMedia
SupabaseStorage
CloudStorage
```

---

# 10. Unified Content Model

All content types should integrate with the service-item architecture.

Conceptually:

```text
Service
  │
  ├── Scripture
  ├── Song
  ├── Text
  ├── Image
  └── Video
```

The operator should interact with these through a consistent service workflow.

---

# 11. Presentation Renderer

All content types should ultimately produce a presentation representation that the output renderer can display.

Conceptually:

```text
Content
   ↓
Presentation Model
   ↓
Layout
   ↓
Renderer
   ↓
Output
```

Do not implement separate rendering systems for every content type unless technically necessary.

---

# 12. Keyboard Integration

Every content type must work with the centralized action system.

For example:

```text
NEXT_SLIDE
```

should behave appropriately for:

* Scripture
* Songs
* Text sequences
* Presentations

The operator should not need different mental models for different content types.

---

# 13. Phase 1 UI Requirements

The Operator Workstation must clearly expose:

### Service

* Current service
* Service items
* Selected item

### Presentation

* Current
* Next
* Preview

### Controls

* Live
* Next
* Previous
* Black
* Clear

### Content

* Scripture
* Songs
* Text
* Media

The exact visual arrangement is defined by `DESIGN-SYSTEM.md`.

---

# 14. Accessibility Requirements

Every Phase 1 feature must comply with the accessibility rules established in `MASTER_BUILD.md`.

Minimum requirements:

* Keyboard navigation
* Visible focus
* Accessible buttons
* Semantic HTML
* Logical tab order
* Accessible dialogs
* Contrast
* No color-only state indicators
* Reduced motion support

Do not postpone accessibility fixes until after Phase 1.

---

# 15. Loading / Empty / Error States

Every major Phase 1 feature must account for:

```text
Loading
Empty
Error
Success
Offline / unavailable
```

Examples:

### Empty Song Library

```text
No songs yet.

Create your first song to begin.

[Create Song]
```

### Empty Service

```text
This service is empty.

Add a song, Scripture, text, or media.
```

### Loading Scripture

Use an appropriate skeleton.

### Database Error

Provide an actionable recovery path.

---

# 16. Data Safety

Do not lose user work because of a temporary network failure.

Where practical:

* Maintain local application state until persistence succeeds.
* Avoid clearing unsaved content after failed requests.
* Communicate save status clearly.
* Retry safe operations where appropriate.

Full offline persistence is a later milestone, but Phase 1 should avoid fragile workflows.

---

# 17. Security Requirements

Phase 1 must:

* Use Supabase Auth
* Use Row Level Security
* Protect organization-owned data
* Keep secrets server-side
* Never expose service-role credentials to the client
* Validate user permissions
* Avoid trusting client-supplied organization IDs

---

# 18. Testing Requirements

Each workstream must include tests.

## Presentation

Test:

* Send live
* Next
* Previous
* Black
* Clear
* Preview/live separation

## Scripture

Test:

* Reference parsing
* Search
* Passage loading
* Verse navigation
* Verse ranges

## Songs

Test:

* Song creation
* Editing
* Section ordering
* Slide generation
* Navigation

## Persistence

Test:

* Service creation
* Service item creation
* Ordering
* Save/update
* Organization isolation

## Authentication

Test:

* Sign in
* Sign out
* Protected routes
* Organization access

## Media

Test:

* Text
* Image
* Video
* Preview
* Presentation

---

# 19. Integration Testing

The most important integration test is a complete simulated service.

Required flow:

```text
Sign In
 ↓
Open Organization
 ↓
Create Service
 ↓
Add Song
 ↓
Add Scripture
 ↓
Add Text
 ↓
Add Image
 ↓
Add Video
 ↓
Arrange Service
 ↓
Open Presentation Output
 ↓
Preview Content
 ↓
Send Song Live
 ↓
Next Lyric
 ↓
Send Scripture Live
 ↓
Next Verse
 ↓
Send Text Live
 ↓
Present Image
 ↓
Play Video
 ↓
Black Output
 ↓
Clear Output
```

This workflow must work without requiring the operator to bypass the intended UI.

---

# 20. Phase 1 Non-Goals

Do not expand Phase 1 into:

* AI Scripture detection
* AI sermon processing
* Mobile remote control
* Cloud collaboration
* Advanced templates
* NDI
* MIDI
* Stream Deck
* ATEM
* vMix
* Advanced multi-output management
* Full desktop packaging
* Complex permissions
* Church management
* Analytics
* Automated production

These are future phases.

---

# 21. Definition of Done

Phase 1 is complete only when:

### Authentication

* Users can authenticate.
* Protected routes work.
* Organization boundaries work.

### Services

* Users can create services.
* Services persist.
* Items persist.
* Items can be reordered.

### Scripture

* WEB data loads.
* References parse.
* Scripture can be searched.
* Passages can be previewed.
* Scripture can go live.
* Verse navigation works.

### Songs

* Songs can be created.
* Songs can be edited.
* Sections work.
* Lyrics can be previewed.
* Lyrics can go live.
* Lyric navigation works.

### Presentation

* Separate output window works.
* Preview and live are separated.
* Layouts render.
* Current/next works.
* Black works.
* Clear works.
* Keyboard navigation works.

### Content

* Text works.
* Images work.
* Videos work.

### Quality

* Loading states exist.
* Empty states exist.
* Errors are handled.
* Accessibility requirements are met.
* Critical workflows are tested.
* No major architectural shortcuts have been introduced.

---

# 22. Phase 1 Success Criteria

The ultimate test is not the number of implemented features.

The test is:

> Can a real operator prepare and run a basic church service using Veyrin without fighting the software?

A successful Phase 1 should demonstrate:

```text
Reliable
Fast
Understandable
Keyboard-first
Accessible
Presentation-ready
```

---

# 23. Development Rule

Build Phase 1 incrementally.

Do not implement all six workstreams in one large operation.

Preferred implementation pattern:

```text
Define
 ↓
Implement
 ↓
Test
 ↓
Review
 ↓
Integrate
 ↓
Commit
```

Each major subsystem should be stable before the next subsystem builds heavily on it.

Do not create placeholder functionality that pretends to be complete.

If a feature is not implemented, represent that honestly in the UI and documentation.

---

# 24. Phase 1 Completion State

When Phase 1 is complete, Veyrin should have evolved from:

> **Foundation**

into:

> **A functional church presentation workstation capable of running a basic service.**

Phase 2 should only begin after the Phase 1 acceptance workflow has been successfully completed and verified.
