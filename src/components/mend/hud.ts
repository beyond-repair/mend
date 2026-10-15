/** Visible + accessible names for the image HUD keys (incl. combat Strike / Brace / End turn). */
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

/** Menu quit control: returns to the title (same as epilogue). The panel X only closes the menu. */
export const MENU_QUIT_LABEL = "Return to the title";
