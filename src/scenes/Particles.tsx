import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { smooth } from "./smooth";

/**
 * Two GPU-animated point clouds (no per-particle CPU work):
 * - dust: tiny motes drifting upward through the light
 * - bokeh: a few large, very faint discs near the lens that fake shallow depth of field
 * The CPU only advances one phase uniform per frame.
 */
const shader = {
  vertexShader: /* glsl */ `
    uniform float uPhase; uniform float uPixelRatio; uniform float uSize; uniform float uHeight;
    attribute float aSeed;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      p.y = mod(p.y + uPhase * (0.25 + aSeed * 0.35) + uHeight * 0.5, uHeight) - uHeight * 0.5;
      p.x += sin(uPhase * 0.6 + aSeed * 40.0) * 0.25;
      p.z += cos(uPhase * 0.5 + aSeed * 23.0) * 0.2;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (0.6 + aSeed) * uPixelRatio / -mv.z;
      // fade out at the vertical wrap and with distance
      float wrap = smoothstep(0.0, 0.8, uHeight * 0.5 - abs(p.y));
      vAlpha = wrap * clamp(1.2 - (-mv.z) / 18.0, 0.0, 1.0) * (0.35 + aSeed * 0.65);
    }`,
  fragmentShader: /* glsl */ `
    uniform float uOpacity; uniform float uRing;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float disc = smoothstep(0.5, 0.15, d);
      float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.3, 0.45, d);
      float a = mix(disc, disc * 0.55 + ring * 0.6, uRing);
      gl_FragColor = vec4(vec3(1.0, 0.95, 0.88), a * vAlpha * uOpacity);
    }`,
};

function makeCloud(count: number, box: [number, number, number], zRange: [number, number], seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * box[0];
    pos[i * 3 + 1] = (rand() - 0.5) * box[1];
    pos[i * 3 + 2] = zRange[0] + rand() * (zRange[1] - zRange[0]);
    seeds[i] = rand();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return g;
}

export default function Particles({ lowPower, reducedMotion }: { lowPower: boolean; reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const phase = useRef(0);
  const dust = useRef<THREE.ShaderMaterial>(null);
  const bokeh = useRef<THREE.ShaderMaterial>(null);

  const { dustGeo, bokehGeo } = useMemo(
    () => ({
      // reduced-motion and low-power devices get far fewer motes
      dustGeo: makeCloud(lowPower ? 220 : reducedMotion ? 360 : 700, [12, 7, 0], [-5, 3], 11),
      bokehGeo: makeCloud(lowPower ? 8 : 26, [7, 5, 0], [2.2, 4.6], 29),
    }),
    [lowPower, reducedMotion]
  );
  useEffect(() => () => {
    dustGeo.dispose();
    bokehGeo.dispose();
  }, [dustGeo, bokehGeo]);

  const uniforms = useMemo(
    () => ({
      dust: { uPhase: { value: 0 }, uPixelRatio: { value: dpr }, uSize: { value: 26 }, uHeight: { value: 7 }, uOpacity: { value: 0.55 }, uRing: { value: 0 } },
      bokeh: { uPhase: { value: 0 }, uPixelRatio: { value: dpr }, uSize: { value: 380 }, uHeight: { value: 5 }, uOpacity: { value: 0.07 }, uRing: { value: 0.3 } },
    }),
    [dpr]
  );

  useFrame((_, dt) => {
    if (!reducedMotion) phase.current += dt * smooth.dust;
    if (dust.current) dust.current.uniforms.uPhase.value = phase.current;
    if (bokeh.current) bokeh.current.uniforms.uPhase.value = phase.current * 0.4;
  });

  return (
    <>
      <points geometry={dustGeo} frustumCulled={false}>
        <shaderMaterial ref={dust} args={[{ ...shader, uniforms: uniforms.dust }]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={bokehGeo} frustumCulled={false}>
        <shaderMaterial ref={bokeh} args={[{ ...shader, uniforms: uniforms.bokeh }]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}
