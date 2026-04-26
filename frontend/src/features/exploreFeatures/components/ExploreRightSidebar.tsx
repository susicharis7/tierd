import { Star, TrendingUp, Users } from "lucide-react";
import { trendingProjects } from "../constants/exploreUIData";
import { ActivityPanel } from "./ExploreSidebarPanels";

type ExploreRightSidebarProps = {
  isLoggedIn: boolean;
  profilesLoading: boolean;
  profilesCount: number;
  postsCount: number;
  hasCurrentProfile: boolean;
  authLoading: boolean;
};

export function ExploreRightSidebar({
  isLoggedIn,
  profilesLoading,
  profilesCount,
  postsCount,
  hasCurrentProfile,
  authLoading,
}: ExploreRightSidebarProps) {
  return (
    <aside className="hidden lg:block space-y-4 sticky top-24">
      {/* Activity */}
      <ActivityPanel isLoggedIn={isLoggedIn} />

      {/* Trending projects */}
      <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/55">
          <TrendingUp size={12} className="text-ember" /> Trending
        </h3>
        <div className="space-y-2.5">
          {trendingProjects.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between group/proj"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover/proj:text-ember">
                  {p.name}
                </p>
                <p className="text-xs text-muted-foreground/45">
                  {p.author} · {p.lang}
                </p>
              </div>
              <span className="ml-2 flex shrink-0 items-center gap-1 text-xs text-muted-foreground/45">
                <Star size={10} className="text-ember/40" /> {p.stars}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community stats */}
      {!profilesLoading && profilesCount > 0 && (
        <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/55">
            <Users size={12} className="text-ember" /> Community
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2.5 rounded-xl bg-muted/8">
              <p className="font-display font-bold text-lg text-foreground">
                {profilesCount}
              </p>
              <p className="text-[10px] text-muted-foreground/45 uppercase tracking-wider">
                Builders
              </p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-muted/8">
              <p className="font-display font-bold text-lg text-foreground">
                {postsCount}
              </p>
              <p className="text-[10px] text-muted-foreground/45 uppercase tracking-wider">
                Posts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {!hasCurrentProfile && !authLoading && (
        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "hsl(var(--ember) / 0.12)",
            background:
              "linear-gradient(135deg, hsl(var(--ember) / 0.04), transparent)",
          }}
        >
          <p className="font-display font-bold text-sm text-foreground mb-1">
            Start building your tier
          </p>
          <p className="text-xs text-muted-foreground/50 mb-3 leading-relaxed">
            Create your profile and let your work speak.
          </p>
          <button className="btn-primary text-xs w-full py-2.5">
            Claim your Tierd.
          </button>
        </div>
      )}
    </aside>
  );
}

