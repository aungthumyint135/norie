import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./animations/gsap";
import { playHeroIntro, prepareHero } from "./animations/hero";
import { applyStaticComposition, createSceneTimeline, type Layout } from "./animations/sceneTimeline";
import { createChapterAnimations, createStaticChapters } from "./animations/sections";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import ExperienceSection from "./components/ExperienceSection/MotionSection";
import FinalCTA from "./components/FinalCTA/FinalCTA";
import Hero from "./components/Hero/Hero";
import Loader from "./components/Loader/Loader";
import MaterialSection from "./components/MaterialSection/MaterialSection";
import Navigation from "./components/Navigation/Navigation";
import ExploreOverlay from "./components/ProductScene/ExploreOverlay";
import SceneLayer from "./components/ProductScene/SceneLayer";
import CurveSection from "./components/SectionIntro/CurveSection";
import FormSection from "./components/SectionIntro/FormSection";
import { useLenis } from "./hooks/useLenis";
import { MOBILE_QUERY } from "./hooks/useMediaQuery";
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "./hooks/useReducedMotion";

export default function App() {
  const main = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  useLenis();

  // hide hero type before first paint so the intro can reveal it
  useLayoutEffect(() => {
    if (main.current) prepareHero(main.current.querySelector("#experience")!, prefersReducedMotion());
  }, []);

  // scroll choreography: rebuilt per breakpoint / motion preference by gsap.matchMedia
  useGSAP(
    () => {
      const root = main.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          mobile: MOBILE_QUERY,
          tablet: "(min-width: 768px) and (max-width: 1439px)",
          desktop: "(min-width: 1440px)",
          reduce: REDUCED_MOTION_QUERY,
        },
        (ctx) => {
          const { mobile, tablet, reduce } = ctx.conditions as Record<string, boolean>;
          const layout: Layout = mobile ? "mobile" : tablet ? "tablet" : "desktop";
          if (reduce) {
            applyStaticComposition(layout);
            return createStaticChapters(root);
          }
          const killScene = createSceneTimeline(root, layout);
          const killText = createChapterAnimations(root, { horizontal: !mobile });
          return () => {
            killScene();
            killText();
          };
        }
      );
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: main }
  );

  const onLoaded = useCallback(() => {
    setLoaded(true);
    const hero = main.current?.querySelector<HTMLElement>("#experience");
    if (hero) playHeroIntro(hero, prefersReducedMotion());
    // (no refresh here: the loader only exits after fonts.ready, which already refreshed)
  }, []);

  return (
    <>
      <a
        href="#main"
        className="label sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[110] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-bone focus:px-5 focus:text-ink"
      >
        Skip to content
      </a>
      <SceneLayer />
      <Navigation />
      <main id="main" ref={main} tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <FormSection />
        <CurveSection />
        <MaterialSection />
        <ExperienceSection />
        <FinalCTA />
      </main>
      <ExploreOverlay />
      <CustomCursor />
      {!loaded && <Loader onDone={onLoaded} />}
    </>
  );
}
