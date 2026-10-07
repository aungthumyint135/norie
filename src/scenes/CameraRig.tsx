import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { exploreMode } from "../state/experience";
import { smooth, stepSmooth } from "./smooth";

/**
 * Drives the camera from the damped scroll rig, plus a small pointer parallax.
 * Runs first each frame (priority -1) so every other component reads fresh `smooth` values.
 * In explore mode it steps aside and OrbitControls take over.
 */
export default function CameraRig({ parallax }: { parallax: boolean }) {
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const look = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const handoff = useRef({ wasExploring: false, t: 1, from: new THREE.Vector3() });

  useEffect(() => {
    if (!parallax) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [parallax]);

  useFrame((state, rawDt) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const dt = Math.min(rawDt, 1 / 20); // avoid jumps after a hidden tab resumes
    stepSmooth(dt);
    const exploring = exploreMode.get();
    const h = handoff.current;
    if (exploring) {
      h.wasExploring = true;
      return;
    }
    if (h.wasExploring) {
      // just left explore mode: ease from wherever the user left the camera back to the scroll pose
      h.wasExploring = false;
      h.t = 0;
      h.from.copy(camera.position);
    }

    const p = pointer.current;
    p.sx = THREE.MathUtils.damp(p.sx, p.x, 2.5, dt);
    p.sy = THREE.MathUtils.damp(p.sy, p.y, 2.5, dt);
    // parallax shrinks when the camera is close (macro shots stay steady)
    const reach = THREE.MathUtils.clamp((smooth.camZ - 1.2) / 5, 0.15, 1);

    desired.current.set(smooth.camX + p.sx * 0.28 * reach, smooth.camY - p.sy * 0.16 * reach, smooth.camZ);
    if (h.t < 1) {
      h.t = Math.min(1, h.t + dt / 1.4);
      const e = h.t < 0.5 ? 4 * h.t ** 3 : 1 - (-2 * h.t + 2) ** 3 / 2;
      camera.position.lerpVectors(h.from, desired.current, e);
    } else {
      camera.position.copy(desired.current);
    }
    look.current.set(smooth.lookX, smooth.lookY, smooth.lookZ);
    camera.lookAt(look.current);
    if (Math.abs(camera.fov - smooth.fov) > 0.01) {
      camera.fov = smooth.fov;
      camera.updateProjectionMatrix();
    }
  }, -1);

  return null;
}
