/** All copy and structure for the experience. Each chapter = one scroll section + one 3D keyframe. */

export type ChapterId = "experience" | "object" | "story" | "materials" | "motion" | "contact";

export interface Chapter {
  id: ChapterId;
  index: number;
  /** Section height in viewport heights. Pinned (readable) time = height - 1. */
  height: number;
  label: string;
}

export const chapters: Chapter[] = [
  { id: "experience", index: 1, height: 2, label: "The object / 01" },
  { id: "object", index: 2, height: 2.2, label: "Form / 02" },
  { id: "story", index: 3, height: 2, label: "Silhouette / 03" },
  { id: "materials", index: 4, height: 2, label: "Material / 04" },
  { id: "motion", index: 5, height: 3, label: "Motion / 05" },
  { id: "contact", index: 6, height: 2, label: "Experience / 06" },
];

export const TOTAL_CHAPTERS = chapters.length;

export const menuLinks: { label: string; id: ChapterId }[] = [
  { label: "Experience", id: "experience" },
  { label: "Object", id: "object" },
  { label: "Materials", id: "materials" },
  { label: "Story", id: "story" },
  { label: "Contact", id: "contact" },
];

export const copy = {
  hero: {
    label: "The object / 01",
    lines: ["Designed to", "be experienced."],
    support: "An exploration of form, material and motion.",
    cta: "Explore the object",
    scroll: "Scroll to discover",
  },
  form: {
    label: "Form / 02",
    lines: ["Form follows", "feeling."],
    body: "A single continuous silhouette, turned from one profile. Nothing added that the hand does not notice first.",
    traits: [
      { word: "Form", note: "One unbroken profile" },
      { word: "Precision", note: "Tolerances under 0.02 mm" },
      { word: "Motion", note: "Balanced to rest, made to turn" },
    ],
  },
  curve: {
    label: "Silhouette / 03",
    lines: ["Every curve", "has a purpose."],
    body: "The shoulder catches light before it catches the eye. The waist settles the weight low, so the object always returns to stillness.",
    specs: [
      { k: "Height", v: "218 mm" },
      { k: "Weight", v: "1.4 kg" },
      { k: "Profile", v: "Single turned curve" },
    ],
  },
  material: {
    label: "Material / 04",
    lines: ["Made for", "the details."],
    body: "Bead-blasted graphite alloy, hand-finished in directional strokes. A polished champagne collar marks the seam where body meets cap.",
    details: ["Directional satin finish", "Polished champagne collar", "Hairline seam, 0.3 mm", "Soft micro-texture under raking light"],
  },
  motion: {
    label: "Motion / 05",
    title: "Built to move.",
    beats: [
      { k: "01", v: "The cap lifts on a single magnetic seat." },
      { k: "02", v: "The halo ring turns freely around the body." },
      { k: "03", v: "Every part returns to the same silent rest." },
    ],
  },
  final: {
    label: "Experience / 06",
    lines: ["Form.", "Motion.", "Experience."],
    support: "Discover a new relationship between object and space.",
    cta: "Enter the experience",
  },
  contact: {
    email: "studio@noire.example",
  },
} as const;
