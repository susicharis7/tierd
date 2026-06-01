import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Doodle, MonoCaption, UserAvatar } from "../../../components/tierd";
import { useAuth } from "../../authFeatures/AuthProvider";
import {
  useChallengeDetailQuery,
  useChallengeLeaderboardQuery,
  useChallengeParticipantsQuery,
  useJoinChallengeMutation,
  useMyChallengeParticipationQuery,
} from "../useChallengesData";

function formatCountdown(targetIso: string, now: number): string {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return "-";
  const diff = target - now;
  if (diff <= 0) return "ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function friendlyDifficulty(value: string) {
  return value.replace(/_/g, " ");
}

const ChallengeDetailPageContent = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { userId } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const detailQuery = useChallengeDetailQuery(challengeId ?? null);
  const participantsQuery = useChallengeParticipantsQuery(challengeId ?? null);
  const leaderboardQuery = useChallengeLeaderboardQuery(challengeId ?? null);
  const myParticipationQuery = useMyChallengeParticipationQuery(
    challengeId ?? null,
    userId,
  );
  const joinMutation = useJoinChallengeMutation(userId);

  const challenge = detailQuery.data;
  const participants = participantsQuery.data ?? [];
  const leaderboard = leaderboardQuery.data ?? [];
  const isJoined = Boolean(myParticipationQuery.data);

  const canJoin = Boolean(
    challenge &&
      challenge.phase === "active" &&
      userId &&
      !isJoined &&
      !joinMutation.isPending,
  );

  return (
    <div className="min-h-screen bg-ink text-cream font-grot">
      <Navbar />

      <div className="section-container pt-28 pb-20">
        <Link
          to="/challenges"
          className="inline-flex mb-5 rounded-full border border-cream/20 px-4 py-2 font-mono-jb text-[11px] uppercase tracking-[0.08em] text-cream/80 hover:text-cream"
        >
          back to challenges
        </Link>

        {detailQuery.isPending && (
          <div className="rounded-[18px] border border-ink-line bg-ink-2 p-6 font-mono-jb text-[12px] text-muted-ink">
            loading challenge...
          </div>
        )}

        {!detailQuery.isPending && !challenge && (
          <div className="rounded-[18px] border border-dashed border-cream/20 bg-cream/[0.03] p-8 text-center">
            <p className="font-grot font-extrabold text-[22px] text-cream mb-2">
              Challenge not found
            </p>
            <p className="font-mono-jb text-[12px] text-muted-ink">
              This challenge may have been removed.
            </p>
          </div>
        )}

        {challenge && (
          <>
            <section className="rounded-[20px] border border-ink-line bg-ink-2 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Doodle.Bolt size={14} className="text-orange" />
                    <MonoCaption tone="cream">// CHALLENGE</MonoCaption>
                    <span className="rounded-full border border-cream/20 px-2 py-0.5 font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/80">
                      {challenge.phase}
                    </span>
                  </div>
                  <h1 className="font-boldonse text-[38px] sm:text-[52px] leading-[0.95] text-cream">
                    {challenge.title}
                  </h1>
                  <p className="font-mono-jb text-[13px] text-muted-ink mt-3 leading-[1.7] max-w-[800px]">
                    {challenge.description}
                  </p>
                </div>

                <div className="rounded-[14px] bg-cream/[0.03] border border-cream/15 p-4 min-w-[240px]">
                  <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mb-1">
                    countdown
                  </p>
                  <p className="font-boldonse text-[24px] text-orange">
                    {challenge.phase === "upcoming"
                      ? formatCountdown(challenge.starts_at, now)
                      : formatCountdown(challenge.ends_at, now)}
                  </p>
                  <p className="font-mono-jb text-[11px] text-muted-ink mt-2">
                    {challenge.phase === "upcoming" ? "starts in" : "time left"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <StatCell label="Reward" value={`+${challenge.reward_points}`} />
                <StatCell label="Participants" value={String(challenge.participants_count)} />
                <StatCell label="Category" value={challenge.category} />
                <StatCell label="Difficulty" value={friendlyDifficulty(challenge.difficulty)} />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={!canJoin}
                  onClick={() => challengeId && joinMutation.mutate(challengeId)}
                  className="rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-5 py-2.5 disabled:opacity-50"
                >
                  {isJoined ? "joined" : "join challenge"}
                </button>
                {isJoined && (
                  <span className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-forest">
                    You are in this challenge
                  </span>
                )}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Doodle.Pulse size={14} className="text-orange" />
                  <MonoCaption tone="cream">// PARTICIPANTS</MonoCaption>
                </div>
                <p className="font-mono-jb text-[11px] text-muted-ink mb-4">
                  Everyone currently working on this challenge.
                </p>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {participants.map((row) => (
                    <div
                      key={row.profile_id}
                      className="flex items-center gap-3 rounded-[12px] border border-cream/10 bg-cream/[0.02] px-3 py-2"
                    >
                      <UserAvatar
                        name={row.full_name || row.username || "builder"}
                        src={row.avatar_url}
                        size={30}
                      />
                      <div className="min-w-0">
                        <p className="font-grot font-bold text-[13px] text-cream truncate">
                          {row.full_name || "Builder"}
                        </p>
                        <p className="font-mono-jb text-[10px] text-muted-ink truncate">
                          @{row.username ?? "builder"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="font-mono-jb text-[12px] text-muted-ink">
                      No participants yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Doodle.Trophy size={14} className="text-orange" />
                  <MonoCaption tone="cream">// RANKING</MonoCaption>
                </div>
                <p className="font-mono-jb text-[11px] text-muted-ink mb-4">
                  First place gets +30. Other participants get +10 on completion.
                </p>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {leaderboard.map((row, idx) => (
                    <div
                      key={`${row.profile_id}-${idx}`}
                      className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-[12px] border border-cream/10 bg-cream/[0.02] px-3 py-2"
                    >
                      <span className="font-boldonse text-[16px] text-orange">
                        {String(row.position ?? idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-grot font-bold text-[13px] text-cream truncate">
                          {row.full_name || "Builder"}
                        </p>
                        <p className="font-mono-jb text-[10px] text-muted-ink truncate">
                          @{row.username ?? "builder"}
                        </p>
                      </div>
                      <span className="rounded-md bg-orange/15 text-orange font-mono-jb text-[10px] font-bold px-2 py-1">
                        +{row.awarded_points}
                      </span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="font-mono-jb text-[12px] text-muted-ink">
                      Ranking appears after submissions are scored.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {challenge.rules && (
              <section className="rounded-[18px] bg-ink-2 border border-ink-line p-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Doodle.CodeBracket size={14} className="text-orange" />
                  <MonoCaption tone="cream">// RULES</MonoCaption>
                </div>
                <p className="font-mono-jb text-[13px] text-muted-ink whitespace-pre-line leading-[1.8]">
                  {challenge.rules}
                </p>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-cream/10 bg-cream/[0.02] p-3">
      <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">
        {label}
      </p>
      <p className="font-grot font-extrabold text-[17px] text-cream mt-1 truncate">
        {value}
      </p>
    </div>
  );
}

export default ChallengeDetailPageContent;

