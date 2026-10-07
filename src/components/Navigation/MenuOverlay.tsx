import { useEffect, useRef } from "react";
import { useGSAP } from "../../animations/gsap";
import { createMenuTimeline } from "../../animations/navigation";
import { copy, menuLinks, type ChapterId } from "../../config/content";
import { chapterRestY } from "../../animations/sections";
import { getLenis, scrollToY } from "../../hooks/useLenis";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStore } from "../../hooks/useStore";
import { menuOpen } from "../../state/experience";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Fullscreen navigation. Esc closes; Tab is kept inside the menu (plus its toggle);
 * the rest of the page is inert while open; focus returns to MENU on close.
 */
export default function MenuOverlay({ returnFocus }: { returnFocus: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const open = useStore(menuOpen);
  const reduced = useReducedMotion();
  const tl = useRef<gsap.core.Timeline | null>(null);
  const wasOpen = useRef(false);
  // Destination chosen in the menu; scrolled to only after Lenis restarts (start() cancels in-flight scrolls).
  const pending = useRef<ChapterId | null>(null);

  useGSAP(() => {
    if (!panel.current) return;
    tl.current = createMenuTimeline(panel.current, reduced);
    tl.current.eventCallback("onReverseComplete", () => {
      if (panel.current) panel.current.style.visibility = "hidden";
    });
  }, { dependencies: [reduced] });

  useEffect(() => {
    const t = tl.current;
    const main = document.getElementById("main");
    if (open) {
      wasOpen.current = true;
      getLenis()?.stop();
      if (main) main.inert = true;
      t?.timeScale(1).play();
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("a")?.focus());
    } else if (wasOpen.current) {
      wasOpen.current = false;
      getLenis()?.start();
      if (main) main.inert = false;
      t?.timeScale(1.6).reverse();
      returnFocus();
      if (pending.current) {
        scrollToY(chapterRestY(pending.current));
        pending.current = null;
      }
    }
  }, [open, returnFocus]);

  // Esc + focus containment (the MENU/CLOSE toggle in the header stays reachable)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        menuOpen.set(false);
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const toggle = document.querySelector<HTMLElement>('[aria-controls="site-menu"]');
      const items = [...(toggle ? [toggle] : []), ...panel.current.querySelectorAll<HTMLElement>("a, button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={panel}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      className="fixed inset-0 z-[60] flex flex-col justify-between bg-charcoal px-5 pb-8 pt-28 sm:px-10 sm:pb-10"
      style={{ visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" }}
    >
      <nav aria-label="Chapters">
        <ol className="flex flex-col gap-1 sm:gap-2">
          {menuLinks.map((l, i) => (
            <li key={l.id} className="line-mask">
              <a
                href={`#${l.id}`}
                data-menu-link
                data-cursor="Go"
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  pending.current = l.id;
                  menuOpen.set(false);
                }}
                className="group flex min-h-12 items-baseline gap-4 sm:gap-8"
              >
                <span className="label w-8 text-ash">{pad(i + 1)}</span>
                <span className="text-[clamp(2.8rem,8vw,7rem)] font-semibold uppercase leading-[0.95] tracking-[-0.05em] text-bone/85 transition-[color,letter-spacing] duration-500 group-hover:text-bone group-hover:tracking-[-0.035em] group-focus-visible:text-bone">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <a
          data-menu-meta
          href={`mailto:${copy.contact.email}`}
          tabIndex={open ? 0 : -1}
          data-cursor="Write"
          className="label inline-flex min-h-11 items-center text-bone underline decoration-line underline-offset-8 hover:decoration-bone"
        >
          {copy.contact.email}
        </a>
        <p data-menu-meta className="label text-ash">Object 01 · Graphite / Champagne</p>
      </div>
    </div>
  );
}
