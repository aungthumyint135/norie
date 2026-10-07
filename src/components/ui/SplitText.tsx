import { createElement } from "react";

type Props = {
  as?: "h1" | "h2" | "p" | "span";
  lines: readonly string[];
  className?: string;
  id?: string;
  /** Extra class per line (e.g. indent the second line). */
  lineClassName?: (index: number) => string;
};

/**
 * Renders text as masked lines → words → characters for GSAP reveals.
 * Screen readers get the plain sentence via aria-label; the split spans are aria-hidden.
 */
export default function SplitText({ as = "h2", lines, className, id, lineClassName }: Props) {
  const label = lines.join(" ");
  return createElement(
    as,
    { className, id, "aria-label": label },
    lines.map((line, li) => (
      <span key={li} className={`line-mask ${lineClassName?.(li) ?? ""}`} aria-hidden="true">
        {line.split(" ").map((word, wi, words) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...word].map((ch, ci) => (
              <span key={ci} className="char inline-block">
                {ch}
              </span>
            ))}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    ))
  );
}
