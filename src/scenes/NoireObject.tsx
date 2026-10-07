import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bodyProfile, capProfile, createSatinRoughness } from "./materials";
import { smooth } from "./smooth";

type Props = { lowPower: boolean; reducedMotion: boolean };

const CHAMPAGNE = "#cbb68f";

/**
 * "Object 01": a turned graphite vessel with a polished champagne collar, a separate dark cap and
 * a halo ring. Four parts, all procedural: body + cap are lathes, collar + halo are tori.
 * Scroll (via `smooth`) lifts the cap and opens the halo for the second composition in chapter 05.
 */
export default function NoireObject({ lowPower, reducedMotion }: Props) {
  const root = useRef<THREE.Group>(null);
  const cap = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const spin = useRef(0);
  const tmp = useMemo(
    () => ({ rest: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), face: new THREE.Quaternion(), tilt: new THREE.Quaternion(), spin: new THREE.Quaternion(), m: new THREE.Matrix4(), cam: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1), x: new THREE.Vector3(1, 0, 0) }),
    []
  );

  const radial = lowPower ? 48 : 96;
  const { bodyGeo, capGeo, roughness } = useMemo(
    () => ({
      bodyGeo: new THREE.LatheGeometry(bodyProfile(lowPower ? 40 : 72), radial),
      capGeo: new THREE.LatheGeometry(capProfile(lowPower ? 24 : 40), radial),
      roughness: createSatinRoughness(lowPower ? 256 : 512),
    }),
    [lowPower, radial]
  );
  useEffect(
    () => () => {
      bodyGeo.dispose();
      capGeo.dispose();
      roughness.dispose();
    },
    [bodyGeo, capGeo, roughness]
  );

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const idle = reducedMotion ? 0 : 1;
    spin.current += dt * 0.06 * idle;

    g.position.set(smooth.objX, smooth.objY + Math.sin(t * 0.6) * 0.035 * idle, smooth.objZ);
    g.rotation.set(smooth.objRotX, smooth.objRotY + spin.current, smooth.objRotZ);
    g.scale.setScalar(smooth.objScale);

    const lift = smooth.capLift;
    if (cap.current) {
      cap.current.position.y = 0.66 + lift * 0.95;
      cap.current.rotation.set(lift * 0.32, lift * 1.1, lift * -0.12);
    }
    const open = smooth.ringOpen;
    const h = halo.current;
    if (h) {
      h.scale.setScalar(1 + open * 0.75);
      h.position.y = -0.55 + open * 0.5;
      // As it opens, the ring turns to face the camera (tilted 25°) so it always reads as a ring,
      // never an edge-on line, wherever the camera has swung to. Then it spins in its own plane.
      tmp.cam.copy(state.camera.position);
      g.worldToLocal(tmp.cam);
      tmp.m.lookAt(tmp.cam, h.position, tmp.up);
      tmp.face.setFromRotationMatrix(tmp.m).multiply(tmp.tilt.setFromAxisAngle(tmp.x, 0.45));
      h.quaternion.slerpQuaternions(tmp.rest, tmp.face, Math.min(1, open * 0.9));
      h.quaternion.multiply(tmp.spin.setFromAxisAngle(tmp.z, t * 0.35 * open * idle));
    }
  });

  return (
    <group ref={root}>
      {/* body: graphite alloy, turned satin finish */}
      <mesh geometry={bodyGeo} castShadow={!lowPower}>
        <meshPhysicalMaterial
          color="#55555b"
          metalness={0.96}
          roughness={0.62}
          roughnessMap={roughness}
          clearcoat={0.2}
          clearcoatRoughness={0.35}
          envMapIntensity={1.45}
        />
      </mesh>

      {/* polished champagne collar + fine groove + hairline seam */}
      <mesh position-y={0.635} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.44, 0.026, 24, radial]} />
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={1} roughness={0.14} clearcoat={0.6} envMapIntensity={1.4} />
      </mesh>
      <mesh position-y={0.4} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.585, 0.005, 8, radial]} />
        <meshStandardMaterial color="#0d0d0f" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position-y={0.665} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.445, 0.0032, 8, radial]} />
        <meshStandardMaterial color="#f2e7d2" emissive="#f2e7d2" emissiveIntensity={0.35} />
      </mesh>

      {/* cap: polished black dome on a magnetic seat */}
      <group ref={cap} position-y={0.66}>
        <mesh geometry={capGeo} castShadow={!lowPower}>
          <meshPhysicalMaterial color="#0f0f11" metalness={1} roughness={0.09} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.3} />
        </mesh>
        <mesh position-y={0.275}>
          <sphereGeometry args={[0.03, 16, 12]} />
          <meshPhysicalMaterial color={CHAMPAGNE} metalness={1} roughness={0.12} />
        </mesh>
      </group>

      {/* halo ring */}
      <mesh ref={halo} position-y={-0.55} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.83, 0.01, 12, lowPower ? 96 : 160]} />
        <meshPhysicalMaterial color={CHAMPAGNE} metalness={1} roughness={0.18} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
}
