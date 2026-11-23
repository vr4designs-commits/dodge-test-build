"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSmoothScroll } from "@/app/components/smooth-scroll";
import { NAV, UI } from "@/app/lib/motion";
import { LOGIN_HREF, MENU_LINKS, PRIMARY_CTA_HREF as DEMO_HREF } from "@/app/lib/site";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (target: string) => void;
};

/** Full-screen mobile menu (1:1060). */
export function MobileMenu({ open, onClose, onNavigate }: MobileMenuProps) {
  const { stop, start } = useSmoothScroll();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  // Lock scroll while open (Lenis + native) and move focus into the dialog.
  useEffect(() => {
    if (!open) return;
    stop();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      root.style.overflow = prev;
      start();
    };
  }, [open, stop, start]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#") || !document.querySelector(href)) {
      onClose();
      return;
    }
    e.preventDefault();
    onClose();
    // Wait a frame so the scroll lock is released before scrolling.
    requestAnimationFrame(() => onNavigate(href));
  };

  const item = (i: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: NAV.menu.itemRise },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: NAV.menu.itemDur,
            ease: UI.ease,
            delay: NAV.menu.itemDelay + i * NAV.menu.itemStagger,
          },
        };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={onKeyDown}
          data-lenis-prevent
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain bg-primary-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : NAV.menu.overlayDur, ease: UI.ease }}
        >
          {/* Top bar (1191:12331) */}
          <div className="flex h-(--nav-h) shrink-0 items-center justify-between border-b border-grey-2 px-8">
            <Image src="/icons/logo-dark.svg" alt="Hodge" width={112} height={29} />
            <div className="flex items-center gap-4">
              <a href={LOGIN_HREF} onClick={onClose} aria-label="Login" className="-m-2.5 grid size-11 place-items-center">
                <span className="grid size-6 place-items-center rounded-icon bg-grey-1">
                  <Image src="/icons/user.svg" alt="" width={13} height={16.4283} />
                </span>
              </a>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="relative -m-2.5 grid size-11 place-items-center"
              >
                <span className="grid size-6 place-items-center rounded-icon bg-grey-1">
                  <Image src="/icons/close.svg" alt="" width={13} height={13} />
                </span>
              </button>
            </div>
          </div>

          {/* Links (1:1064): 25px, 32px apart. Each link padded to a 44px+ target; gap reduced to match. */}
          <ul className="mt-9.75 flex flex-col gap-5 pr-8 pl-8.5 text-menu text-black">
            {MENU_LINKS.map((link, i) => (
              <motion.li key={link.href} {...item(i)}>
                <a href={link.href} onClick={go(link.href)} className="block py-1.5">
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Book A Demo (1:1062): 134px above the frame bottom */}
          <motion.div className="mt-auto px-8 pt-8 pb-33.5" {...item(MENU_LINKS.length)}>
            <a
              href={DEMO_HREF}
              onClick={go(DEMO_HREF)}
              className="flex w-full items-center justify-center rounded-button-lg bg-primary-black p-3.25 text-center text-lead text-primary-white"
            >
              Book A Demo
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
