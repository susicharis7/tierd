import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { MonoCaption, UserAvatar } from "../../../components/tierd";
import {
  SkeletonAvatar,
  SkeletonLine,
} from "../../../components/ui/loading";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import { timeAgo } from "../../../lib/utils";
import {
  authorDisplayName,
  authorHandleStr,
} from "../exploreAuthorDisplay";
import type { ExploreProfile } from "../exploreTypes";

type ExploreSearchResultsProps = {
  searchLoading: boolean;
  searchQuery: string;
  searchResults?: ExploreProfile[];
};

export function ExploreSearchResults({
  searchLoading,
  searchQuery,
  searchResults,
}: ExploreSearchResultsProps) {
  const count = (searchResults ?? []).length;
  const showSkeleton = useDelayedPending(searchLoading && !searchResults);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto mb-8 max-w-3xl"
    >
      <MonoCaption tone="muted" className="mb-3">
        {searchLoading
          ? "searching…"
          : `${count} result${count !== 1 ? "s" : ""} for "${searchQuery}"`}
      </MonoCaption>

      {showSkeleton ? (
        <div className="grid sm:grid-cols-2 gap-3" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-dashed border-cream/15 bg-cream/[0.03] p-4"
            >
              <SkeletonAvatar className="h-10 w-10" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonLine className="h-3.5 w-28" />
                <SkeletonLine className="h-2.5 w-40 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {searchResults.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/profile/${p.username ?? p.id}`}
                className="flex items-center gap-3 rounded-xl border border-dashed border-cream/15 bg-cream/[0.03] p-4 transition-colors hover:border-cream/30 hover:bg-cream/[0.06]"
              >
                <UserAvatar
                  name={authorDisplayName(p)}
                  src={p.avatar_url}
                  size={40}
                />
                <div className="min-w-0">
                  <p className="font-grot font-bold text-[14px] text-cream truncate">
                    {authorDisplayName(p)}
                  </p>
                  <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink truncate">
                    {authorHandleStr(p.username)} · joined {timeAgo(p.created_at)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : searchResults && searchResults.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-cream/15 bg-cream/[0.03]">
          <p className="font-mono-jb text-[13px] text-muted-ink">
            No developers found for "{searchQuery}"
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}
