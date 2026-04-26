import { Sparkles, Users } from "lucide-react";

export function SkeletonCard() {
  return (
    <div className="flex gap-3.5 px-5 py-5 animate-pulse">
      <div className="shrink-0 pt-0.5">
        <div className="h-11 w-11 rounded-full bg-muted/40" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-28 rounded bg-muted/40" />
          <div className="h-3 w-20 rounded bg-muted/25" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-muted/25" />
          <div className="h-3.5 w-[85%] rounded bg-muted/20" />
        </div>
        <div className="h-48 w-full rounded-2xl bg-muted/15" />
      </div>
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="min-w-[8.125rem] animate-pulse flex flex-col items-center gap-2.5 rounded-xl border border-border/30 bg-muted/8 p-4">
      <div className="w-12 h-12 rounded-full bg-muted/40" />
      <div className="h-3 w-20 rounded bg-muted/35" />
      <div className="h-2.5 w-14 rounded bg-muted/25" />
    </div>
  );
}

export function EmptyUsers() {
  return (
    <div className="p-8 text-center">
      <Users size={28} className="text-ember mx-auto mb-3 opacity-60" />
      <p className="font-display font-semibold text-sm text-foreground mb-1">
        No builders yet
      </p>
      <p className="text-xs text-muted-foreground">
        New builders will appear here as they join Tierd.
      </p>
    </div>
  );
}

export function EmptyFeed() {
  return (
    <div className="p-14 text-center">
      <Sparkles size={30} className="text-ember mx-auto mb-3 opacity-60" />
      <p className="font-display font-semibold text-sm text-foreground mb-1">
        No posts yet
      </p>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        Be the first to share what you're building.
      </p>
    </div>
  );
}
