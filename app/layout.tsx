import type { Metadata, Viewport } from "next";
import { SmoothScroll } from "@/app/components/smooth-scroll";
import { Navbar } from "@/app/components/navbar";
import { ebGaramond, uiSans } from "@/app/fonts";
import "./globals.css";

// Copy from the hero (1:598 / 1:599). Favicon: app/icon.svg (the logo mark). Share image:
// app/opengraph-image.jpg (hero landscape). Set NEXT_PUBLIC_SITE_URL on Vercel for absolute OG URLs.
const description = "Our agentic platform cuts support load and lowers SAP TCO—so your COE can focus on progress, not problems.";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Dodge — Smarter IT, Stronger Systems",
  description,
  openGraph: { title: "Dodge — Smarter IT, Stronger Systems", description, type: "website" },
  twitter: { card: "summary_large_image", title: "Dodge — Smarter IT, Stronger Systems", description },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

/**
 * Runs before first paint: arm text reveals only when JS runs and motion is allowed.
 * Failsafe: if the app never boots (window.__appReady unset), un-hide after 4s.
 */
const REVEAL_BOOT = `(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js-reveal');setTimeout(function(){if(!window.__appReady)d.classList.remove('js-reveal')},4000)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${uiSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      </head>
      <body className="min-h-dvh">
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
