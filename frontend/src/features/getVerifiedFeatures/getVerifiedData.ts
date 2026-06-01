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
    desc: "We scan public repos, commits, and contribution history over 12 months.",
    glyph: "GH",
    accent: "orange",
  },
  {
    n: "02",
    title: "Add Projects",
    desc: "Submit repos and optional live app links.",
    glyph: "PR",
    accent: "plum",
  },
  {
    n: "03",
    title: "Verify Identity",
    desc: "Enable email 2FA to mark your account as security-verified.",
    glyph: "2FA",
    accent: "forest",
  },
  {
    n: "04",
    title: "Analyze Activity",
    desc: "We evaluate consistency and proof of real shipping.",
    glyph: "AN",
    accent: "tape",
  },
  {
    n: "05",
    title: "Score Signals",
    desc: "Weighted scoring across product activity signals.",
    glyph: "SC",
    accent: "orange-2",
  },
  {
    n: "06",
    title: "Claim Your Tier",
    desc: "Tier is assigned from your total score.",
    glyph: "T",
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
  { label: "Code shipped", value: "Commits and PR activity", weight: 18, dot: "orange" },
  { label: "Repo quality", value: "Project verification and ownership", weight: 22, dot: "forest" },
  { label: "Open-source impact", value: "Public contribution depth", weight: 14, dot: "tape" },
  { label: "Community signal", value: "Followers and collaboration", weight: 10, dot: "plum" },
  { label: "Originality", value: "Verified personal work", weight: 12, dot: "orange-2" },
  { label: "Consistency", value: "Weekly streak and cadence", weight: 16, dot: "sage" },
];

export interface TierLadderRow {
  code: "T0" | "T1" | "T2" | "T3";
}

export const tierLadder: TierLadderRow[] = [
  { code: "T0" },
  { code: "T1" },
  { code: "T2" },
  { code: "T3" },
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
    a: "Yes. Verification is free for individual users.",
    color: "peach",
    tilt: -1.5,
  },
  {
    q: "Can I stay private?",
    a: "Yes. Show only the profile signals you want public.",
    color: "cream",
    tilt: 0.8,
  },
  {
    q: "How often does score update?",
    a: "Live score views refresh regularly as new signals arrive.",
    color: "sage",
    tilt: -0.5,
  },
];

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

export const STEP_ACCENT_FG: Record<StepAccent, "cream" | "ink"> = {
  orange: "cream",
  "orange-2": "cream",
  plum: "cream",
  forest: "cream",
  tape: "ink",
  sage: "ink",
};
