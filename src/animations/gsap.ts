import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: "power3.out" });

export { gsap, ScrollTrigger, useGSAP };

/** Cinematic eases used across the site. */
export const EASE = {
  reveal: "expo.out",
  inOut: "power2.inOut",
  cinema: "power3.inOut",
} as const;
