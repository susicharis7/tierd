import { Pencil, UserCheck, UserPlus } from "lucide-react";

import { Doodle, MonoCaption, UserAvatar } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { mockMutuals, TECH_OPTIONS, type TechOption } from "../profileData";

interface ProfileIdentityCardProps {
  displayName: string;
  username: string;
  avatarUrl: string | null | undefined;
  headline: string;
  location: string;
  bio: string;
  bioExpanded: boolean;
  onToggleBio: () => void;

  isOwnProfile: boolean;
  isFollowing: boolean;
  followPending: boolean;
  onEdit: () => void;
  onToggleFollow: () => void;

  /** Tier identity (used for the corner badge + caption under the avatar). */
  tierCode: string | null;
  tierName: string;
  currentScore: number;
  nextTierName: string | null;
  pointsToNextTier: number;
  progressPct: number;
  weeklyScore: number;
  globalPercentile: number;

  /** Stats row underneath the head. */
  postsLabel: string;
  followersCount: number;
  followingCount: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;

  /** Tech stack chips (top-N highlighted). */
  topTech: string[];
  onEditTech?: () => void;
}

const TIER_BADGE_BG: Record<string, string> = {
  T0: "bg-ink border-[3px] border-dashed border-orange text-orange",
  T1: "bg-orange border-[3px] border-ink-2 text-cream",
  T2: "bg-orange-2 border-[3px] border-ink-2 text-cream",
  T3: "bg-sage border-[3px] border-ink-2 text-ink",
};

const TIER_NAME_TEXT: Record<string, string> = {
  T0: "text-orange",
  T1: "text-orange",
  T2: "text-orange-2",
  T3: "text-sage",
};

/**
 * The "Faceit-style" profile head — one big sticker card that fuses the
 * avatar with a tier corner badge, identity copy, action buttons, the 4
 * sticker stats, and the tech stack chips. Overlaps the banner from above
 * via `-mt-[60px]`.
 */
