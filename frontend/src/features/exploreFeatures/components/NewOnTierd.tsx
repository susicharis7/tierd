import { Link } from "react-router-dom";

import { Doodle, MonoCaption, UserAvatar } from "../../../components/tierd";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import {
  authorDisplayName,
  authorHandleStr,
} from "../exploreAuthorDisplay";
import type { ExploreProfile } from "../exploreTypes";
import { EmptyUsers, SkeletonProfileCard } from "./ExploreFeedStates";

const CARD_TILTS = [-1, 1, -0.5, 0.8, -1.2];

export function NewOnTierd({
  profiles,
  loading,
}: {
  profiles: ExploreProfile[];
  loading: boolean;
}) {
  const showSkeleton = useDelayedPending(loading && profiles.length === 0);

  return (
    <section aria-busy={loading}>
      <Header />

      {showSkeleton ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonProfileCard key={i} />
          ))}
        </div>
      ) : loading && profiles.length === 0 ? (
        <div className="min-h-[136px]" aria-hidden />
      ) : profiles.length === 0 ? (
        <EmptyUsers />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {profiles.slice(0, 5).map((p, i) => (
            <Link
              key={p.id}
              to={`/profile/${p.username ?? p.id}`}
              className="relative rounded-[14px] bg-cream/[0.04] border border-cream/[0.08] p-4 hover:border-cream/20 transition-colors group block"
              style={{ transform: `rotate(${CARD_TILTS[i % CARD_TILTS.length]}deg)` }}
            >
              <UserAvatar
                name={authorDisplayName(p)}
                src={p.avatar_url}
                size={44}
                className="mb-2.5"
              />
              <p className="font-grot font-bold text-[13px] text-cream leading-[1.2] truncate">
                {authorDisplayName(p)}
              </p>
              <p className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink mt-1 truncate">
                {authorHandleStr(p.username)}
              </p>
              <button
                type="button"
                className="mt-2.5 w-full rounded-lg border border-dashed border-cream/30 font-mono-jb font-bold text-[10px] text-cream py-1.5 group-hover:border-cream/50 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                + follow
              </button>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between gap-2 mb-3.5">
      <div className="flex items-center gap-2.5">
        <Doodle.Sparkle size={16} className="text-orange" />
        <MonoCaption tone="cream">
          NEW ON TIERD<span className="text-orange">.</span>
        </MonoCaption>
        <Doodle.ArrowSquiggle w={50} h={18} className="text-orange" />
      </div>
      <MonoCaption tone="cream" className="text-[9px] hidden sm:inline-flex">
        RECENTLY JOINED — SCROLL →
      </MonoCaption>
    </div>
  );
}
