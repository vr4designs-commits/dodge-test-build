import { EB_Garamond, Figtree } from "next/font/google";

/** Serif for headings and quotes — Figma text styles H1–H5. */
export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-eb-garamond",
  display: "swap",
});

/**
 * TEMPORARY stand-in for Gilmer (Figma UI/body font, trial licence in the file).
 * Swap for next/font/local with the licensed Gilmer files; only --font-ui changes.
 */
export const uiSans = Figtree({
  subsets: ["latin"],
  // 500: panel numbers (Gilmer Medium). 700: labels/titles (Gilmer Bold).
  weight: ["400", "500", "700"],
  variable: "--font-ui",
  display: "swap",
});
