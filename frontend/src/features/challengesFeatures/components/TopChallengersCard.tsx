import {
  Doodle,
  MonoCaption,
  UserAvatar,
} from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { useTopChallengersQuery } from "../../rankingFeatures/useRankingData";

interface TopChallengersCardProps {
  limit?: number;
}

/**
 * Sidebar card listing top challenge winners. Pulls from the
 * `challenge_top_challengers` view via `useTopChallengersQuery`.
 */
const TopChallengersCard = ({ limit = 5 }: TopChallengersCardProps) => {
  const query = useTopChallengersQuery(limit);
  const challengers = query.data ?? [];

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Doodle.Trophy size={16} className="text-orange" />
        <MonoCaption tone="cream">// TOP CHALLENGERS</MonoCaption>
      </div>

      {query.isPending && (
        <p className="font-mono-jb text-[12px] text-muted-ink py-2">
          Loading top challengers…
        </p>
      )}

      {!query.isPending && challengers.length === 0 && (
        <p className="font-mono-jb text-[12px] text-muted-ink py-2">
          No challenge wins yet. Be the first.
        </p>
      )}

      <div className="space-y-3">
        {challengers.map((u, i) => (
          <div key={u.profileId} className="flex items-center gap-3">
            <span
              className={cn(
                "font-boldonse text-[15px] min-w-[22px]",
                i < 3 ? "text-orange" : "text-muted-ink",
              )}
            >
              0{u.rank}
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
                {u.winsCount} wins · {u.totalAwardedPoints.toLocaleString()} pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopChallengersCard;
