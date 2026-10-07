import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { useIsMobile, useFinePointer } from "../../hooks/useMediaQuery";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useStore } from "../../hooks/useStore";
import { isLowPowerDevice, useWebGL } from "../../hooks/useWebGL";
import { exploreMode, sceneReady } from "../../state/experience";
import StaticFallback from "./StaticFallback";

// three.js + R3F live in their own chunks and load after the page shell has painted.
const ProductScene = lazy(() => import("../../scenes/ProductScene"));

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.warn("[NOIRÉ] 3D scene unavailable, showing static composition:", error.message);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Not "scroll": ScrollTrigger refreshes fire synthetic scroll events. Real scrolling always begins
// with one of these (wheel, touch, keys, scrollbar pointerdown).
const INTERACTION_EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown"] as const;
const FALLBACK_START_MS = 6500;

/**
 * True after the visitor's first interaction (or FALLBACK_START_MS after load), then once the main
 * thread is idle. Parsing three.js and compiling shaders never competes with first paint or input;
 * the still composition holds the frame until the live scene crossfades in.
 */
function useDeferredSceneStart(): boolean {
  const [go, setGo] = useState(false);
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const hasIdle = typeof window.requestIdleCallback === "function"; // Safari: no rIC
    const fire = () => {
      cleanup();
      if (hasIdle) idle = window.requestIdleCallback(() => setGo(true), { timeout: 500 });
      else setGo(true);
    };
    const cleanup = () => {
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, fire));
      window.removeEventListener("load", arm);
      window.clearTimeout(timer);
    };
    const arm = () => (timer = window.setTimeout(fire, FALLBACK_START_MS));
    INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, fire, { once: true, passive: true }));
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      cleanup();
      if (hasIdle) window.cancelIdleCallback(idle);
    };
  }, []);
  return go;
}

/** Fixed full-viewport stage behind all content: the live scene, or a still fallback. */
export default function SceneLayer() {
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const fine = useFinePointer();
  const ready = useStore(sceneReady);
  const exploring = useStore(exploreMode);
  const [failed, setFailed] = useState(false);
  const [lowPower] = useState(() => mobile || isLowPowerDevice());
  const start = useDeferredSceneStart();

  if (!webgl || failed) return <StaticFallback />;

  return (
    <div className={`fixed inset-0 ${exploring ? "z-30 cursor-grab active:cursor-grabbing" : "pointer-events-none"}`} aria-hidden={!exploring}>
      {/* the still composition holds the frame until the live scene has compiled and drawn */}
      <div className="absolute inset-0 transition-opacity duration-[1600ms] ease-out" style={{ opacity: ready ? 0 : 1 }}>
        <StaticFallback />
      </div>
      <div className="absolute inset-0 transition-opacity duration-[1600ms] ease-out" style={{ opacity: ready ? 1 : 0 }}>
        {start && (
          <SceneBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <ProductScene lowPower={lowPower} reducedMotion={reduced} parallax={fine && !reduced} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      {/* cinematic vignette + top/bottom falloff for legible type */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(10_10_11/0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
    </div>
  );
}
