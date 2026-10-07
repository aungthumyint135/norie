import { copy } from "../../config/content";
import Chapter, { Eyebrow } from "../ui/Chapter";
import SplitText from "../ui/SplitText";

/** 02 — the camera approaches; three characteristics surface one after another. */
export default function FormSection() {
  const { form } = copy;
  return (
    <Chapter id="object" labelledBy="form-title" scrim="top-bottom" className="flex flex-col justify-between px-5 pb-10 pt-28 sm:px-10 sm:pb-12">
      <div>
        <Eyebrow>{form.label}</Eyebrow>
        <SplitText id="form-title" lines={form.lines} className="display-section mt-5" />
        <p data-fade className="mt-6 max-w-sm text-base leading-relaxed text-ash sm:text-lg">
          {form.body}
        </p>
      </div>
      <ul className="grid grid-cols-3 gap-3 sm:gap-8" aria-label="Characteristics">
        {form.traits.map((t, i) => (
          <li key={t.word} data-item className="border-t border-line pt-4">
            <p className="label text-ash">{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-2 text-[clamp(1.05rem,4vw,3.4rem)] font-semibold uppercase leading-none tracking-[-0.04em]">{t.word}</p>
            <p className="mt-2 text-xs text-ash sm:text-sm">{t.note}</p>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
