import { useRef } from "react";
import { gsap, useGSAP } from "../../animations/gsap";
import { useFinePointer } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { exploreMode } from "../../state/experience";

/**
 * Desktop-only cursor: a small dot that trails the pointer and swells into a labelled disc
 * over anything with [data-cursor]. Not rendered for touch, coarse pointers or reduced motion.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!enabled || !root.current || !disc.current) return;
      document.documentElement.classList.add("has-custom-cursor");
      const x = gsap.quickTo(root.current, "x", { duration: 0.45, ease: "power3.out" });
      const y = gsap.quickTo(root.current, "y", { duration: 0.45, ease: "power3.out" });
      let label = "";
      let seen = false; // stay hidden until the first real pointer position (no dot parked at 0,0)

      const setLabel = (next: string) => {
        if (next === label) return;
        label = next;
        if (text.current) text.current.textContent = next;
        gsap.to(disc.current, { scale: next ? 1 : 0.14, duration: 0.6, ease: "expo.out" });
        gsap.to(text.current, { autoAlpha: next ? 1 : 0, duration: next ? 0.4 : 0.15, delay: next ? 0.1 : 0 });
      };

      const move = (e: PointerEvent) => {
        if (!seen) {
          seen = true;
          gsap.set(root.current, { x: e.clientX, y: e.clientY });
          gsap.to(root.current, { autoAlpha: 1, duration: 0.4 });
        }
        x(e.clientX);
        y(e.clientY);
        const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
        setLabel(target?.dataset.cursor ?? (exploreMode.get() ? "Drag" : ""));
      };
      const hide = () => gsap.to(root.current, { autoAlpha: 0, duration: 0.3 });
      const show = () => gsap.to(root.current, { autoAlpha: 1, duration: 0.3 });

      gsap.set(disc.current, { scale: 0.14 });
      gsap.set(root.current, { autoAlpha: 0 });
      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", hide);
      document.documentElement.addEventListener("pointerenter", show);
      return () => {
        document.documentElement.classList.remove("has-custom-cursor");
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", hide);
        document.documentElement.removeEventListener("pointerenter", show);
      };
    },
    { dependencies: [enabled] }
  );

  if (!enabled) return null;
  return (
    <div ref={root} className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference" aria-hidden="true">
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div ref={disc} className="grid size-[5.5rem] place-items-center rounded-full bg-bone">
          <span ref={text} className="label invisible text-[0.65rem] font-medium text-ink opacity-0" />
        </div>
      </div>
    </div>
  );
}
