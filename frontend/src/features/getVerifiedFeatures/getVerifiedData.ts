/**
 * Static content for the Get Verified marketing page. Most of this is
 * intentionally mock — the page is a "here's how it works" pitch, not a live
 * evaluation dashboard. Real tier/score data is pulled per-user from
 * `useProfileProgressQuery` when available.
 */

export type StepAccent =
  | "orange"
  | "plum"
  | "forest"
  | "tape"
  | "orange-2"
  | "sage";

export interface EvaluationStep {
  n: string;
  title: string;
  desc: string;
  glyph: string;
  accent: StepAccent;
}

export const evaluationSteps: EvaluationStep[] = [
  {
    n: "01",
    title: "Connect GitHub",
    desc: "We scan public repos, commits, contributions over 12 months.",
    glyph: "⌥",
    accent: "orange",
  },
  {
    n: "02",
    title: "Add Projects",
    desc: "Pick what you want judged. Repos, deploys, screenshots, demos.",
    glyph: "◆",
    accent: "plum",
  },
  {
    n: "03",
    title: "Verify Proof",
    desc: "We confirm authorship, originality, and shipping recency.",
    glyph: "✓",
    accent: "forest",
  },
  {
    n: "04",
    title: "Analyze Activity",
    desc: "Code quality, depth, consistency, and community signals.",
    glyph: "◢",
    accent: "tape",
  },
  {
    n: "05",
    title: "Score Signals",
    desc: "Weighted scoring across 14 dimensions of real-world dev work.",
    glyph: "▲",
    accent: "orange-2",
  },
  {
    n: "06",
    title: "Claim Your Tier",
    desc: "Get your badge, your rank, and unlock challenges + DMs.",
    glyph: "★",
    accent: "sage",
  },
];

export interface EvaluationSignal {
  label: string;
  value: string;
  weight: number;
  dot: StepAccent;
}

export const evaluationSignals: EvaluationSignal[] = [
  { label: "Code shipped", value: "142 commits / 30d", weight: 18, dot: "orange" },
  { label: "Repo quality", value: "A · clean, tested", weight: 22, dot: "forest" },
  { label: "Open-source impact", value: "4 PRs to 1k+ repos", weight: 14, dot: "tape" },
  { label: "Community signal", value: "847 followers", weight: 10, dot: "plum" },
  { label: "Originality", value: "no forks counted", weight: 12, dot: "orange-2" },
  { label: "Consistency", value: "14w streak", weight: 16, dot: "sage" },
];

export interface TierLadderRow {
  code: "T0" | "T1" | "T2" | "T3";
  name: string;
  range: string;
  locked?: boolean;
}

/** Top → bottom, as displayed in the preview ladder. */
export const tierLadder: TierLadderRow[] = [
  { code: "T0", name: "Architect", range: "1,800+", locked: true },
  { code: "T1", name: "Shipper", range: "1,200–1,800" },
  { code: "T2", name: "Builder", range: "400–1,200" },
  { code: "T3", name: "Apprentice", range: "0–400" },
];

export interface VerifyFaq {
  q: string;
  a: string;
  color: "peach" | "cream" | "sage";
  tilt: number;
}

export const verifyFaqs: VerifyFaq[] = [
  {
    q: "Is it free?",
    a: "Yes. Verification is free for individuals. Forever.",
    color: "peach",
    tilt: -1.5,
  },
  {
    q: "Can I stay private?",
    a: "Yes. Show only what you want. Hide your real name. Tier ranks anyway.",
    color: "cream",
    tilt: 0.8,
  },
  {
    q: "How often does it update?",
    a: "Daily for active accounts. Every 6h during challenges.",
    color: "sage",
    tilt: -0.5,
  },
];

/** Tilt per step card, by index. Stable, no per-render randomness. */
export const STEP_TILTS = [-1.5, 1, -0.8, 1.2, -0.6, 0.9];

export const STEP_ACCENT_BG: Record<StepAccent, string> = {
  orange: "bg-orange",
  "orange-2": "bg-orange-2",
  plum: "bg-plum",
  forest: "bg-forest",
  tape: "bg-tape",
  sage: "bg-sage",
};

export const STEP_ACCENT_TEXT: Record<StepAccent, string> = {
  orange: "text-orange",
  "orange-2": "text-orange-2",
  plum: "text-plum",
  forest: "text-forest",
  tape: "text-tape",
  sage: "text-sage",
};

/** "tape" and "sage" need ink text on the colored sticker. */
export const STEP_ACCENT_FG: Record<StepAccent, "cream" | "ink"> = {
  orange: "cream",
  "orange-2": "cream",
  plum: "cream",
  forest: "cream",
  tape: "ink",
  sage: "ink",
};

export type Tier = "T0" | "T1" | "T2" | "T3";

const TIER_CODES: ReadonlySet<string> = new Set(["T0", "T1", "T2", "T3"]);

/** Coerce arbitrary tier-code strings to a strict Tier or null. */
export function toTier(raw: string | null | undefined): Tier | null {
  if (!raw) return null;
  return TIER_CODES.has(raw) ? (raw as Tier) : null;
}
