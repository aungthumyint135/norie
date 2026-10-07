import { copy } from "../../config/content";
import { chapterRestY } from "../../animations/sections";
import { scrollToY } from "../../hooks/useLenis";
import Chapter, { Eyebrow } from "../ui/Chapter";
import MagneticButton from "../ui/MagneticButton";
import SplitText from "../ui/SplitText";

/** 01 — the object floats centre-frame; type anchors the bottom edge like a title card. */
export default function Hero() {
  const { hero } = copy;
  return (
    <Chapter id="experience" labelledBy="hero-title" className="flex flex-col justify-end px-5 pb-10 pt-28 sm:px-10 sm:pb-12">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <Eyebrow>{hero.label}</Eyebrow>
          <SplitText
            as="h1"
            id="hero-title"
            lines={hero.lines}
            className="display-hero mt-5"
            lineClassName={(i) => (i === 1 ? "lg:pl-[0.9em]" : "")}
          />
        </div>
        <div className="flex max-w-xs flex-col gap-6 lg:pb-3">
          <p data-fade className="text-lg leading-relaxed text-ash text-pretty">
            {hero.support}
          </p>
          <div data-fade>
            <MagneticButton
              href="#object"
              cursor="Explore"
              onClick={(e) => {
                e.preventDefault();
                scrollToY(chapterRestY("object"));
              }}
            >
              {hero.cta}
            </MagneticButton>
          </div>
        </div>
      </div>
      <div data-fade className="mt-10 flex items-center justify-between border-t border-line pt-5">
        <p className="label text-ash">{hero.scroll}</p>
        <span aria-hidden="true" className="relative h-8 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[drip_2.4s_cubic-bezier(.16,1,.3,1)_infinite] bg-bone" />
        </span>
        <p className="label hidden text-ash sm:block">Object 01 · Graphite</p>
      </div>
    </Chapter>
  );
}
