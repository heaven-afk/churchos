# Veyrin — Product Specification

> **Document:** PRODUCT.md
> **Status:** Initial Specification
> **Product:** Veyrin
> **Category:** Church Presentation & Live Production Platform
> **Relationship:** Companion to `MASTER_BUILD.md`

---

# 1. Product Definition

Veyrin is a presentation and live-production platform built for churches.

It allows a media operator to prepare, organize, preview, and present service content from a single workspace.

The product is designed around one central workflow:

```text
Prepare
   ↓
Organize
   ↓
Preview
   ↓
Present
   ↓
Control
```

The application should make this workflow fast enough that an operator can focus on the service rather than the software.

---

# 2. Product Boundary

Veyrin is a presentation and production product.

It is not intended to become a general-purpose church management platform.

### Veyrin should handle:

* Presentations
* Songs
* Lyrics
* Scripture
* Sermon content
* Images
* Videos
* Service schedules
* Presentation layouts
* Display outputs
* Production controls
* Remote presentation control
* AI-assisted presentation workflows

### Veyrin should not become:

* Church CRM
* Accounting platform
* Giving platform
* Attendance platform
* Membership management system
* Pastoral management system
* Full church ERP

Integrations with these systems may be considered later.

---

# 3. Primary User

The primary user is the person controlling the presentation during a live service.

The application should therefore optimize for:

* Speed
* Visibility
* Predictability
* Low cognitive load
* Keyboard control
* Fast recovery
* Minimal distractions

The operator should be able to glance at the interface and immediately understand:

1. What is live?
2. What is next?
3. What can I trigger?
4. What will happen if I press this button?

---

# 4. Core Workflow

The primary workflow is:

```text
Open Veyrin
    ↓
Create/Open Service
    ↓
Build Service Order
    ↓
Prepare Content
    ↓
Preview
    ↓
Start Presentation
    ↓
Navigate Content
    ↓
Control Output
    ↓
End Service
```

Every major product feature should support this workflow.

---

# 5. Service

A Service represents a presentation session.

Example:

```text
Sunday Service — 21 September 2026
```

A service contains ordered presentation items.

Example:

```text
Sunday Service

01  Welcome
02  Opening Prayer
03  Praise
04  Worship
05  Scripture
06  Sermon
07  Altar Call
08  Announcements
09  Closing
```

---

# 6. Service Items

A service item represents a piece of presentation content.

Supported item types:

```text
Song
Scripture
Text
Image
Video
Presentation
```

Future item types may include:

```text
Web Content
Countdown
Timer
Announcement
Live Feed
Camera
Embedded Content
```

Future functionality must not require redesigning the core service-item architecture.

---

# 7. Service Builder

The Service Builder is where operators construct a service.

Required functionality:

* Add item
* Remove item
* Duplicate item
* Rename item
* Reorder item
* Search item
* Preview item
* Select item
* Expand/collapse item
* Group items

Drag-and-drop should be supported.

However, drag-and-drop must not be the only interaction method.

---

# 8. Presentation Workspace

The presentation workspace is the primary live operator environment.

The interface should expose the information needed during a live service without overwhelming the operator.

Recommended structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Header / Service / Status                                    │
├──────────────┬───────────────────────────────┬───────────────┤
│ Service      │                               │               │
│ Items        │       Current Preview         │   Next        │
│              │                               │   Preview     │
│              │                               │               │
├──────────────┴───────────────────────────────┴───────────────┤
│ Presentation Controls / Emergency Controls                    │
└──────────────────────────────────────────────────────────────┘
```

The exact UI can evolve.

The underlying information architecture should remain clear.

---

# 9. Current and Next

The operator must always be able to identify:

### Current

What is currently being displayed.

### Next

What will be displayed next.

This distinction must remain visually obvious.

The application should avoid layouts where the operator has to guess which slide is live.

---

# 10. Preview

Preview is separate from live output.

Operators should be able to inspect:

* Current slide
* Next slide
* Selected slide
* Layout
* Background
* Media

without changing the live output.

Previewing content must never accidentally send it live.

---

# 11. Live Output

Sending content live must be explicit.

Possible actions:

```text
SEND LIVE
NEXT
PREVIOUS
GO TO
```

The system should provide clear feedback after a live action.

The operator must always know what is currently live.

---

# 12. Songs

A Song contains:

* Title
* Artist/author
* Lyrics
* Sections
* Optional metadata
* Optional media/background configuration

Example:

```text
Amazing Grace

