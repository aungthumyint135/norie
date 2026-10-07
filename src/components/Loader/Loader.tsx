import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "../../animations/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";


/**
 * Minimal loader. Progress is real, never padded: it waits only for the typefaces the layout needs.
 * The 3D scene loads afterwards (on first interaction) and crossfades in over the still composition,
 * so the experience is never held back by the GPU.
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const done = useRef(false);

  useGSAP(() => {
    const shown = { v: 0 };
    let target = 0;
    const parts = { fonts: false };

    const render = () => {
      if (num.current) num.current.textContent = String(Math.round(shown.v)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown.v / 100})`;
      root.current?.setAttribute("aria-valuenow", String(Math.round(shown.v)));
    };
    const exit = () => {
      if (done.current) return;
      done.current = true;
      gsap
        .timeline({ onComplete: onDone })
        .to(shown, { v: 100, duration: reduced ? 0 : 0.35, onUpdate: render })
        // transform (compositor-only) rather than clip-path, which repaints the full screen each frame
        .to(root.current, reduced ? { autoAlpha: 0, duration: 0.2 } : { yPercent: -100, duration: 1.1, ease: "expo.inOut" });
    };
    const update = () => {
      target = parts.fonts ? 100 : 35;
      gsap.to(shown, { v: target, duration: 0.5, ease: "power2.out", onUpdate: render, overwrite: true });
      if (parts.fonts) exit();
    };

    document.fonts.ready.then(() => {
      parts.fonts = true;
      update();
    });
    update();
  });

  // Lenis/scroll stays locked while loading
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={root}
      role="progressbar"
      aria-label="Loading experience"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink px-6 py-8 sm:px-10"
    >
      <p className="text-xl font-semibold tracking-[0.32em]">NOIRÉ</p>
      <div>
        <div className="flex items-end justify-between">
          <p className="label text-ash">Loading experience</p>
          <span ref={num} className="font-mono text-[clamp(3rem,10vw,7rem)] leading-none tabular-nums tracking-tight" aria-hidden="true">
            000
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-line">
          <div ref={bar} className="h-full origin-left bg-bone" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
