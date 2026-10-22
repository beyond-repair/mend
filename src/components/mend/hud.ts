/** Accessible names for the image HUD keys (incl. combat Strike / Brace / End turn). Always set as aria-label. */
export const HUD_LABELS = {
  audit: "Audit",
  strike: "Strike",
  talk: "Talk",
  brace: "Brace",
  map: "Map",
  end: "End turn",
  menu: "Menu",
  quests: "Quests",
  pack: "Pack",
  self: "Self",
  lens: "Lens",
} as const;

export type HudKind = keyof typeof HUD_LABELS;

/**
 * Kinds whose JPG already bakes a readable word into the art. Painting a second `.hud-label`
 * on those doubles the caption (hand check on eb7b0f9). Only kinds NOT listed here get a visible span.
 * Combat End's art says "End"; aria-label stays the clearer "End turn".
 */
export const HUD_ART_HAS_WORD: ReadonlySet<HudKind> = new Set([
  "audit",
  "strike",
  "talk",
  "brace",
  "map",
  "end",
  "menu",
  "quests",
  "pack",
  "self",
  "lens",
]);

export function hudShowsCaption(kind: string): boolean {
  return !HUD_ART_HAS_WORD.has(kind as HudKind);
}

/** Menu quit control: returns to the title (same as epilogue). The panel X only closes the menu. */
export const MENU_QUIT_LABEL = "Return to the title";

/**
 * The entries `next` gained over `prev`, oldest first. The game log is newest-first (`addLog` unshifts)
 * and capped, so the new entries are the head of `next` that sits in front of `prev`'s head.
 * One fight step writes several lines at once (a cut, its steam, a foe's cut, a miss); the HUD used to
 * show only `log[0]`, so everything but the last line of a batch was never on screen (H11, H13).
 */
export function freshLines(prev: readonly string[], next: readonly string[]): string[] {
  if (prev === next) return [];
  if (!prev.length) return [...next].reverse();
  const fits = (k: number) => {
    const span = Math.min(prev.length, next.length - k);
    for (let i = 0; i < span; i++) if (next[k + i] !== prev[i]) return false;
    return span > 0;
  };
  // Below the cap the log only grows at the head, so the length gap is the batch size. This also
  // keeps a repeated line ("Not enough action." twice) from reading as nothing new.
  const gap = next.length - prev.length;
  if (gap >= 0 && fits(gap)) return next.slice(0, gap).reverse();
  // At the cap the oldest entries fall off the end: find where prev's head now sits.
  for (let k = 0; k < next.length; k++) if (fits(k)) return next.slice(0, k).reverse();
  return [...next].reverse();
}
