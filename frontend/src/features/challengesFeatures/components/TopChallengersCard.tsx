import {
  Doodle,
  MonoCaption,
  UserAvatar,
} from "../../../components/tierd";
import {
  SkeletonAvatar,
  SkeletonLine,
} from "../../../components/ui/loading";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import { cn } from "../../../lib/utils";
import { useTopChallengersQuery } from "../../rankingFeatures/useRankingData";

interface TopChallengersCardProps {
  limit?: number;
}

const TopChallengersCard = ({ limit = 5 }: TopChallengersCardProps) => {
  const query = useTopChallengersQuery(limit);
  const challengers = query.data ?? [];
  const showSkeleton = useDelayedPending(query.isPending && challengers.length === 0);

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Doodle.Trophy size={16} className="text-orange" />
        <MonoCaption tone="cream">// TOP CHALLENGERS</MonoCaption>
      </div>

      {showSkeleton && (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine className="h-5 w-[22px]" />
              <SkeletonAvatar className="h-8 w-8" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonLine className="h-3.5 w-28" />
                <SkeletonLine className="h-2.5 w-36" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!query.isPending && challengers.length === 0 && (
        <p className="font-mono-jb text-[12px] text-muted-ink py-2">
          No challenge wins yet. Be the first.
        </p>
      )}

      <div className="space-y-3">
        {!showSkeleton && challengers.map((u, i) => (
          <div key={u.profileId} className="flex items-center gap-3">
            <span
              className={cn(
                "font-boldonse text-[15px] min-w-[22px]",
                i < 3 ? "text-orange" : "text-muted-ink",
              )}
            >
              {String(u.rank).padStart(2, "0")}
            </span>
            <UserAvatar
              name={u.fullName || u.username}
              src={u.avatarUrl}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <p className="font-grot font-bold text-[14px] text-cream truncate">
                {u.fullName}
              </p>
              <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">
                {u.winsCount} wins | {u.totalAwardedPoints.toLocaleString()} pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopChallengersCard;
