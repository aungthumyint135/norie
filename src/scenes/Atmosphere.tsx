import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createRadialTexture } from "./materials";
import { smooth } from "./smooth";

const INK = new THREE.Color("#0a0a0b");

/** Inside-out sky sphere: near-black with a soft light pool that sits behind the object. */
const backdropShader = {
  uniforms: { uGlow: { value: 1 }, uWarmth: { value: 0.2 } },
  vertexShader: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform float uGlow; uniform float uWarmth;
    varying vec3 vDir;
    void main() {
      vec3 base = vec3(0.039, 0.039, 0.043);
      vec3 neutral = vec3(0.16, 0.155, 0.15);
      vec3 warm = vec3(0.24, 0.19, 0.13);
      float pool = pow(max(dot(vDir, normalize(vec3(0.0, 0.12, -1.0))), 0.0), 7.0);
      float floorFade = smoothstep(-0.45, 0.1, vDir.y);
      vec3 col = base + mix(neutral, warm, uWarmth) * pool * uGlow * floorFade;
      // fine film grain to avoid banding in the dark gradient
      float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      gl_FragColor = vec4(col + (n - 0.5) * 0.012, 1.0);
    }`,
};

/** Additive cone: a volumetric light shaft falling from upper left. */
const shaftShader = {
  uniforms: { uOpacity: { value: 0.05 } },
  vertexShader: /* glsl */ `
    varying float vY; varying vec3 vN; varying vec3 vV;
    void main() {
      vY = uv.y;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uOpacity;
    varying float vY; varying vec3 vN; varying vec3 vV;
    void main() {
      float edge = pow(abs(dot(vN, vV)), 2.0);   // fades toward the silhouette edges
      float along = smoothstep(0.0, 0.6, vY) * smoothstep(1.0, 0.75, vY);
      gl_FragColor = vec4(vec3(1.0, 0.96, 0.9), edge * along * uOpacity);
    }`,
};

export default function Atmosphere({ shadows }: { shadows: boolean }) {
  const get = useThree((s) => s.get);
  const backdrop = useRef<THREE.ShaderMaterial>(null);
  const shaft = useRef<THREE.ShaderMaterial>(null);
  const blob = useRef<THREE.Mesh>(null);
  const blobTex = useMemo(() => createRadialTexture([[0, "rgba(0,0,0,0.75)"], [0.5, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]]), []);
  useEffect(() => {
    const scene = get().scene;
    scene.fog = new THREE.FogExp2(INK, 0.07);
    scene.background = INK;
    return () => {
      scene.fog = null;
      blobTex.dispose();
    };
  }, [get, blobTex]);

  useFrame((state) => {
    if (state.scene.fog instanceof THREE.FogExp2) state.scene.fog.density = smooth.fog;
    if (backdrop.current) {
      backdrop.current.uniforms.uGlow.value = smooth.glow;
      backdrop.current.uniforms.uWarmth.value = smooth.warmth;
    }
    if (shaft.current) shaft.current.uniforms.uOpacity.value = smooth.shaft * 0.06;
    if (blob.current) {
      blob.current.position.set(smooth.objX, -1.27, smooth.objZ);
      const s = 2.1 * smooth.objScale * (1 + smooth.capLift * 0.15);
      blob.current.scale.set(s, s, 1);
    }
  });

  return (
    <>
      <mesh scale={30} renderOrder={-10}>
        <sphereGeometry args={[1, 48, 32]} />
        <shaderMaterial ref={backdrop} args={[backdropShader]} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>

      <mesh position={[-2.2, 3.4, -1.5]} rotation={[0, 0, -0.42]}>
        <cylinderGeometry args={[0.15, 2.4, 9, 32, 1, true]} />
        <shaderMaterial ref={shaft} args={[shaftShader]} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
      </mesh>

      {/* soft contact shadow (always) + a real shadow catcher on capable devices */}
      <mesh ref={blob} rotation-x={-Math.PI / 2} position-y={-1.27} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={blobTex} transparent depthWrite={false} fog={false} />
      </mesh>
      {shadows && (
        <mesh rotation-x={-Math.PI / 2} position-y={-1.28} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.35} />
        </mesh>
      )}
    </>
  );
}
