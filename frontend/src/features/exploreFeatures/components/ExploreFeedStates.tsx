import { Doodle } from "../../../components/tierd";
import {
  SkeletonFeedCard,
  SkeletonProfileCard as SharedSkeletonProfileCard,
} from "../../../components/ui/loading";

export function SkeletonCard() {
  return <SkeletonFeedCard />;
}

export function SkeletonProfileCard() {
  return <SharedSkeletonProfileCard />;
}

export function EmptyUsers() {
  return (
    <div className="p-8 text-center rounded-[14px] border border-dashed border-cream/15 bg-cream/[0.03]">
      <Doodle.Sparkle size={28} className="text-orange mx-auto mb-3 opacity-70" />
      <p className="font-grot font-extrabold text-[15px] text-cream mb-1">
        No builders yet
      </p>
      <p className="font-mono-jb text-[11px] text-muted-ink">
        New builders will appear here as they join Tierd.
      </p>
    </div>
  );
}

export function EmptyFeed() {
  return (
    <div className="p-14 text-center">
      <Doodle.Sparkle size={30} className="text-orange mx-auto mb-3 opacity-70" />
      <p className="font-grot font-extrabold text-[16px] text-cream mb-1">
        No posts yet
      </p>
      <p className="font-mono-jb text-[12px] text-muted-ink max-w-xs mx-auto leading-[1.6]">
        Be the first to share what you're building.
      </p>
    </div>
  );
}
