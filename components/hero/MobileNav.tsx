"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { NavLink } from "@/lib/site";
import styles from "./MobileNav.module.css";

/** Where the header's own links take over (OutrunHero.module.css hides them below 768px). */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * The phone navigation: a menu button in the header that opens the site links as a full-screen
 * title card. It is a disclosure (a button that shows and hides the links), so it keeps its place
 * in the header's tab order. While it is open the page behind it is inert and cannot scroll.
 */
export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    const nav = navRef.current;
    if (!open || !nav) return;

    const close = () => setOpenOn(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      buttonRef.current?.focus();
    };
    // Widening past the breakpoint hides the menu, so close it rather than leave the page locked.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onResize = () => desktop.matches && close();

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    const unlockScroll = lockScroll();
    // The header stays live: the wordmark and the close button sit above the menu.
    const restoreInert = inertOutside(nav.closest("header") ?? nav);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
      restoreInert();
      unlockScroll();
    };
  }, [open]);

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Primary">
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        <span className={styles.bars} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div id={panelId} className={styles.panel} data-open={open} inert={!open}>
        <ol className={styles.list}>
          {links.map((link, i) => (
            <li key={link.href} style={{ "--i": i } as CSSProperties}>
              <Link
                className={styles.link}
                href={link.href}
                aria-current={isCurrentPage(link.href, pathname) ? "page" : undefined}
                onClick={() => setOpenOn(null)}
              >
                <span className={styles.index} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.label}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className={styles.horizon} aria-hidden="true">
          <span className={styles.mark} />
        </div>
      </div>
    </nav>
  );
}

/** A link marks the current page when it points at this path, not at a section of a page. */
function isCurrentPage(href: string, pathname: string) {
  if (href.includes("#")) return false;
  const trim = (path: string) => path.replace(/(.)\/$/, "$1");
  return trim(href) === trim(pathname);
}

/**
 * Holds the page where it is. iOS Safari ignores overflow: hidden on the body, so the body is
 * fixed in place instead, offset by the scroll position. The scrollbar's width becomes padding,
 * so nothing shifts on desktop.
 */
function lockScroll() {
  const { body, documentElement } = document;
  const y = window.scrollY;
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  const previous = body.style.cssText;

  body.style.position = "fixed";
  body.style.top = `${-y}px`;
  body.style.left = "0";
  body.style.right = "0";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

  return () => {
    body.style.cssText = previous;
    // The page scrolls smoothly (globals.css), but it has to be back where it was at once.
    window.scrollTo({ top: y, behavior: "instant" });
  };
}

/**
 * Makes everything outside `keep` inert, so focus and screen readers can't wander behind the
 * menu. Returns the undo. Scripts and Next's own elements (the route announcer) are left alone.
 */
function inertOutside(keep: Element) {
  const changed: HTMLElement[] = [];
  for (let node = keep; node.parentElement && node !== document.body; node = node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      const tag = sibling.localName;
      if (tag.includes("-") || tag === "script" || tag === "style" || tag === "template") continue;
      sibling.inert = true;
      changed.push(sibling);
    }
  }
  return () => changed.forEach((element) => (element.inert = false));
}
