# NOIRÉ — Designed to Be Experienced

A cinematic, scroll-driven 3D product site for a fictional brand.
**React 19 · TypeScript (strict) · Vite 8 · Tailwind CSS v4 · Three.js · React Three Fiber · drei · GSAP + ScrollTrigger · Lenis.**

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the build
npm run lint       # ESLint (typescript-eslint + react-hooks)
```

## 1. Reference analysis (inspiration only)

The reference (`reference.mp4`, ~14 s, a phone screen recording of a laptop) shows a scroll-scrubbed site for a tea brand:

| Aspect | Observed | Used as… |
|---|---|---|
| Camera | Near-static and centred, with gentle push-ins late in the sequence | → a *real* moving camera: push-in, offset, macro, orbit, then pull-back |
| Object | One hero vessel whose state changes (contents falling in → steeping → pouring) | → one abstract object that separates into a second composition and recomposes |
| Transitions | One continuous scene with no slide-up sections; text swaps over a persistent image | → a single fixed WebGL scene; pinned type that clears before each change |
| Lighting | Warm amber key from upper right, god rays, bokeh, near-black background | → cool-neutral studio, champagne accents, a light shaft, dust, fake-DOF bokeh |
| Typography | Serif sentence case with italic gold accent words, alternating left/right | → massive uppercase grotesk + mono labels, masked character reveals |
| Pacing | About 7 beats of roughly 2 s | → 6 chapters, each with a resting plateau to read |

Nothing was copied from the reference: no brand, copy, assets, product, layout or sequence.

## 2. Art direction

- **Palette:** near-black `#0a0a0b`, charcoal and graphite, warm off-white type `#ece6dc`, and a restrained champagne `#cbb68f` for metal details only.
- **Object 01:** a turned graphite vessel modelled as a lathe:
  - a narrow foot, a full belly, a waist and a shoulder
  - a polished champagne collar with a hairline emissive seam
  - a separate polished-black cap and a halo ring
  - a procedural satin roughness map with turned lines, speckle and hairline scratches
- **Light:** a softbox environment made of light-formers, rendered once, plus a key (spot), rim (directional) and fill (hemisphere) that change per chapter. Atmosphere comes from exponential fog, a sky sphere with a light pool, an additive light shaft, GPU dust and large faint bokeh discs (cheap fake depth of field).
- **Type:** Geist (display, uppercase, −0.05em tracking) and Geist Mono (11–13 px labels, 0.12em tracking). Two families only.

### The six chapters

| # | Chapter | Scene |
|---|---|---|
| 01 | Designed to be experienced. | Object centred and floating; title card along the bottom |
| 02 | Form follows feeling. | Camera approaches, object turns, light warms; FORM / PRECISION / MOTION appear in turn |
| 03 | Every curve has a purpose. | Object slides right; editorial type on the left |
| 04 | Made for the details. | Macro on the collar and seam under raking light, framed by viewfinder marks |
| 05 | Built to move. | Vertical scroll drives a horizontal pan; the object crosses the frame as the camera swings round; the cap lifts; the halo opens and turns to face the camera |
| 06 | Form. Motion. Experience. | Recomposed and backlit. "Enter the experience" opens a free-orbit mode (drag, scroll or pinch, arrow keys or buttons; Esc exits) |

## 3. Architecture

```
src/
  App.tsx                 composition + gsap.matchMedia (desktop / tablet / mobile / reduced motion)
  config/content.ts       all copy + chapter heights
  state/experience.ts     `rig` (scroll-driven scene values) + tiny stores (sceneReady, explore, chapter, menu)
  animations/
    sceneTimeline.ts      one scrubbed GSAP timeline tweening `rig` through per-layout keyframes
    sections.ts           per-chapter type choreography (built in idle slices)
    hero.ts, navigation.ts, gsap.ts
  scenes/                 (lazy chunk) ProductScene, CameraRig, Lighting, Atmosphere, Particles,
                          NoireObject, ExploreControls, materials.ts (procedural textures + profiles), smooth.ts
  components/             Navigation (+ MenuOverlay), CustomCursor, Hero, SectionIntro/*, MaterialSection,
                          ExperienceSection, FinalCTA, Loader, ProductScene/* (SceneLayer, StaticFallback,
                          ExploreOverlay), ui/* (Chapter, SplitText, MagneticButton)
  hooks/                  useLenis, useReducedMotion, useMediaQuery, useWebGL, useStore
```

- **Scroll → scene:**
  - Timeline time is measured in viewport heights. Chapter *i* rests on keyframe *i* while it's pinned, and transitions to *i+1* during the one viewport height where the next chapter scrolls in.
  - GSAP tweens a plain `rig` object. Once per frame (priority −1) the scene damps a copy of it (`smooth`) and reads that. There's no React state in the frame loop.
