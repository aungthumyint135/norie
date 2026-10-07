import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { smooth } from "./smooth";

const NEUTRAL = new THREE.Color("#f3f0ea");
const WARM = new THREE.Color("#ffd2a1");

/**
 * Studio lighting:
 * - Environment built from light-formers (softbox key, rim strips, low fill) → soft reflections,
 *   rendered once (frames=1), no HDR download.
 * - Key (spot), rim (directional from behind) and fill (hemisphere) follow the scroll rig.
 */
export default function Lighting({ shadows }: { shadows: boolean }) {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);

  useFrame(() => {
    if (key.current) {
      key.current.intensity = smooth.key * 18;
      key.current.color.copy(NEUTRAL).lerp(WARM, smooth.warmth);
      key.current.target.position.set(smooth.objX, smooth.objY, smooth.objZ);
      key.current.target.updateMatrixWorld();
    }
    if (rim.current) rim.current.intensity = smooth.rim * 1.6;
    if (fill.current) fill.current.intensity = smooth.fill;
  });

  return (
    <>
      <Environment resolution={256} frames={1}>
        {/* large overhead softbox */}
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
        {/* vertical strip boxes = long specular highlights along the curves */}
        <Lightformer form="rect" intensity={3} color="#f6efe4" position={[-4, 1, 1]} rotation-y={Math.PI / 2} scale={[0.6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#e9e2d6" position={[4, 0.5, -1]} rotation-y={-Math.PI / 2} scale={[0.4, 6, 1]} />
        {/* warm kicker from behind */}
        <Lightformer form="ring" intensity={1.2} color="#cbb68f" position={[1.5, 2, -5]} scale={2.5} />
      </Environment>

      <hemisphereLight ref={fill} args={["#d8d4cc", "#050505", 0.4]} />
      <spotLight
        ref={key}
        position={[3.2, 4.4, 3.6]}
        angle={0.42}
        penumbra={0.9}
        distance={20}
        decay={1.6}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight ref={rim} position={[-4, 2.5, -4]} color="#e8e1d4" />
    </>
  );
}
