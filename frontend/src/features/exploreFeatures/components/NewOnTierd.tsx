import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  authorDisplayName,
  authorHandleStr,
  authorInitial,
} from "../exploreAuthorDisplay";
import type { ExploreProfile } from "../exploreTypes";
import { EmptyUsers, SkeletonProfileCard } from "./ExploreFeedStates";

export function NewOnTierd({
  profiles,
  loading,
}: {
  profiles: ExploreProfile[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-ember" />
          <h2 className="font-display text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
            New on Tierd<span className="text-ember">.</span>
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProfileCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-ember" />
          <h2 className="font-display text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
            New on Tierd<span className="text-ember">.</span>
          </h2>
        </div>
        <EmptyUsers />
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-ember" />
          <h2 className="font-display text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
            New on Tierd<span className="text-ember">.</span>
          </h2>
        </div>
        <span className="text-xs text-muted-foreground/45 uppercase tracking-wider">
          Recently joined
        </span>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 scrollbar-thin">
        {profiles.slice(0, 12).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035 }}
          >
            <Link
              to={`/profile/${p.username ?? p.id}`}
              className="group flex min-w-[7.5rem] flex-col items-center gap-2 rounded-xl border border-border/30 bg-muted/5 p-3.5 text-center transition-all hover:border-ember/20 hover:bg-muted/10"
            >
              <Avatar className="h-10 w-10 ring-1 ring-border/30 group-hover:ring-ember/30 transition-all">
                {p.avatar_url && (
                  <AvatarImage src={p.avatar_url} alt={authorDisplayName(p)} />
                )}
                <AvatarFallback className="bg-ember/10 text-ember font-display font-bold text-xs">
                  {authorInitial(p)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 w-full">
                <p className="font-display font-semibold text-xs text-foreground truncate">
                  {authorDisplayName(p)}
                </p>
                <p className="text-xs text-muted-foreground/55 truncate">
                  {authorHandleStr(p.username)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
