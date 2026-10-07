import { chapters, type ChapterId } from "../../config/content";

/**
 * A chapter = a tall section (height from config, in viewport heights) with a sticky,
 * full-viewport panel. The panel stays pinned while the scene behind it moves.
 */
export default function Chapter({
  id,
  labelledBy,
  className = "",
  scrim = "bottom",
  children,
}: {
  id: ChapterId;
  labelledBy: string;
  className?: string;
  /** Soft darkening behind the copy so text contrast never depends on what the 3D scene is doing. */
  scrim?: "bottom" | "left" | "center" | "top-bottom";
  children: React.ReactNode;
}) {
  const chapter = chapters.find((c) => c.id === id)!;
  const scrims = {
    bottom: "bg-[linear-gradient(to_top,rgb(10_10_11/0.82),rgb(10_10_11/0.45)_38%,transparent_62%)]",
    left: "bg-[linear-gradient(to_right,rgb(10_10_11/0.8),rgb(10_10_11/0.4)_42%,transparent_65%)] max-md:bg-[linear-gradient(to_top,rgb(10_10_11/0.82),rgb(10_10_11/0.45)_45%,transparent_70%)]",
    center: "bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgb(10_10_11/0.55),transparent)] max-md:bg-[linear-gradient(to_top,rgb(10_10_11/0.85),rgb(10_10_11/0.5)_45%,transparent_70%)]",
    "top-bottom": "bg-[linear-gradient(to_bottom,rgb(10_10_11/0.75),transparent_40%,transparent_60%,rgb(10_10_11/0.8))]",
  } as const;
  return (
    <section id={id} aria-labelledby={labelledBy} className="relative" style={{ height: `${chapter.height * 100}svh` }}>
      <div className={`sticky top-0 h-svh overflow-clip ${className}`}>
        <div data-fade aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${scrims[scrim]}`} />
        {children}
      </div>
    </section>
  );
}

/** Small mono label with a hairline, e.g. "— THE OBJECT / 01". */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p data-fade className={`label flex items-center gap-3 text-ash ${className}`}>
      <span aria-hidden="true" className="h-px w-8 bg-champagne/70" />
      {children}
    </p>
  );
}
