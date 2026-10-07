import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../../animations/gsap";
import { TOTAL_CHAPTERS } from "../../config/content";
import { useStore } from "../../hooks/useStore";
import { scrollToY } from "../../hooks/useLenis";
import { activeChapter, exploreMode, menuOpen } from "../../state/experience";
import MenuOverlay from "./MenuOverlay";

const pad = (n: number) => String(n).padStart(2, "0");

/** Fixed minimal bar: wordmark · live chapter counter · MENU. */
export default function Navigation() {
  const header = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const chapter = useStore(activeChapter);
  const open = useStore(menuOpen);
  const exploring = useStore(exploreMode);

  // progress hairline + stronger backdrop once past the hero
  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
        header.current?.classList.toggle("is-scrolled", self.scroll() > window.innerHeight * 0.6);
      },
    });
    return () => st.kill();
  });

  // roll the counter digits when the chapter changes
  useEffect(() => {
    if (!counter.current) return;
    gsap.fromTo(counter.current, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" });
  }, [chapter]);

  return (
    <>
      <header
        ref={header}
        className={`group/nav fixed inset-x-0 top-0 z-[70] transition-opacity duration-700 ${exploring ? "pointer-events-none opacity-0" : ""}`}
        inert={exploring}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 to-transparent opacity-40 transition-opacity duration-700 group-[.is-scrolled]/nav:opacity-100" />
        <div className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
          <a
            href="#experience"
            onClick={(e) => {
              e.preventDefault();
              menuOpen.set(false);
              scrollToY(0);
            }}
            className="inline-flex min-h-11 items-center text-[1.05rem] font-semibold tracking-[0.32em]"
            data-cursor="Top"
            aria-label="NOIRÉ — back to the beginning"
          >
            NOIRÉ
          </a>

          <p className="label hidden items-center gap-3 text-ash sm:flex" aria-label={`Chapter ${chapter} of ${TOTAL_CHAPTERS}`}>
            <span className="inline-block overflow-clip">
              <span ref={counter} className="inline-block text-bone tabular-nums">{pad(chapter)}</span>
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-line" />
            <span className="tabular-nums" aria-hidden="true">{pad(TOTAL_CHAPTERS)}</span>
          </p>

          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => menuOpen.set(!open)}
            className="label relative inline-flex min-h-11 min-w-11 items-center justify-end gap-3"
            data-cursor={open ? "Close" : "Open"}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
              <span className={`h-px bg-bone transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px bg-bone transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
        <div className="h-px bg-line/60" aria-hidden="true">
          <div ref={progress} className="h-full origin-left bg-bone/70" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>
      <MenuOverlay returnFocus={() => menuButton.current?.focus()} />
    </>
  );
}
