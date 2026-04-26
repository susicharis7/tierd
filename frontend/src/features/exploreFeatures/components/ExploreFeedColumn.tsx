import type { ComponentProps } from "react";
import { TrendingUp } from "lucide-react";
import { NewOnTierd } from "./NewOnTierd";
import { ExploreComposer } from "./ExploreComposer";
import { ExplorePostsSection } from "./ExplorePostsSection";

type ExploreFeedColumnProps = {
  profiles: ComponentProps<typeof NewOnTierd>["profiles"];
  profilesLoading: boolean;
  composerProps: ComponentProps<typeof ExploreComposer>;
  postsSectionProps: ComponentProps<typeof ExplorePostsSection>;
};

export function ExploreFeedColumn({
  profiles,
  profilesLoading,
  composerProps,
  postsSectionProps,
}: ExploreFeedColumnProps) {
  return (
    <main className="min-w-0">
      <NewOnTierd profiles={profiles} loading={profilesLoading} />

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-xs text-muted-foreground/60 uppercase tracking-[0.15em] flex items-center gap-2">
          <TrendingUp size={13} className="text-ember" /> Feed
        </h2>
        <span className="text-xs uppercase tracking-wider text-muted-foreground/35">
          live
        </span>
      </div>

      <ExploreComposer {...composerProps} />
      <ExplorePostsSection {...postsSectionProps} />
    </main>
  );
}
