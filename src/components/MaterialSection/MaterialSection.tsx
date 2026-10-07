import { copy } from "../../config/content";
import Chapter, { Eyebrow } from "../ui/Chapter";
import SplitText from "../ui/SplitText";

/** Viewfinder corner marks for the macro shot. */
function Viewfinder() {
  const corner = "absolute size-6 border-bone/40";
  return (
    <div data-fade aria-hidden="true" className="pointer-events-none absolute inset-[12%] max-md:inset-x-[8%] max-md:top-[14%] max-md:bottom-[48%]">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
      <span className="label absolute -top-7 left-0 text-ash">Macro · 1:1</span>
      <span className="label absolute -top-7 right-0 text-ash">ƒ/2.8 · Raking light</span>
    </div>
  );
}

/** 04 — extreme close-up on the collar: finish, seam, edge. */
export default function MaterialSection() {
  const { material } = copy;
  return (
    <Chapter id="materials" labelledBy="material-title" className="flex flex-col justify-end px-5 pb-10 pt-28 sm:px-10 sm:pb-12">
      <Viewfinder />
      <div className="relative grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow>{material.label}</Eyebrow>
          <SplitText id="material-title" lines={material.lines} className="display-section mt-5" />
        </div>
        <div className="lg:pb-2">
          <p data-fade className="max-w-md text-base leading-relaxed text-ash sm:text-lg">
            {material.body}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3" aria-label="Material details">
            {material.details.map((d, i) => (
              <li key={d} data-item className="flex gap-3 border-t border-line pt-3 text-sm text-bone">
                <span className="label text-ash">{String(i + 1).padStart(2, "0")}</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}
