import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { rig, sceneReady } from "../state/experience";
import Atmosphere from "./Atmosphere";
import CameraRig from "./CameraRig";
import ExploreControls from "./ExploreControls";
import Lighting from "./Lighting";
import NoireObject from "./NoireObject";
import Particles from "./Particles";
import { snapSmooth } from "./smooth";

type Props = { lowPower: boolean; reducedMotion: boolean; parallax: boolean };

/** Compiles all shaders off the main thread (KHR_parallel_shader_compile), then reports ready after the first real frame. */
function ReadyGate() {
  const { gl, scene, camera } = useThree();
  const compiled = useRef(false);
  const reported = useRef(false);
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .finally(() => alive && (compiled.current = true));
    return () => {
      alive = false;
    };
  }, [gl, scene, camera]);
  useFrame(() => {
    if (compiled.current && !reported.current) {
      reported.current = true;
      requestAnimationFrame(() => sceneReady.set(true));
    }
  });
  return null;
}

/** The single fixed WebGL scene behind the whole page. Lazy-loaded (separate chunk). */
export default function ProductScene({ lowPower, reducedMotion, parallax }: Props) {
  const maxDpr = lowPower ? 1.25 : 1.5;
  const [dpr, setDpr] = useState<number>(maxDpr);
  // Grounding comes from a soft contact-shadow sprite; no shadow-map render pass per frame.
  const shadows = false;

  useEffect(() => {
    snapSmooth(); // start the camera exactly where the scroll position says
    return () => sceneReady.set(false);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      shadows={false}
      camera={{ position: [rig.camX, rig.camY, rig.camZ], fov: rig.fov, near: 0.05, far: 80 }}
      gl={{ antialias: !lowPower, powerPreference: "high-performance", alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden="true"
    >
      {/* drop resolution if frame rate sags; never above the device cap */}
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))} />
      <CameraRig parallax={parallax} />
      <Lighting shadows={shadows} />
      <Atmosphere shadows={shadows} />
      <NoireObject lowPower={lowPower} reducedMotion={reducedMotion} />
      <Particles lowPower={lowPower} reducedMotion={reducedMotion} />
      <ExploreControls />
      <ReadyGate />
    </Canvas>
  );
}