Verse 1
...

Chorus
...

Verse 2
...
```

---

# 13. Lyrics

Lyrics must be optimized for rapid live navigation.

Operators should be able to:

* Move to next lyric
* Move to previous lyric
* Jump to section
* Preview lyric
* Send lyric live
* Edit lyric
* Reorder sections

When a song is active, the operator should not have to repeatedly reopen or double-click the song to continue navigating.

Keyboard navigation should work continuously.

---

# 14. Scripture

Scripture should be treated as structured content rather than ordinary text.

A Scripture item should contain:

```text
Reference
Translation
Passage
Formatting
Layout
Background
```

Example:

```text
John 3:16
NIV

For God so loved the world...
```

---

# 15. Scripture Navigation

Once Scripture is active:

```text
Next → next verse
Previous → previous verse
```

Navigation should remain active without requiring the operator to reselect the Scripture item.

The system should support:

* Verse ranges
* Chapters
* Books
* Multiple translations
* Scripture search
* Passage preview

---

# 16. Scripture Search

The search experience should support natural references such as:

```text
John 3:16
John 3
Romans 8:28
Psalm 23
1 Corinthians 13:4-7
```

Search results should clearly show:

* Book
* Chapter
* Verse
* Translation
* Passage preview

---

# 17. Bible Provider Architecture

Bible data must come through an abstract provider system.

Example:

```text
BibleProvider

search()
getPassage()
getChapter()
getBook()
getTranslations()
```

This allows the application to change providers without rewriting the Scripture interface.

Copyright and translation licensing must be respected.

---

# 18. Text Content

Text should support:

* Title
* Body
* Typography
* Alignment
* Position
* Size
* Weight
* Color
* Background
* Layout

Text should be usable for:

* Announcements
* Sermon points
* Speaker names
* Lower thirds
* Quotes
* Notices

---

# 19. Media

Media content includes:

* Images
* Videos

Operators should be able to:

* Import media
* Preview media
* Add media to service
* Remove media
* Replace media
* Present media live

The media system should eventually support reusable media libraries.

---

# 20. Layout System

Layouts control where content appears.

Initial layouts:

### Full Screen

Content occupies the presentation area.

### Lower Third

Content appears near the bottom of the screen.

### Caption

Content appears as a readable caption overlay.

### Corner

Content is positioned within a screen corner.

### Overlay

Content is displayed over another visual layer.

### Custom

Operator-defined positioning.

---

# 21. Content and Layout Separation

Content should not be tightly coupled to a specific layout.

Example:

```text
John 3:16
    +
Lower Third
    +
Background A
```

can become:

```text
John 3:16
    +
Full Screen
    +
Background B
```

without recreating the Scripture.

---

# 22. Backgrounds

Backgrounds can be:

* Solid
* Gradient
* Image
* Video
* None

Background configuration should be reusable.

Operators should eventually be able to save background presets.

---

# 23. No Background

The application must support presentation without a background.

This is important for:

* Livestream overlays
* Lower thirds
* OBS
* Camera feeds
* Custom production workflows

Transparency must therefore be considered in the presentation architecture.

---

# 24. Output Modes

The platform should eventually support:

### Congregation

Main presentation screen.

### Stage

Stage-facing content.

### Confidence

Operator/speaker information.

### Livestream

Transparent or composited production output.

### Custom

User-defined output.

---

# 25. Operator Controls

Core controls:

```text
Previous
Next
Go To
Live
Black
Clear
Freeze
Pause
```

Emergency controls should remain accessible during live presentation.

---

# 26. Keyboard Controls

Keyboard controls are a core product feature.

The system should eventually support configurable shortcuts.

Example:

```text
Right Arrow → Next
Left Arrow  → Previous
Space       → Next
B           → Black
C           → Clear
```

Exact mappings may change.

Shortcut actions must be centralized.

---

# 27. Search

Search should eventually provide a unified content search.

Searchable content:

* Songs
* Lyrics
* Scripture
* Services
* Text
* Media
* Templates

Search should be fast enough for live usage.

---

# 28. AI Scripture Detection

AI Scripture detection is a future feature.

The intended experience:

```text
Audio
 ↓
