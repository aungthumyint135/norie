/**
 * Still composition used when WebGL is unavailable or the scene fails: the same object drawn as a
 * lit SVG (turned body, champagne collar, cap, halo) in a soft pool of light. Never a broken canvas.
 */
export default function StaticFallback() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-ink" aria-hidden="true">
      <div className="absolute left-1/2 top-[44%] size-[min(120vw,70rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(236_230_220/0.12),transparent_62%)]" />
      <svg viewBox="-110 -110 220 250" className="absolute left-1/2 top-[46%] h-[min(62svh,40rem)] -translate-x-1/2 -translate-y-1/2 opacity-90 max-md:top-[34%] max-md:h-[44svh]">
        <defs>
          <linearGradient id="fb-body" x1="0" x2="1">
            <stop offset="0" stopColor="#0d0d0f" />
            <stop offset="0.22" stopColor="#3a3a40" />
            <stop offset="0.34" stopColor="#8c8a86" />
            <stop offset="0.46" stopColor="#2a2a2f" />
            <stop offset="0.8" stopColor="#141417" />
            <stop offset="0.95" stopColor="#4a4844" />
            <stop offset="1" stopColor="#121214" />
          </linearGradient>
          <linearGradient id="fb-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#5d5241" />
            <stop offset="0.35" stopColor="#f0e3c6" />
            <stop offset="0.6" stopColor="#a8916a" />
            <stop offset="1" stopColor="#4c4234" />
          </linearGradient>
          <linearGradient id="fb-cap" x1="0" x2="1">
            <stop offset="0" stopColor="#050506" />
            <stop offset="0.3" stopColor="#5b5b60" />
            <stop offset="0.45" stopColor="#121214" />
            <stop offset="1" stopColor="#0a0a0b" />
          </linearGradient>
          <radialGradient id="fb-shadow">
            <stop offset="0" stopColor="#000" stopOpacity="0.7" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="0" cy="128" rx="70" ry="10" fill="url(#fb-shadow)" />
        {/* paths generated from the same splines as the 3D lathe (scaled ×100) */}
        <path d="M 0 125 L 30 125 L 32.8 124.5 L 36.8 123.8 L 41.3 122.4 L 45.5 120 L 50.1 116.6 L 54.7 112.4 L 59 107.4 L 62.6 101.8 L 66 95.4 L 68.9 88.4 L 71.2 81.4 L 72.9 74.2 L 74.2 66.8 L 74.8 59.2 L 75 51.4 L 74.6 43.3 L 73.7 35.1 L 72.3 27.3 L 70.1 20.1 L 67.2 13.3 L 64.1 6.9 L 61.6 1 L 59.4 -4.3 L 57.6 -9.1 L 56.3 -13.8 L 56 -18.7 L 57 -23.8 L 58.3 -28.8 L 59 -33.6 L 58.6 -38.1 L 57.6 -42.3 L 56.2 -46.3 L 54.5 -50 L 52 -53.5 L 49.2 -56.6 L 46.7 -59.2 L 45.1 -61 L 44.1 -62.1 L 43.4 -62.6 L 43 -63 L 0 -63 L -43 -63 L -43.4 -62.6 L -44.1 -62.1 L -45.1 -61 L -46.7 -59.2 L -49.2 -56.6 L -52 -53.5 L -54.5 -50 L -56.2 -46.3 L -57.6 -42.3 L -58.6 -38.1 L -59 -33.6 L -58.3 -28.8 L -57 -23.8 L -56 -18.7 L -56.3 -13.8 L -57.6 -9.1 L -59.4 -4.3 L -61.6 1 L -64.1 6.9 L -67.2 13.3 L -70.1 20.1 L -72.3 27.3 L -73.7 35.1 L -74.6 43.3 L -75 51.4 L -74.8 59.2 L -74.2 66.8 L -72.9 74.2 L -71.2 81.4 L -68.9 88.4 L -66 95.4 L -62.6 101.8 L -59 107.4 L -54.7 112.4 L -50.1 116.6 L -45.5 120 L -41.3 122.4 L -36.8 123.8 L -32.8 124.5 L -30 125 Z" fill="url(#fb-body)" />
        <ellipse cx="0" cy="55" rx="83" ry="12" fill="none" stroke="url(#fb-gold)" strokeWidth="1.8" />
        <rect x="-45" y="-66" width="90" height="5" rx="2.5" fill="url(#fb-gold)" />
        <path d="M 44 -66 L 44.3 -66.8 L 44.8 -68 L 45.1 -69.4 L 45 -71 L 44.5 -72.8 L 43.8 -74.8 L 42.6 -76.9 L 41 -79 L 38.8 -81.1 L 36.2 -83.2 L 33.2 -85.2 L 30 -87 L 26.5 -88.4 L 22.6 -89.7 L 18.7 -90.7 L 15 -91.5 L 11.3 -92.1 L 7.6 -92.5 L 4.3 -92.8 L 2 -93 L -2 -93 L -4.3 -92.8 L -7.6 -92.5 L -11.3 -92.1 L -15 -91.5 L -18.7 -90.7 L -22.6 -89.7 L -26.5 -88.4 L -30 -87 L -33.2 -85.2 L -36.2 -83.2 L -38.8 -81.1 L -41 -79 L -42.6 -76.9 L -43.8 -74.8 L -44.5 -72.8 L -45 -71 L -45.1 -69.4 L -44.8 -68 L -44.3 -66.8 L -44 -66 Z" fill="url(#fb-cap)" />
        <circle cx="0" cy="-94" r="3" fill="url(#fb-gold)" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(10_10_11/0.85)_100%)]" />
    </div>
  );
}
