import { forwardRef, useRef } from "react";
import { gsap, useGSAP } from "../../animations/gsap";
import { FINE_POINTER_QUERY } from "../../hooks/useMediaQuery";
import { REDUCED_MOTION_QUERY } from "../../hooks/useReducedMotion";

type Props = {
  children: React.ReactNode;
  cursor?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "solid" | "line";
  className?: string;
  "aria-label"?: string;
  "aria-haspopup"?: "dialog";
};

/**
 * CTA that leans toward the pointer (desktop, fine pointer, motion allowed).
 * The label travels further than the pill for a sense of depth. Renders <a> or <button>.
 */
const MagneticButton = forwardRef<HTMLElement, Props>(function MagneticButton(
  { children, cursor = "Open", href, onClick, variant = "solid", className = "", ...aria },
  forwarded
) {
  const el = useRef<HTMLElement | null>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const node = el.current;
    if (!node || !matchMedia(FINE_POINTER_QUERY).matches || matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const bx = gsap.quickTo(node, "x", { duration: 0.8, ease: "power3.out" });
    const by = gsap.quickTo(node, "y", { duration: 0.8, ease: "power3.out" });
    const lx = gsap.quickTo(label.current, "x", { duration: 0.8, ease: "power3.out" });
    const ly = gsap.quickTo(label.current, "y", { duration: 0.8, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      bx(dx * 0.28);
      by(dy * 0.36);
      lx(dx * 0.12);
      ly(dy * 0.16);
    };
    const leave = () => {
      bx(0); by(0); lx(0); ly(0);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  });

  const setRef = (node: HTMLElement | null) => {
    el.current = node;
    if (typeof forwarded === "function") forwarded(node);
    else if (forwarded) forwarded.current = node;
  };

  const styles =
    variant === "solid"
      ? "bg-bone text-ink hover:bg-white"
      : "border border-bone/35 text-bone hover:border-bone";
  const cls = `group relative inline-flex min-h-12 items-center gap-3 whitespace-nowrap rounded-full px-7 font-mono text-[0.75rem] uppercase tracking-[0.12em] transition-colors duration-500 ${styles} ${className}`;
  const inner = (
    <span ref={label} className="inline-flex items-center gap-3">
      {children}
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-current transition-transform duration-500 group-hover:scale-150" />
    </span>
  );

  return href ? (
    <a ref={setRef as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} data-cursor={cursor} className={cls} {...aria}>
      {inner}
    </a>
  ) : (
    <button ref={setRef as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} data-cursor={cursor} className={cls} {...aria}>
      {inner}
    </button>
  );
});

export default MagneticButton;
