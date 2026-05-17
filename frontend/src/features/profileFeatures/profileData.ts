/**
 * Static profile content — mocks for slots we don't yet have backend data
 * for. Real stats (followers/following/tier/score/posts) come from
 * `useProfileProgressQuery`.
 */

export type BadgeAccent =
  | "orange"
  | "tape"
  | "orange-2"
  | "forest"
  | "plum"
  | "sage";

export interface ProfileBadge {
  label: string;
  glyph: string;
  earned: string;
  accent: BadgeAccent;
}

export const profileBadges: ProfileBadge[] = [
  { label: "Early Adopter", glyph: "◆", earned: "2025", accent: "orange" },
  { label: "Challenge Winner", glyph: "★", earned: "4x", accent: "tape" },
  { label: "14w Streak", glyph: "🔥", earned: "active", accent: "orange-2" },
  { label: "OSS Hero", glyph: "◢", earned: "12 PRs", accent: "forest" },
  { label: "Verified", glyph: "✓", earned: "gh", accent: "plum" },
  { label: "Builder · BiH", glyph: "🇧🇦", earned: "region", accent: "sage" },
];

export const BADGE_BG: Record<BadgeAccent, string> = {
  orange: "bg-orange text-cream",
  "orange-2": "bg-orange-2 text-cream",
  plum: "bg-plum text-cream",
  forest: "bg-forest text-cream",
  tape: "bg-tape text-ink",
  sage: "bg-sage text-ink",
};

/** Stable per-position tilts for the badge grid. */
export const BADGE_TILTS = [-2, 1.5, -1, 2, -1.5, 1];

export type ProjectAccent = "orange" | "plum" | "forest" | "tape" | "sage";

export interface MockProject {
  name: string;
  desc: string;
  stars: number;
  lang: string;
  accent: ProjectAccent;
  featured?: boolean;
  verified?: boolean;
}

export const mockProjects: MockProject[] = [
  {
    name: "NeuralDeploy",
    desc: "One-click ML model deployment. Next.js, Python, Docker.",
    stars: 412,
    lang: "TypeScript",
    accent: "orange",
    featured: true,
    verified: true,
  },
  {
    name: "FormForge",
    desc: "AI-powered form builder with validation generation.",
    stars: 187,
    lang: "Python",
    accent: "plum",
    verified: true,
  },
  {
    name: "PixelSync",
    desc: "Real-time collaborative design annotation tool.",
    stars: 156,
    lang: "Go",
    accent: "forest",
    verified: true,
  },
];

export const PROJECT_ACCENT_BG: Record<ProjectAccent, string> = {
  orange: "bg-orange",
  plum: "bg-plum",
  forest: "bg-forest",
  tape: "bg-tape",
  sage: "bg-sage",
};

export interface MockAchievement {
  title: string;
  desc: string;
  xp: string;
  tag: "WIN" | "STREAK" | "TIER";
}

export const mockAchievements: MockAchievement[] = [
  {
    title: "Won AI Challenge — Week 22",
    desc: "RAG pipeline scoring 94% on domain QA.",
    xp: "+250 XP",
    tag: "WIN",
  },
  {
    title: "7-Week Shipping Streak",
    desc: "Consecutive weekly verified commits.",
    xp: "+90 XP",
    tag: "STREAK",
  },
  {
    title: "Reached Tier 1",
    desc: "Top 5% of all ranked developers.",
    xp: "+500 XP",
    tag: "TIER",
  },
];

export const ACHIEVEMENT_TAG_BG: Record<MockAchievement["tag"], string> = {
  WIN: "bg-orange text-cream",
  STREAK: "bg-tape text-ink",
  TIER: "bg-forest text-cream",
};

export const mockMutuals = [
  { name: "Sara K.", username: "sarakdev" },
  { name: "Amir H.", username: "amirh_" },
  { name: "Lena M.", username: "lenam" },
  { name: "Dino B.", username: "dinob" },
];

export const TECH_OPTIONS = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Next.js",
  "Docker",
  "Python",
  "Rust",
  "Go",
  "AI/ML",
] as const;

export type TechOption = (typeof TECH_OPTIONS)[number];
