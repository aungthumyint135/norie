import { useEffect, useRef, useState } from "react";
import { gsap } from "../../animations/gsap";
import { getLenis } from "../../hooks/useLenis";
import { useStore } from "../../hooks/useStore";
import { useWebGL } from "../../hooks/useWebGL";
import { exploreApi, exploreMode, sceneReady } from "../../state/experience";

type Cmd = { label: string; run: () => void; glyph: string };

/**
 * "Enter the experience": page UI fades away and the visitor orbits the object freely.
 * Drag / wheel / pinch on the scene, or use the buttons (keyboard + switch access). Esc exits.
 */
export default function ExploreOverlay() {
  const active = useStore(exploreMode);
  const ready = useStore(sceneReady);
  const webgl = useWebGL();
  const root = useRef<HTMLDivElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [announce, setAnnounce] = useState("");
  const interactive = webgl && ready;

  useEffect(() => {
    const main = document.getElementById("main");
    if (!active) return;
    opener.current = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    if (main) main.inert = true;
    gsap.to(main, { autoAlpha: 0, duration: 0.8, ease: "power2.out" });
    // opacity only (not autoAlpha): the dialog must stay visible to receive focus immediately
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 });
    requestAnimationFrame(() => exit.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exploreMode.set(false);
      if (!interactive) return;
      if (e.key === "ArrowLeft") exploreApi.rotate(-1);
      if (e.key === "ArrowRight") exploreApi.rotate(1);
      if (e.key === "+" || e.key === "=") exploreApi.zoom(1);
      if (e.key === "-") exploreApi.zoom(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      getLenis()?.start();
      if (main) main.inert = false;
      gsap.to(main, { autoAlpha: 1, duration: 0.9, delay: 0.4, ease: "power2.out" });
      opener.current?.focus();
    };
  }, [active, interactive]);

  if (!active) return null;

  const commands: Cmd[] = [
    { label: "Rotate left", glyph: "←", run: () => (exploreApi.rotate(-1), setAnnounce("Rotated left")) },
    { label: "Rotate right", glyph: "→", run: () => (exploreApi.rotate(1), setAnnounce("Rotated right")) },
    { label: "Zoom in", glyph: "+", run: () => (exploreApi.zoom(1), setAnnounce("Zoomed in")) },
    { label: "Zoom out", glyph: "−", run: () => (exploreApi.zoom(-1), setAnnounce("Zoomed out")) },
  ];

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-title"
      aria-describedby="explore-help"
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-5 opacity-0 sm:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 id="explore-title" className="text-[1.05rem] font-semibold tracking-[0.32em]">NOIRÉ · Object 01</h2>
          <p id="explore-help" className="label mt-3 max-w-xs text-ash">
            {interactive
              ? "Drag to orbit · scroll or pinch to zoom · arrow keys rotate"
              : "This view needs WebGL, which isn't available here. The still composition is shown instead."}
          </p>
        </div>
        <button
          ref={exit}
          type="button"
          onClick={() => exploreMode.set(false)}
          data-cursor="Close"
          className="label pointer-events-auto inline-flex min-h-11 items-center gap-3 rounded-full border border-bone/35 px-5 hover:border-bone"
        >
          Exit <span aria-hidden="true" className="text-ash">Esc</span>
        </button>
      </div>
      {interactive && (
        <div className="flex justify-center gap-2" role="group" aria-label="Object controls">
          {commands.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.run}
              aria-label={c.label}
              title={c.label}
              data-cursor={c.label.split(" ")[0]}
              className="pointer-events-auto grid size-12 place-items-center rounded-full border border-bone/25 bg-ink/40 font-mono text-lg backdrop-blur-sm hover:border-bone"
            >
              <span aria-hidden="true">{c.glyph}</span>
            </button>
          ))}
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </div>
  );
}
