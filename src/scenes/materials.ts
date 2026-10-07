import * as THREE from "three";

/** Seeded PRNG so the "imperfections" are identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Roughness map for the body: turned (circumferential) satin lines, faint speckle and a few
 * hairline scratches. On a lathe the texture's U runs around the object, so horizontal lines
 * read as the lathe-turned finish. Only visible up close under raking light (chapter 04).
 */
export function createSatinRoughness(size = 512): THREE.CanvasTexture {
  const rand = mulberry32(7);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(112,112,112)";
  g.fillRect(0, 0, size, size);

  // turned lines
  for (let y = 0; y < size; y++) {
    const v = 100 + (rand() - 0.5) * 22;
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.fillRect(0, y, size, 1);
  }
  // speckle
  for (let i = 0; i < size * 3; i++) {
    const v = rand() > 0.5 ? 130 : 78;
    g.fillStyle = `rgba(${v},${v},${v},0.18)`;
    g.beginPath();
    g.arc(rand() * size, rand() * size, 0.6 + rand() * 1.2, 0, Math.PI * 2);
    g.fill();
  }
  // hairline scratches
  g.lineWidth = 0.6;
  for (let i = 0; i < 14; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 20 + rand() * 90;
    const a = (rand() - 0.5) * 0.6;
    g.strokeStyle = `rgba(60,60,60,${0.25 + rand() * 0.3})`;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Soft radial blob used as a contact shadow / glow sprite. */
export function createRadialTexture(stops: [number, string][], size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/** The object's body profile (radius, height), smoothed through a spline. */
export function bodyProfile(segments = 72): THREE.Vector2[] {
  const ctrl = [
    [0.3, -1.25], [0.44, -1.21], [0.6, -1.06], [0.71, -0.82], [0.75, -0.55], [0.72, -0.26],
    [0.62, -0.02], [0.56, 0.16], [0.59, 0.34], [0.55, 0.49], [0.46, 0.6], [0.43, 0.63],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const curve = new THREE.SplineCurve(ctrl);
  return [new THREE.Vector2(0, -1.25), ...curve.getPoints(segments), new THREE.Vector2(0, 0.63)];
}

/** The cap profile: a low, slightly lifted dome. */
export function capProfile(segments = 40): THREE.Vector2[] {
  const ctrl = [[0.44, 0.0], [0.45, 0.05], [0.41, 0.13], [0.3, 0.21], [0.15, 0.255], [0.02, 0.27]].map(
    ([x, y]) => new THREE.Vector2(x, y)
  );
  return [new THREE.Vector2(0, 0), ...new THREE.SplineCurve(ctrl).getPoints(segments), new THREE.Vector2(0, 0.27)];
}
