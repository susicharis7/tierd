import { Doodle } from "../../../components/tierd";

export function SkeletonCard() {
  return (
    <div className="flex gap-3.5 px-6 py-6 animate-pulse">
      <div className="shrink-0 pt-0.5">
        <div className="h-10 w-10 rounded-full bg-cream/[0.08]" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-28 rounded bg-cream/[0.08]" />
          <div className="h-3 w-20 rounded bg-cream/[0.05]" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-cream/[0.05]" />
          <div className="h-3.5 w-[85%] rounded bg-cream/[0.04]" />
        </div>
        <div className="h-48 w-full rounded-2xl bg-cream/[0.03]" />
      </div>
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="animate-pulse rounded-[14px] bg-cream/[0.04] border border-cream/[0.08] p-4">
      <div className="w-11 h-11 rounded-full bg-cream/[0.1] mb-2.5" />
      <div className="h-3 w-20 rounded bg-cream/[0.08]" />
      <div className="h-2.5 w-14 rounded bg-cream/[0.05] mt-1.5" />
      <div className="h-6 w-full rounded-lg bg-cream/[0.04] mt-2.5" />
    </div>
  );
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
