/**
 * Presentation domain types.
 *
 * These types describe the visual presentation state — separate from
 * the content being displayed. See spec §14 for the Content/Layout/Background
 * separation model.
 */

// ─── Layouts ─────────────────────────────────────────────────────────────────

export type LayoutId =
  | 'full-screen'
  | 'lower-third'
  | 'caption'
  | 'corner'
  | 'overlay'
  | 'custom';

export interface Layout {
  id: LayoutId | string;
  name: string;
  description?: string;
  /** CSS class(es) applied to the presentation canvas for this layout */
  canvasClass: string;
}

// ─── Backgrounds ─────────────────────────────────────────────────────────────

export type BackgroundType = 'color' | 'gradient' | 'image' | 'video' | 'none';

export interface Background {
  id: string;
  type: BackgroundType;
  name: string;
  /** CSS value for color/gradient types */
  value?: string;
  /** Media asset ID for image/video types */
  mediaId?: string;
}

// ─── Slides ──────────────────────────────────────────────────────────────────

export interface PresentationSlide {
  id: string;
  /** Plain text content for the slide */
  text: string;
  /** Secondary text, e.g. scripture reference below the verse */
  subtext?: string;
  layout: LayoutId | string;
  background: Background;
}

// ─── Output State ────────────────────────────────────────────────────────────

export type OutputStatus = 'live' | 'black' | 'clear' | 'frozen';

export interface OutputState {
  status: OutputStatus;
  /** The slide currently shown to the audience */
  liveSlide: PresentationSlide | null;
  /** Pre-rendered next slide for preview */
  nextSlide: PresentationSlide | null;
  /** Active layout override (overrides the slide's own layout) */
  layoutOverride: LayoutId | null;
  /** Active background override */
  backgroundOverride: Background | null;
}

// ─── Presentation Scene ──────────────────────────────────────────────────────

/**
 * A PresentationScene is the resolved combination of Content + Layout +
 * Background that the presentation engine renders. It should never be
 * constructed directly by UI components — use the presentation action system.
 */
export interface PresentationScene {
  slide: PresentationSlide;
  layout: Layout;
  background: Background;
}
