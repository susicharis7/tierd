import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
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

const TRENDING_ACCENTS = ["text-orange", "text-plum", "text-forest"] as const;

export function ExploreRightSidebar({
  isLoggedIn,
  hasCurrentProfile,
  authLoading,
}: ExploreRightSidebarProps) {
  return (
    <aside className="hidden lg:block space-y-5 lg:sticky lg:top-[160px] self-start">
      <ActivityPanel isLoggedIn={isLoggedIn} />

      {/* Trending repos */}
      <div>
        <div className="flex items-center gap-2.5 mb-3.5">
          <Doodle.Sparkle size={14} className="text-orange" />
          <MonoCaption tone="cream">// trending</MonoCaption>
          <Doodle.ArrowSquiggle w={36} h={14} className="text-orange" />
        </div>
        <div className="flex flex-col gap-2.5">
          {trendingProjects.slice(0, 3).map((p, i) => {
            const accent = TRENDING_ACCENTS[i % TRENDING_ACCENTS.length];
            return (
              <div
                key={p.name}
                className="relative rounded-xl bg-cream/[0.04] border border-cream/[0.08] p-3.5"
              >
                <div
                  className={cn(
                    "absolute top-3.5 right-3.5 font-boldonse text-[13px]",
                    accent,
                  )}
                >
                  0{i + 1}
                </div>
                <p className="font-grot font-extrabold text-[15px] text-cream pr-7 truncate">
                  {p.name}
                </p>
                <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mt-1 truncate">
                  {p.author} · {p.lang}
                </p>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="inline-flex items-center gap-1 font-mono-jb text-[11px] text-cream">
                    <span className={accent}>✦</span> {p.stars}
                  </span>
                  <Doodle.ArrowSquiggle
                    w={28}
                    h={12}
                    className={accent}
                    aria-hidden
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA — only for signed-out / no-profile users */}
      {!hasCurrentProfile && !authLoading && (
        <div className="rounded-xl border border-dashed border-orange/30 bg-orange/[0.05] p-4">
          <p className="font-grot font-extrabold text-[14px] text-cream mb-1">
            Start building your tier
          </p>
          <p className="font-mono-jb text-[11px] text-muted-ink mb-3 leading-[1.5]">
            Create your profile and let your work speak.
          </p>
          <button
            type="button"
            className="w-full rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2.5 shadow-cta-orange hover:translate-y-px transition-transform"
          >
            claim your Tierd.
          </button>
        </div>
      )}

      {/* BiH credit tag */}
      <div className="rounded-xl border border-dashed border-cream/15 px-3.5 py-3 text-center">
        <p className="font-mono-jb text-[10px] text-muted-ink uppercase tracking-[0.1em]">
          made by builders, in BiH 🇧🇦 · v0.3.0
        </p>
      </div>
    </aside>
  );
}
