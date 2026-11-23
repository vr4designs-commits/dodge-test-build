/** Navigation copy and targets. Copy is verbatim from Figma. */

/** Desktop nav (1:2061). */
export const NAV_LINKS = [
  { label: "About Us", href: "#challenge" },
  { label: "Solution", href: "#approach" },
  { label: "Case Studies", href: "#latest" },
] as const;

/** Mobile menu (1:1064). Figma says "Solutions" here vs "Solution" on desktop. */
export const MENU_LINKS = [
  { label: "About Us", href: "#challenge" },
  { label: "Solutions", href: "#approach" },
  { label: "Case Studies", href: "#latest" },
] as const;

/** Placeholder targets until real routes exist (flagged in review). */
export const LOGIN_HREF = "#login";
export const PRIMARY_CTA_HREF = "#cta";
