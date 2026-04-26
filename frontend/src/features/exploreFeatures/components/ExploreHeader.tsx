import { motion } from "framer-motion";
import { Search } from "lucide-react";

type ExploreHeaderProps = {
  showSearchResults: boolean;
  profilesCount: number;
  postsCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchLoading: boolean;
};

export function ExploreHeader({
  showSearchResults,
  profilesCount,
  postsCount,
  searchQuery,
  onSearchQueryChange,
  searchLoading,
}: ExploreHeaderProps) {
  return (
    <div className="pt-24 pb-0">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ember/65">
                Developer discovery
              </p>
              <h1 className="font-title font-bold text-3xl sm:text-4xl tracking-tight text-foreground leading-none">
                Explore<span className="text-ember">.</span>
              </h1>
              <p className="text-muted-foreground/60 text-sm mt-1.5 max-w-md">
                Discover builders, see what's shipping, and find who's worth
                following.
              </p>
            </div>
            {!showSearchResults && (
              <div className="flex gap-2 self-start sm:self-auto">
                <span className="rounded-full border border-border/30 bg-muted/10 px-3 py-1 text-xs text-muted-foreground/55">
                  {profilesCount} builders
                </span>
                <span className="rounded-full border border-border/30 bg-muted/10 px-3 py-1 text-xs text-muted-foreground/55">
                  {postsCount} posts
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/30 bg-muted/5 px-4 py-3">
            <Search size={15} className="text-muted-foreground/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search developers by name or handle..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/35 outline-none flex-1"
            />
            {searchLoading && (
              <div className="w-4 h-4 border-2 border-ember/40 border-t-ember rounded-full animate-spin" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
