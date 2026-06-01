import type { Tier } from "../../components/tierd";

export const TIER_BADGE_ORDER: Tier[] = ["T0", "T1", "T2", "T3", "UNRANKED"];

const UNRANKED: Tier = "UNRANKED";

const DEFAULT_TIER_NAMES: Record<Tier, string> = {
  T0: "Architect",
  T1: "Shipper",
  T2: "Builder",
  T3: "Apprentice",
  UNRANKED: "Unranked",
};

const DEFAULT_TIER_RANGES: Record<Tier, string> = {
  T0: "1800+",
  T1: "1200-1799",
  T2: "400-1199",
  T3: "0-399",
  UNRANKED: "0-399",
};

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function mapTierToBadge(raw: string | null | undefined): Tier {
  if (!raw) return UNRANKED;

  const value = normalize(raw);
  if (value === "t0") return "T0";
  if (value === "t1") return "T1";
  if (value === "t2") return "T2";
  if (value === "t3") return "T3";
  if (value === "unranked") return UNRANKED;

  if (value === "tier_1") return "T3";
  if (value === "tier_2") return "T2";
  if (value === "tier_3") return "T1";
  if (value === "tier_4" || value === "tier_5" || value === "aegis") return "T0";

  const tierNumber = /^tier_(\d+)$/.exec(value)?.[1];
  if (tierNumber === "1") return "T3";
  if (tierNumber === "2") return "T2";
  if (tierNumber === "3") return "T1";
  if (tierNumber === "4" || tierNumber === "5") return "T0";

  return UNRANKED;
}

export function getTierDisplayName(
  tier: Tier,
  fallbackName?: string | null,
): string {
  const trimmed = fallbackName?.trim();
  if (trimmed) return trimmed;
  return DEFAULT_TIER_NAMES[tier];
}

export function getTierRangeLabel(tier: Tier): string {
  return DEFAULT_TIER_RANGES[tier];
}
