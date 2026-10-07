import { copy } from "../../config/content";
import Chapter, { Eyebrow } from "../ui/Chapter";
import SplitText from "../ui/SplitText";

/**
 * 05 — vertical scroll drives a horizontal pan: the title and three beats slide across while the
 * object crosses the frame and the camera swings around it. On phones the beats simply stack.
 */
export default function MotionSection() {
  const { motion } = copy;
  return (
    <Chapter id="motion" labelledBy="motion-title" scrim="center" className="flex flex-col justify-end pb-10 pt-28 md:justify-center md:pb-0">
      <Eyebrow className="px-5 sm:px-10">{motion.label}</Eyebrow>
      <div data-track className="mt-6 flex flex-col gap-8 px-5 sm:px-10 md:w-max md:flex-row md:items-end md:gap-24 md:px-0 md:pl-10">
        <SplitText id="motion-title" lines={[motion.title]} className="display-section whitespace-nowrap md:text-[clamp(5rem,13vw,15rem)]" />
        <ol className="grid gap-5 md:flex md:gap-20 md:pb-4" aria-label="How it moves">
          {motion.beats.map((b) => (
            <li key={b.k} data-item className="max-w-[17rem] border-t border-line pt-4">
              <p className="label text-champagne">{b.k}</p>
              <p className="mt-2 text-base leading-relaxed text-bone sm:text-lg">{b.v}</p>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
