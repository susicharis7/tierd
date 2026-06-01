import type { ComponentProps } from "react";

import { Doodle, MonoCaption } from "../../../components/tierd";
import { ExploreComposer } from "./ExploreComposer";
import { ExplorePostsSection } from "./ExplorePostsSection";
import { NewOnTierd } from "./NewOnTierd";

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
    <main className="min-w-0 flex flex-col gap-7">
      <NewOnTierd profiles={profiles} loading={profilesLoading} />

      <ExploreComposer {...composerProps} />

      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <Doodle.Pulse size={14} className="text-orange" />
          <MonoCaption tone="cream">// feed</MonoCaption>
          <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_currentColor] text-forest animate-pulse" />
          <MonoCaption tone="cream" className="text-[9px]">
            LIVE
          </MonoCaption>
          <div className="flex-1 h-px bg-cream/10" />
          <MonoCaption tone="cream" className="text-[9px]">
            FOLLOWING · GLOBAL · BiH
          </MonoCaption>
        </div>

        <ExplorePostsSection {...postsSectionProps} />
      </div>
    </main>
  );
}
