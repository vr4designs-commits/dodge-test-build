"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { useSmoothScroll } from "@/app/components/smooth-scroll";
import { MobileMenu } from "@/app/components/mobile-menu";
import { MQ, NAV, UI } from "@/app/lib/motion";
import { LOGIN_HREF, NAV_LINKS, PRIMARY_CTA_HREF } from "@/app/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Fixed navbar (1:2058 desktop, 1191:12375 mobile).
 * Mobile: transparent with white logo while it sits over the element marked
 * `data-nav-overlay` (the hero image); solid primary-white otherwise.
 * Desktop/tablet: always solid, as in the desktop frame.
 */
export function Navbar() {
  const { scrollTo } = useSmoothScroll();
  // Starts true: on mobile the page loads with the navbar over the hero image (no solid-bar flash).
  // Desktop ignores it (solid via md: overrides). Corrected by the ScrollTrigger below.
  const [overlay, setOverlay] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Scroll position → overlay state (GSAP owns scroll; Motion animates the state change).
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.mobile, () => {
      const target = document.querySelector<HTMLElement>("[data-nav-overlay]");
      if (!target) {
        setOverlay(false);
        return;
      }
      const st = ScrollTrigger.create({
        trigger: target,
        // "top bottom" so it's already active at scroll 0 (the hero sits at the top of the page).
        start: "top bottom",
        end: () => `bottom top+=${document.querySelector("header")?.offsetHeight ?? 0}`,
        onToggle: (self) => setOverlay(self.isActive),
      });
      setOverlay(st.isActive);
      return () => setOverlay(false);
    });
    return () => mm.revert();
  });

  const onNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#") || !document.querySelector(href)) return;
      e.preventDefault();
      scrollTo(href);
    },
    [scrollTo],
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close the mobile menu if the viewport grows past mobile.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia(MQ.mobile);
    const onChange = () => !mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [menuOpen]);

  const fade = { duration: NAV.themeDur, ease: UI.ease };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
        {/* Solid background layer: always on ≥768, fades in on mobile once off the hero. */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-primary-white md:opacity-100!"
          initial={false}
          animate={{ opacity: overlay ? 0 : 1 }}
          transition={fade}
        />
        <nav
          aria-label="Main"
          className="relative flex h-(--nav-h) items-center justify-between pr-[max(--spacing(8),env(safe-area-inset-right))] pl-[max(--spacing(8),env(safe-area-inset-left))]"
        >
          <a
            href="#main"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0);
            }}
            className="-my-2 block py-2"
            aria-label="Hodge home"
          >
            <span className="relative block h-7.25 w-28">
            {/* Dark logo (desktop always; mobile once off the hero) crossfades with the light one. */}
            <motion.span
              className="absolute inset-0 md:opacity-100!"
              initial={false}
              animate={{ opacity: overlay ? 0 : 1 }}
              transition={fade}
            >
              <Image src="/icons/logo-dark.svg" alt="" width={112} height={29} priority />
            </motion.span>
            <motion.span
              className="absolute inset-0 md:hidden"
              initial={false}
              animate={{ opacity: overlay ? 1 : 0 }}
              transition={fade}
            >
              <Image src="/icons/logo-light.svg" alt="" width={112} height={29} priority />
            </motion.span>
            </span>
          </a>

          {/* Desktop / tablet (1:2060) */}
          <div className="hidden w-136.25 items-center justify-between md:flex">
            <ul className="flex w-72.75 items-center justify-between text-body text-primary-black">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => onNavClick(e, link.href)}
                    className="block py-3 whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Image
              src="/icons/nav-divider.svg"
              alt=""
              aria-hidden="true"
              width={34}
              height={1}
              className="w-8.5 rotate-90"
            />
            <div className="flex items-center gap-3">
              <a href={LOGIN_HREF} className="block min-w-11 py-3 text-center text-body whitespace-nowrap">
                Login
              </a>
              <a
                href={PRIMARY_CTA_HREF}
                onClick={(e) => onNavClick(e, PRIMARY_CTA_HREF)}
                className="flex min-w-33.5 items-center justify-center rounded-button bg-primary-black p-3 text-center text-body text-primary-white"
              >
                Button
              </a>
            </div>
          </div>

          {/* Mobile toggle (1191:12377): 24px icon inside a 44px hit area */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="relative -mr-2.5 grid size-11 place-items-center md:hidden"
          >
            <span className="relative grid size-6 place-items-center">
              <motion.span
                className="absolute inset-0 grid place-items-center"
                initial={false}
                animate={{ opacity: overlay ? 1 : 0 }}
                transition={fade}
              >
                <Image src="/icons/menu.svg" alt="" width={13} height={11.5} />
              </motion.span>
              <motion.span
                className="absolute inset-0 grid place-items-center"
                initial={false}
                animate={{ opacity: overlay ? 0 : 1 }}
                transition={fade}
              >
                <Image src="/icons/menu-dark.svg" alt="" width={13} height={11.5} />
              </motion.span>
            </span>
          </button>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} onNavigate={scrollTo} />
    </>
  );
}