- **Type:** each chapter is a tall section with a sticky full-viewport panel. Characters rise out of masks, hold, then clear before the panel moves, so content never visibly slides up.
- **Breakpoints:** `gsap.matchMedia` rebuilds everything per layout. Phones get their own keyframes, with the object in the upper half and the type below, smaller moves and no horizontal pan.

## 4. Performance strategy

- **Initial load:** only the app shell (~81 KB gzipped) and GSAP + Lenis (~49 KB gzipped).
- **3D loading:** three.js, R3F and drei sit in a lazily imported chunk (~270 KB gzipped). It starts on the visitor's **first interaction** (pointer, touch, wheel or key), or 6.5 s after load at the latest, then crossfades in over a matching SVG still. That still is generated from the same splines as the 3D lathe.
- **Shaders:** compiled with `renderer.compileAsync` (parallel shader compile where supported) before the scene reports ready.
- **Per-frame cost:**
  - No shadow-map pass; grounding comes from a contact-shadow sprite.
  - The environment is rendered once.
  - Particles are animated entirely on the GPU, with one uniform per frame.
  - DPR is capped at 1.5 on desktop and 1.25 on low-power devices, and `PerformanceMonitor` lowers it further if FPS drops.
  - Rendering pauses in hidden tabs.
- **Main thread:** chapter timelines are built in idle slices, and split characters carry no `will-change`, so ~300 compositor layers are avoided.
- **Layout:** `scrollbar-gutter: stable` prevents a layout shift when the loader unlocks scrolling.

## 5. Accessibility

- **Structure:** a skip link, one `h1`, and an `h2` per chapter. Split headings expose the full sentence through `aria-label`, with the character spans `aria-hidden`.
- **Menu:** a full-screen dialog. Esc closes it, Tab stays inside it (plus its toggle), the page behind is `inert`, and focus returns to MENU.
- **Explore mode:** a dialog with keyboard and button alternatives to dragging. Focus starts on Exit and Esc exits.
- **Legibility:** soft scrims behind copy keep text contrast independent of the 3D scene. Touch targets are 44 px or more.
- **Custom cursor:** desktop only (fine pointer, hover-capable) and off under reduced motion.
- **`prefers-reduced-motion`:**
  - no Lenis and no scroll-driven camera (one stable composition)
  - type is static and visible
  - no idle rotation or particle drift
  - instant menu
- **No WebGL / scene error:** the same still composition; explore mode explains why it's unavailable.

## 6. Verification (production build, 2026-10-07)

| Check | Result |
|---|---|
| `npm run build` / `tsc -b` / `eslint .` | ✅ pass, 0 errors |
| Console | ✅ no errors or warnings (desktop, mobile, reduced motion, no WebGL) |
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice) | ✅ 0 violations in each chapter's resting state and with the menu open |
| Keyboard | ✅ Skip link is the first stop; menu opens and traps focus (Esc closes and returns focus); menu links glide to the chapter; explore dialog takes focus and Esc exits |
| Mobile (390 / 320 px) | ✅ Phone composition, no horizontal overflow, menu works by tap, touch targets ≥ 44 px |
| Reduced motion | ✅ No cursor, no Lenis, static readable type |
| WebGL disabled | ✅ Still composition, no canvas, explore mode explains |
| Lighthouse, desktop (real GPU) | **Performance 100**, Accessibility 100, Best Practices 100, SEO 100 (LCP 0.6 s, TBT 40 ms, CLS 0.004) |
| Lighthouse, mobile (real GPU, 4× CPU throttle), 3 runs | **Performance 86 / 94 / 93 (median 93)**, Accessibility 100, Best Practices 100, SEO 100 (LCP 2.5 s) |
| Desktop when the 3D loads during the test | Performance 87 (TBT 280 ms): what a visitor who moves the mouse immediately would see |

### Known limitations

- **Lighthouse measures the initial load.** It never interacts, so the 3D chunk doesn't load during its run. The interaction-gated load is deliberate (per the brief: "lazy-load heavy 3D", "render quickly before the 3D scene is ready"), but those scores don't include the WebGL cost. With software WebGL (no GPU), continuous rendering is CPU-bound and any always-animating WebGL page scores poorly.
- **Mobile Performance varies by run** (86–94 across three runs) around the 90 target.
- **Browser coverage:** testing was automated in Chrome only. Safari, Firefox and real iOS/Android devices still need a manual pass, as does a screen-reader walkthrough.
- **Depth of field is faked** with bokeh sprites rather than a post-processing pass, by choice for performance.
- **The canonical URL and OG image URLs use `https://noire.example.com/`**; set them to the real domain before deploying.