Speech-to-Text
 ↓
Reference Detection
 ↓
Suggestion
 ↓
Preview
 ↓
Operator Approval
 ↓
Live
```

Example:

```text
Detected Scripture

John 3:16
96% confidence

[Preview] [Send Live]
```

The AI must never silently change the live presentation.

---

# 29. AI Design Principle

AI must reduce operator workload rather than create another system the operator must manage.

AI features should:

* Suggest
* Explain
* Preview
* Assist

AI should not:

* Surprise the operator
* Automatically change live content
* Hide its uncertainty
* Become mandatory for basic functionality

---

# 30. Remote Control

Remote control is a future feature.

A phone/tablet/browser can eventually act as a presentation controller.

Remote users should be able to:

* View current slide
* View next slide
* Navigate
* Select service items
* Trigger content
* Black output
* Clear output

Remote actions must use the same presentation action system as the main application.

---

# 31. Production Integrations

Future integrations include:

* OBS
* NDI
* MIDI
* Stream Deck
* ATEM
* vMix

Each integration should be isolated behind an adapter.

---

# 32. Desktop

Veyrin's long-term presentation environment should support desktop operation.

The desktop application should provide:

* Multiple windows
* Multiple displays
* Local media
* Local data
* Offline presentation
* Hardware integration

The web application should be designed so that desktop packaging does not require rewriting the presentation engine.

---

# 33. Offline

Core presentation functionality must work offline.

Offline functionality should eventually include:

* Existing services
* Local songs
* Local Scripture data
* Local media
* Layouts
* Backgrounds
* Keyboard controls
* Presentation output

Internet-dependent features must clearly communicate when connectivity is required.

---

# 34. Cloud

Cloud functionality is a later phase.

Potential cloud features:

* Account
* Organization
* Backup
* Sync
* Shared libraries
* Templates
* Collaboration
* Remote control

Cloud should enhance the product, not become a requirement for basic presentation.

---

# 35. User Roles

Future roles may include:

### Owner

Full organization control.

### Administrator

Manage organization settings and users.

### Media Manager

Manage presentation content.

### Operator

Control live presentations.

### Viewer

Read-only access.

Role definitions should be implemented only when the corresponding functionality exists.

---

# 36. Notifications

Notifications should be purposeful.

Avoid excessive notifications.

Useful notifications may include:

* Saved
* Failed to save
* Offline
* Media unavailable
* Connection lost
* Remote connected
* Integration disconnected

---

# 37. Error Recovery

A live-service error should provide a recovery path.

Examples:

```text
Media unavailable
→ Select replacement
```

```text
Connection lost
→ Continue using local presentation
```

```text
Remote disconnected
→ Main operator remains functional
```

The application should degrade gracefully whenever possible.

---

# 38. Performance Expectations

Presentation actions should feel immediate.

The operator should not experience noticeable delay when:

* Navigating slides
* Changing content
* Previewing
* Sending live
* Clearing output
* Blacking output

Heavy work should happen outside the critical presentation path.

---

# 39. UX Rules

The product should:

* Show only useful information
* Keep live controls accessible
* Make current/next obvious
* Avoid unnecessary modal dialogs
* Avoid unnecessary configuration
* Prefer direct manipulation
* Use consistent terminology
* Maintain predictable interactions

---

# 40. Product Success

Veyrin succeeds when a new operator can understand the basic workflow quickly and an experienced operator can perform a live service without fighting the interface.

The product should feel:

**Fast.**

**Calm.**

**Reliable.**

**Professional.**

**Modern.**

The software should disappear into the workflow rather than becoming the focus of it.
