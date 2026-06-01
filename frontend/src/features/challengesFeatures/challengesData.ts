/**
 * Static content for the Challenges page sections that we don't yet have a
 * backend for. Featured challenge + top challengers come from the real
 * ranking API; everything below is mock until the corresponding tables exist.
 */

export type ChallengeStatus = "Live" | "Starts soon";

export type ChallengeAccent = "orange" | "plum" | "forest" | "tape" | "peach";

export interface ChallengeCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  daysLeft: number | string;
  reward: number;
  participants: number;
  status: ChallengeStatus;
  accent: ChallengeAccent;
  tags: string[];
}

export const challengesGridMock: ChallengeCardData[] = [
  {
    id: "portfolio-48h",
    title: "Build a Developer Portfolio in 48h",
    description:
      "Ship a polished personal portfolio site from scratch. Creativity and code quality matter.",
    category: "Web",
    difficulty: "Beginner",
    daysLeft: 3,
    reward: 200,
    participants: 94,
    status: "Live",
    accent: "orange",
    tags: ["Web", "TS/JS", "48h"],
  },
  {
    id: "broken-api-sprint",
    title: "Fix the Broken API Sprint",
    description:
      "Debug and fix a real-world REST API with 12 failing tests. Speed and accuracy count.",
    category: "Backend",
    difficulty: "Intermediate",
    daysLeft: 1,
    reward: 280,
    participants: 67,
    status: "Live",
    accent: "plum",
    tags: ["Backend", "Node", "Tests"],
  },
  {
    id: "ui-clone-dashboard",
    title: "UI Clone: Premium Dashboard",
    description:
      "Recreate a pixel-perfect dashboard UI from a provided Figma file.",
    category: "UI",
    difficulty: "Advanced",
    daysLeft: 5,
    reward: 320,
    participants: 43,
    status: "Live",
    accent: "forest",
    tags: ["UI", "Tailwind", "Figma"],
  },
  {
    id: "ai-workflow",
    title: "AI Workflow Builder Challenge",
    description:
      "Build an AI-powered workflow tool using any LLM API. Judged on UX and utility.",
    category: "AI",
    difficulty: "Advanced",
    daysLeft: 4,
    reward: 400,
    participants: 112,
    status: "Live",
    accent: "orange",
    tags: ["AI", "TS/Py"],
  },
  {
    id: "oss-week",
    title: "Contribute to Open Source Week",
    description:
      "Make meaningful contributions to approved open-source projects over 7 days.",
    category: "Open Source",
    difficulty: "All levels",
    daysLeft: 6,
    reward: 250,
    participants: 201,
    status: "Live",
    accent: "peach",
    tags: ["OSS", "Any Lang"],
  },
  {
    id: "indie-game-landing",
    title: "Indie Game Landing Page Sprint",
    description:
      "Design and build a landing page for a fictional indie game. Ship fast, ship bold.",
    category: "Game Dev",
    difficulty: "Beginner",
    daysLeft: "starts in 2d",
    reward: 180,
    participants: 0,
    status: "Starts soon",
    accent: "tape",
    tags: ["Game Dev", "UI"],
  },
];

export interface PastWinnerData {
  handle: string;
  name: string;
  location: string;
  challenge: string;
  score: number;
  badge: "Gold" | "Silver" | "Platinum";
  summary: string;
}

export const pastWinnersMock: PastWinnerData[] = [
  {
    handle: "@ajla.dev",
    name: "Ajla Karić",
    location: "Sarajevo",
    challenge: "API Sprint #4",
    score: 94,
    badge: "Gold",
    summary:
      "Built a fault-tolerant REST gateway with 100% test coverage in 48h.",
  },
  {
    handle: "@harun.build",
    name: "Harun Delić",
    location: "Tuzla",
    challenge: "UI Challenge #7",
    score: 91,
    badge: "Platinum",
    summary:
      "Delivered a pixel-perfect dashboard clone with dark mode and responsive layout.",
  },
  {
    handle: "@emina_h",
    name: "Emina Hadžić",
    location: "Mostar",
    challenge: "AI Workflow #2",
    score: 89,
    badge: "Gold",
    summary:
      "Created an AI-driven task planner with GPT-4 integration and drag-and-drop UX.",
  },
  {
    handle: "@dinob",
    name: "Dino Begović",
    location: "Zenica",
    challenge: "Open Source Week #3",
    score: 87,
    badge: "Silver",
    summary:
      "Contributed 14 merged PRs across 3 major React ecosystem libraries.",
  },
];

export const TABS = [
  { l: "Active", n: 14 },
  { l: "Upcoming", n: 6 },
  { l: "Past", n: 84 },
  { l: "Winners", n: 21 },
  { l: "Mine", n: 3 },
] as const;

export const CATEGORIES = [
  "Web",
  "AI",
  "Backend",
  "UI",
  "Open Source",
  "Game Dev",
] as const;

export type ChallengeTab = (typeof TABS)[number]["l"];
export type ChallengeCategory = (typeof CATEGORIES)[number];

/**
 * Returns a "Xd Yh" string for an ISO endsAt timestamp, or null if expired/invalid.
 */
export function formatTimeLeft(endsAtIso: string): string | null {
  const end = new Date(endsAtIso).getTime();
  if (Number.isNaN(end)) return null;
  const diffMs = end - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}
