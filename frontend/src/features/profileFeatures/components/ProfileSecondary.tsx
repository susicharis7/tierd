import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import {
  BADGE_BG,
  BADGE_TILTS,
  PROJECT_ACCENT_BG,
  mockProjects,
  profileBadges,
} from "../profileData";

interface ProfileSecondaryProps {
  postsLabel: string;
  followersCount: number;
  followingCount: number;
  currentScore: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

/**
 * Left-rail content above the posts list. Three stacked sections:
 *   1. Sticker stats row (posts / following / followers / score)
 *   2. Badges sticker book (6 earned badges)
 *   3. Pinned projects (full-width cards)
 */
const ProfileSecondary = ({
  postsLabel,
  followersCount,
  followingCount,
  currentScore,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileSecondaryProps) => {
  return (
    <div className="space-y-6">
      <StatsRow
        postsLabel={postsLabel}
        followersCount={followersCount}
        followingCount={followingCount}
        currentScore={currentScore}
        onOpenFollowers={onOpenFollowers}
        onOpenFollowing={onOpenFollowing}
      />
      <BadgesCard />
      <ProjectsSection />
    </div>
  );
};

interface StatsRowProps {
  postsLabel: string;
  followersCount: number;
  followingCount: number;
  currentScore: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

const StatsRow = ({
  postsLabel,
  followersCount,
  followingCount,
  currentScore,
  onOpenFollowers,
  onOpenFollowing,
}: StatsRowProps) => (
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
);

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
    "rounded-[14px] px-5 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.2)] block text-left w-full",
    colorMap[color],
  );
  const style = { transform: `rotate(${tilt}deg)` };

  const body = (
    <>
      <div className="font-boldonse text-[32px] sm:text-[38px] leading-none">
        {value}
      </div>
      <div
        className={cn(
          "font-mono-jb font-bold uppercase tracking-[0.1em] text-[9px] mt-2",
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

const BadgesCard = () => (
  <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-5 sm:p-6">
    <div className="flex items-center gap-2.5 mb-4 flex-wrap">
      <Doodle.Trophy size={14} className="text-orange" />
      <MonoCaption tone="cream">
        // badges · {String(profileBadges.length).padStart(2, "0")} earned
      </MonoCaption>
      <Doodle.ArrowSquiggle w={40} h={14} className="text-orange" />
      <div className="flex-1" />
      <MonoCaption tone="cream" className="text-[9px]">
        view all
      </MonoCaption>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {profileBadges.map((b, i) => {
        const lightBg = b.accent === "tape" || b.accent === "sage";
        return (
          <div
            key={b.label}
            className={cn(
              "rounded-[14px] px-3 py-3.5 text-center cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.15)]",
              BADGE_BG[b.accent],
            )}
            style={{ transform: `rotate(${BADGE_TILTS[i % BADGE_TILTS.length]}deg)` }}
          >
            <div className="text-[24px] leading-none mb-1.5">{b.glyph}</div>
            <div className="font-grot font-extrabold text-[11px] leading-[1.2]">
              {b.label}
            </div>
            <div
              className={cn(
                "font-mono-jb text-[8px] uppercase tracking-[0.06em] mt-1",
                lightBg ? "text-muted-cream" : "text-cream/70",
              )}
            >
              {b.earned}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const ProjectsSection = () => (
  <section>
    <div className="flex items-center gap-2.5 mb-4">
      <Doodle.CodeBracket size={14} className="text-orange" />
      <MonoCaption tone="cream">// pinned projects</MonoCaption>
      <div className="flex-1 h-px bg-cream/10" />
      <MonoCaption tone="cream" className="text-[9px]">
        {mockProjects.length} of 12
      </MonoCaption>
    </div>
    <div className="flex flex-col gap-2.5">
      {mockProjects.map((p) => {
        const lightAccent = p.accent === "tape" || p.accent === "sage";
        return (
          <div
            key={p.name}
            className="rounded-[14px] bg-ink-2 border border-ink-line p-4 sm:p-[18px] flex items-center gap-4"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-[12px] flex items-center justify-center font-boldonse text-[20px] shrink-0",
                PROJECT_ACCENT_BG[p.accent],
                lightAccent ? "text-ink" : "text-cream",
              )}
            >
              {p.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-grot font-extrabold text-[16px] text-cream truncate">
                  {p.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/[0.05] border border-cream/15 font-mono-jb text-[9px] text-cream/85 px-2 py-0.5">
                  <span
                    className={cn(
                      "w-[5px] h-[5px] rounded-full",
                      PROJECT_ACCENT_BG[p.accent],
                    )}
                  />
                  {p.lang}
                </span>
                {p.featured && (
                  <span className="rounded-md bg-orange/15 text-orange border border-orange/30 font-mono-jb text-[9px] font-bold px-1.5 py-0.5">
                    featured
                  </span>
                )}
              </div>
              <p className="font-mono-jb text-[11px] text-muted-ink mt-1 leading-[1.5] truncate">
                {p.desc}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 font-mono-jb text-[12px] text-cream">
                <span className="text-orange">✦</span> {p.stars}
              </span>
              <Doodle.ArrowSquiggle w={30} h={12} className="text-orange" />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default ProfileSecondary;
