import { Link } from "react-router-dom";

import {
  Doodle,
  MonoCaption,
  Sticker,
  Tape,
  UserAvatar,
} from "../../../components/tierd";
import { SkeletonLine } from "../../../components/ui/loading";
import { toast } from "../../../components/ui/sonner";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import { cn } from "../../../lib/utils";
import { useProfileProgressQuery } from "../../rankingFeatures/useRankingData";
import { myCommunities, recentActivity } from "../constants/exploreUIData";

const COMMUNITY_ACCENTS = [
  "bg-orange",
  "bg-plum",
  "bg-forest",
  "bg-orange-2",
] as const;

export function MiniProfileCard({
  profile,
  userId,
}: {
  profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  userId: string | null;
}) {
  // Pull live stats (followers/following/score) for the signed-in user.
  // Falls back to graceful zeros while loading.
  const progressQuery = useProfileProgressQuery(userId);
  const progress = progressQuery.data;
  const showStatsSkeleton = useDelayedPending(progressQuery.isPending);

  const name = profile?.full_name?.trim() || "Your Name";
  const handle = profile?.username?.trim()
    ? `@${profile.username}`
    : "@handle";
  const profileHref = `/profile/${profile?.username ?? userId}`;

  return (
    <Sticker
      color="cream"
      tilt={-1}
      padding="lg"
      radius="lg"
      className="relative"
    >
      <Tape color="tape" size="md" tilt={-6} className="-top-[10px] left-14" />

      <div className="flex items-center gap-3.5 mb-4">
        <Link to={profileHref}>
          <UserAvatar name={name} src={profile?.avatar_url} size={56} />
        </Link>
        <div className="min-w-0">
          <Link to={profileHref}>
            <p className="font-grot font-extrabold text-[18px] text-ink truncate hover:text-orange transition-colors">
              {name}
            </p>
          </Link>
          <p className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-cream mt-1 truncate">
            {handle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {showStatsSkeleton ? (
          <>
            <StatCellSkeleton />
            <StatCellSkeleton />
            <StatCellSkeleton />
          </>
        ) : (
          <>
            <StatCell
              value={progress?.followingCount ?? 0}
              label="following"
            />
            <StatCell
              value={progress?.followersCount ?? 0}
              label="followers"
            />
            <StatCell
              value={progress?.totalScore ?? 0}
              label="score"
              accent
            />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          to={profileHref}
          className="flex-1 text-center rounded-[10px] bg-ink text-cream font-mono-jb font-bold text-[12px] px-3 py-2.5 shadow-press hover:translate-y-px transition-transform"
        >
          my profile →
        </Link>
        <button
          type="button"
          className="rounded-[10px] border-[1.5px] border-ink text-ink font-mono-jb font-bold text-[12px] px-3 py-2.5 hover:bg-ink/5 transition-colors"
          aria-label="More"
        >
          <Doodle.Asterisk size={14} className="text-ink" />
        </button>
      </div>
    </Sticker>
  );
}

function StatCellSkeleton() {
  return (
    <div aria-hidden="true">
      <SkeletonLine tone="light" className="h-5 w-10" />
      <SkeletonLine tone="light" className="mt-2 h-2.5 w-14" />
    </div>
  );
}

function StatCell({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="text-left">
      <div
        className={cn(
          "font-grot font-extrabold text-[18px] leading-none",
          accent ? "text-orange" : "text-ink",
        )}
      >
        {value.toLocaleString()}
      </div>
      <div className="font-mono-jb text-[10px] uppercase tracking-[0.06em] text-muted-cream mt-1">
        {label}
      </div>
    </div>
  );
}

export function CommunitiesPanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-[14px] border border-dashed border-cream/20 bg-cream/[0.03] p-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10">
          <Doodle.CodeBracket size={16} className="text-cream/40" />
        </div>
        <MonoCaption tone="cream" className="mb-1.5">
          // communities
        </MonoCaption>
        <p className="font-mono-jb text-[11px] text-muted-ink mb-3 leading-[1.6]">
          Log in to discover developer communities.
        </p>
        <button
          type="button"
          className="w-full rounded-[10px] border border-orange/25 bg-orange/[0.08] py-2 font-mono-jb text-[12px] font-bold text-orange transition-colors hover:bg-orange/15"
          onClick={() => toast("Use the Log in button in the top-right.")}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3.5">
        <Doodle.CodeBracket size={14} className="text-orange" />
        <MonoCaption tone="cream">// communities</MonoCaption>
        <div className="flex-1 h-px bg-cream/10" />
        <MonoCaption tone="cream" className="text-cream">
          {myCommunities.length}
        </MonoCaption>
      </div>
      <div className="flex flex-col gap-2">
        {myCommunities.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-cream/[0.04] border border-cream/[0.08] group cursor-pointer hover:border-cream/20 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-cream font-boldonse text-[13px] shrink-0",
                  COMMUNITY_ACCENTS[i % COMMUNITY_ACCENTS.length],
                )}
              >
                {c.name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-mono-jb text-[12px] font-semibold text-cream truncate">
                  {c.name}
                </p>
                <p className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink mt-0.5">
                  <span className={c.active ? "text-forest" : "text-tape"}>●</span>{" "}
                  {c.members.toLocaleString()} members
                </p>
              </div>
            </div>
            <Doodle.Plus size={11} className="text-cream/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, string> = {
  follow: "+",
  like: "♥",
  comment: "\"",
};

const ACTIVITY_BORDER: Record<string, string> = {
  follow: "border-forest",
  like: "border-orange",
  comment: "border-orange-2",
};

export function ActivityPanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-[14px] border border-dashed border-cream/20 bg-cream/[0.03] p-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10">
          <Doodle.Pulse size={16} className="text-cream/40" />
        </div>
        <MonoCaption tone="cream" className="mb-1.5">
          // activity
        </MonoCaption>
        <p className="font-mono-jb text-[11px] text-muted-ink leading-[1.6]">
          Sign in to see what builders are up to.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3.5">
        <Doodle.Pulse size={14} className="text-orange" />
        <MonoCaption tone="cream">// activity</MonoCaption>
        <div className="flex-1 h-px bg-cream/10" />
      </div>
      <div className="rounded-[14px] bg-cream/[0.04] border border-cream/[0.08] p-1.5">
        {recentActivity.map((a, i) => {
          const isLast = i === recentActivity.length - 1;
          return (
            <div
              key={`${a.user}-${i}`}
              className={cn(
                "flex gap-2.5 px-3 py-3 items-start",
                !isLast && "border-b border-dashed border-cream/[0.08]",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg bg-orange/15 flex items-center justify-center text-cream text-[13px] shrink-0 border",
                  ACTIVITY_BORDER[a.type] ?? "border-orange",
                )}
              >
                {ACTIVITY_ICONS[a.type] ?? "↑"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono-jb text-[12px] text-cream leading-[1.4]">
                  <b className="font-bold">{a.user}</b>{" "}
                  <span className="text-muted-ink">{a.action}</span>
                </p>
                <p className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink mt-1">
                  {a.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
