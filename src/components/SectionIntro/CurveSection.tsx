import { copy } from "../../config/content";
import Chapter, { Eyebrow } from "../ui/Chapter";
import SplitText from "../ui/SplitText";

/** 03 — object drifts right; editorial type holds the left half. */
export default function CurveSection() {
  const { curve } = copy;
  return (
    <Chapter id="story" labelledBy="curve-title" scrim="left" className="flex items-end px-5 pb-10 pt-28 sm:px-10 md:items-center md:pb-0">
      <div className="max-w-[44rem]">
        <Eyebrow>{curve.label}</Eyebrow>
        <SplitText id="curve-title" lines={curve.lines} className="display-section mt-5" />
        <p data-fade className="mt-6 max-w-md text-base leading-relaxed text-ash sm:text-lg">
          {curve.body}
        </p>
        <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
          {curve.specs.map((s) => (
            <div key={s.k} data-item className="border-t border-line pt-3">
              <dt className="label text-ash">{s.k}</dt>
              <dd className="mt-1.5 text-sm text-bone">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Chapter>
  );
}