const ProfileIdentityCard = ({
  displayName,
  username,
  avatarUrl,
  headline,
  location,
  bio,
  bioExpanded,
  onToggleBio,
  isOwnProfile,
  isFollowing,
  followPending,
  onEdit,
  onToggleFollow,
  tierCode,
  tierName,
  currentScore,
  nextTierName,
  pointsToNextTier,
  progressPct,
  weeklyScore,
  globalPercentile,
  postsLabel,
  followersCount,
  followingCount,
  onOpenFollowers,
  onOpenFollowing,
  topTech,
  onEditTech,
}: ProfileIdentityCardProps) => {
  const tierKey = tierCode ?? "—";
  const tierBadgeClasses =
    TIER_BADGE_BG[tierKey] ??
    "bg-ink-2 border-[3px] border-dashed border-muted-ink text-muted-ink";
  const tierNameClass = TIER_NAME_TEXT[tierKey] ?? "text-muted-ink";

  const percentileLabel = `TOP ${Math.max(1, Math.round(globalPercentile))}%`;

  const subSkills = TECH_OPTIONS.filter(
    (t) => !topTech.includes(t),
  ) as TechOption[];

  return (
    <div className="relative -mt-[60px] z-[2] rounded-[22px] bg-ink-2 border border-ink-line p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      {/* ── Top: avatar+tier block | identity block ── */}
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
        <div className="shrink-0 flex flex-col items-center sm:items-start">
          {/* Avatar frame with tier corner badge */}
          <div className="relative w-[140px] h-[140px] rounded-[22px] bg-ink p-1.5 border-[3px] border-ink-line shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <div className="w-full h-full rounded-[16px] overflow-hidden flex items-center justify-center bg-[linear-gradient(135deg,#FFB892_0%,#FF7B45_100%)]">
              <UserAvatar
                name={displayName}
                src={avatarUrl}
                size={120}
                className="!w-[120px] !h-[120px]"
              />
            </div>
            <span
              className={cn(
                "absolute -bottom-3 -right-3 w-14 h-14 rounded-[14px] flex items-center justify-center font-boldonse text-[22px] shadow-press",
                tierBadgeClasses,
              )}
              style={{ transform: "rotate(-6deg)" }}
              aria-label={`Tier ${tierKey}`}
            >
              {tierKey}
            </span>
          </div>

          {/* Tier caption + progress */}
          <div className="mt-5 w-[140px]">
            <p className={cn("font-grot font-extrabold text-[15px] text-center", tierNameClass)}>
              {tierName}
            </p>
            <p className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink text-center mt-0.5">
              {percentileLabel}
              {weeklyScore !== 0 && (
                <span className="text-orange">
                  {" · "}
                  {weeklyScore >= 0 ? "+" : ""}
                  {weeklyScore} this wk
                </span>
              )}
            </p>
            {nextTierName ? (
              <>
                <div className="mt-2 h-[6px] rounded-full bg-cream/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange"
                    style={{ width: `${Math.max(3, Math.min(100, progressPct))}%` }}
                  />
                </div>
                <p className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink text-center mt-1.5">
                  {pointsToNextTier} pts to {nextTierName}
                </p>
              </>
            ) : (
              <p className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-orange text-center mt-2">
                top tier reached
              </p>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-boldonse text-[36px] sm:text-[44px] lg:text-[52px] text-cream leading-none">
                  {displayName}
                </h1>
                <span
                  className="inline-flex items-center rounded-lg bg-cream text-ink font-mono-jb font-bold text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 shadow-press"
                  style={{ transform: "rotate(-4deg)" }}
                >
                  VERIFIED ✓
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 font-mono-jb text-[12px] text-cream">
                <span>@{username}</span>
                <span className="text-muted-ink">·</span>
                <span className="text-muted-ink">{headline}</span>
                <span className="text-muted-ink">·</span>
                <span className="text-muted-ink inline-flex items-center gap-1.5">
                  <Doodle.Pin size={11} className="text-orange" />
                  {location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream text-ink font-mono-jb font-bold text-[12px] px-4 py-2 shadow-press hover:translate-y-px transition-transform"
                >
                  <Pencil size={12} /> edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onToggleFollow}
                    disabled={followPending}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full font-mono-jb font-bold text-[12px] px-4 py-2 shadow-press hover:translate-y-px transition-transform disabled:opacity-50",
                      isFollowing
                        ? "bg-ink-2 text-cream border border-cream/20"
                        : "bg-cream text-ink",
                    )}
                  >
                    {followPending ? (
                      "updating…"
                    ) : isFollowing ? (
                      <>
                        <UserCheck size={12} /> following
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} /> + follow
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-transparent text-cream font-mono-jb text-[12px] px-3.5 py-2 border-[1.5px] border-cream/30 hover:border-cream/50 transition-colors"
                  >
                    message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={cn("mt-4 max-w-[680px] font-grot font-medium text-[15px] sm:text-[16px] leading-[1.55] text-cream/85", !bioExpanded && "line-clamp-2")}
          >
            {bio}
          </div>
          {bio.length > 120 && (
            <button
              type="button"
              onClick={onToggleBio}
              className="mt-1 font-mono-jb text-[11px] font-bold text-orange/80 hover:text-orange transition-colors"
            >
              {bioExpanded ? "show less" : "show more"}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 font-mono-jb text-[11px] text-cream">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 underline decoration-dashed underline-offset-[3px] hover:text-orange transition-colors"
            >
              <Doodle.CodeBracket size={11} className="text-orange" />
              github.com/{username}
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 underline decoration-dashed underline-offset-[3px] hover:text-orange transition-colors"
            >
              <Doodle.Pin size={11} className="text-orange" />
              {username}.dev
            </a>
            <span className="text-muted-ink">
              + {mockMutuals.length} mutual builders you both follow
            </span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-cream/10 my-5 sm:my-6" />

      {/* ── Stats sticker row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatSticker label="posts" value={postsLabel} color="cream" tilt={-1.5} />
        <StatSticker
          label="following"
          value={followingCount.toLocaleString()}
          color="peach"
          tilt={1}
          onClick={onOpenFollowing}
        />
        <StatSticker
          label="followers"
          value={followersCount.toLocaleString()}
          color="sage"
          tilt={-1}
          onClick={onOpenFollowers}
        />
        <StatSticker
          label="score"
          value={currentScore.toLocaleString()}
          color="orange"
          tilt={1.2}
        />
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-cream/10 my-5 sm:my-6" />

      {/* ── Tech stack ── */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <Doodle.CodeBracket size={13} className="text-orange" />
        <MonoCaption tone="cream">// stack</MonoCaption>
        <div className="flex-1 h-px bg-cream/10 min-w-[20px]" />
        {isOwnProfile && onEditTech && (
          <button
            type="button"
            onClick={onEditTech}
            className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-cream/60 hover:text-cream transition-colors"
          >
            edit
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topTech.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full bg-orange text-cream font-mono-jb font-medium text-[11px] px-3 py-1"
          >
            {t}
          </span>
        ))}
        {subSkills.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full bg-cream/[0.06] text-cream border border-dashed border-cream/20 font-mono-jb text-[11px] px-3 py-1"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

interface StatStickerProps {
  label: string;
  value: string;
  color: "cream" | "peach" | "sage" | "orange";
  tilt: number;
  onClick?: () => void;
}

const StatSticker = ({ label, value, color, tilt, onClick }: StatStickerProps) => {
  const colorMap: Record<StatStickerProps["color"], string> = {
    cream: "bg-cream text-ink",
    peach: "bg-peach text-ink",
    sage: "bg-sage text-ink",
    orange: "bg-orange text-cream",
  };
  const isOrange = color === "orange";

  const className = cn(
    "rounded-[12px] px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.18)] block text-left w-full",
    colorMap[color],
  );
  const style = { transform: `rotate(${tilt}deg)` };

  const body = (
    <>
      <div className="font-boldonse text-[28px] sm:text-[30px] leading-none">
        {value}
      </div>
      <div
        className={cn(
          "font-mono-jb font-bold uppercase tracking-[0.1em] text-[9px] mt-1.5",
          isOrange ? "text-cream/70" : "text-muted-cream",
        )}
      >
        {label}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {body}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {body}
    </div>
  );
};

export default ProfileIdentityCard;
