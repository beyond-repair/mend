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
