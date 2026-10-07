import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useStore } from "../hooks/useStore";
import { exploreApi, exploreMode } from "../state/experience";
import { smooth } from "./smooth";

/** Free orbit around the object in "Enter the experience" mode. */
export default function ExploreControls() {
  const active = useStore(exploreMode);
  const camera = useThree((s) => s.camera);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!active) return;
    target.current.set(smooth.objX, smooth.objY + 0.1, smooth.objZ);
    controls.current?.target.copy(target.current);
    controls.current?.update();

    const offset = new THREE.Vector3();
    exploreApi.rotate = (dir) => {
      offset.copy(camera.position).sub(target.current).applyAxisAngle(new THREE.Vector3(0, 1, 0), (dir * Math.PI) / 8);
      camera.position.copy(target.current).add(offset);
      controls.current?.update();
    };
    exploreApi.zoom = (dir) => {
      offset.copy(camera.position).sub(target.current);
      const len = THREE.MathUtils.clamp(offset.length() * (dir > 0 ? 0.85 : 1.18), 2.2, 9);
      camera.position.copy(target.current).add(offset.setLength(len));
      controls.current?.update();
    };
    return () => {
      exploreApi.rotate = () => {};
      exploreApi.zoom = () => {};
    };
  }, [active, camera]);

  if (!active) return null;
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.55}
      minDistance={2.2}
      maxDistance={9}
      minPolarAngle={Math.PI * 0.18}
      maxPolarAngle={Math.PI * 0.62}
    />
  );
}
