import { copy } from "../../config/content";
import { scrollToY } from "../../hooks/useLenis";
import { exploreMode } from "../../state/experience";
import Chapter, { Eyebrow } from "../ui/Chapter";
import MagneticButton from "../ui/MagneticButton";
import SplitText from "../ui/SplitText";

/** 06 — final composition: centred statement, CTA into free-orbit mode, quiet footer. */
export default function FinalCTA() {
  const { final, contact } = copy;
  const year = new Date().getFullYear();
  return (
    <Chapter id="contact" labelledBy="final-title" scrim="center" className="flex flex-col justify-between px-5 pb-8 pt-28 sm:px-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center max-md:justify-end max-md:pb-10">
        <Eyebrow className="justify-center">{final.label}</Eyebrow>
        <SplitText id="final-title" lines={final.lines} className="display-section mt-6" />
        <p data-fade className="mt-6 max-w-sm text-base leading-relaxed text-ash sm:text-lg">
          {final.support}
        </p>
        <div data-fade className="mt-8">
          <MagneticButton cursor="Enter" aria-haspopup="dialog" onClick={() => exploreMode.set(true)}>
            {final.cta}
          </MagneticButton>
        </div>
      </div>
      <footer data-fade className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <a href={`mailto:${contact.email}`} data-cursor="Write" className="label inline-flex min-h-11 items-center text-bone underline decoration-line underline-offset-8 hover:decoration-bone">
          {contact.email}
        </a>
        <a
          href="#experience"
          data-cursor="Top"
          onClick={(e) => {
            e.preventDefault();
            scrollToY(0);
          }}
          className="label inline-flex min-h-11 items-center text-ash hover:text-bone"
        >
          Back to the beginning ↑
        </a>
        <p className="label text-ash">© {year} NOIRÉ</p>
      </footer>
    </Chapter>
  );
}
