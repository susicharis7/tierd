import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { timeAgo } from "../../../lib/utils";
import {
  authorDisplayName,
  authorHandleStr,
  authorInitial,
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto mb-8 max-w-3xl"
    >
      <p className="text-xs text-muted-foreground/50 mb-3">
        {searchLoading
          ? "Searching..."
          : `${(searchResults ?? []).length} result${(searchResults ?? []).length !== 1 ? "s" : ""} for "${searchQuery}"`}
      </p>

      {searchResults && searchResults.length > 0 ? (
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
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/5 p-4 transition-all hover:border-ember/20 hover:bg-muted/10"
              >
                <Avatar className="h-10 w-10">
                  {p.avatar_url && (
                    <AvatarImage src={p.avatar_url} alt={authorDisplayName(p)} />
                  )}
                  <AvatarFallback className="bg-ember/10 text-ember font-display font-bold text-xs">
                    {authorInitial(p)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-foreground truncate">
                    {authorDisplayName(p)}
                  </p>
                  <p className="text-xs text-muted-foreground/50 truncate">
                    {authorHandleStr(p.username)} · Joined {timeAgo(p.created_at)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : searchResults && searchResults.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-border/20 bg-muted/3">
          <p className="text-sm text-muted-foreground/50">
            No developers found for "{searchQuery}"
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

