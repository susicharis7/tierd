import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";
import type { CSSProperties } from "react";

type SkeletonTone = "dark" | "light";

export function InlineSpinner({
  className,
  tone = "dark",
  label = "Loading",
}: {
  className?: string;
  tone?: SkeletonTone;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2",
        tone === "dark"
          ? "border-cream/20 border-t-orange"
          : "border-ink/20 border-t-orange",
        className,
      )}
      role="status"
      aria-label={label}
    />
  );
}

export function SkeletonLine({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return <Skeleton tone={tone} className={cn("h-3.5", className)} />;
}

export function SkeletonAvatar({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return <Skeleton tone={tone} className={cn("h-10 w-10 rounded-full", className)} />;
}

export function SkeletonButton({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return <Skeleton tone={tone} className={cn("h-9 w-24 rounded-full", className)} />;
}

export function SkeletonMedia({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: SkeletonTone;
}) {
  return <Skeleton tone={tone} className={cn("h-44 w-full rounded-2xl", className)} />;
}

export function SkeletonStatTile({
  tone = "light",
  className,
  style,
}: {
  tone?: SkeletonTone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] p-5",
        tone === "light" ? "bg-cream" : "bg-cream/[0.04]",
        className,
      )}
      aria-hidden="true"
      style={style}
    >
      <SkeletonLine tone={tone} className="h-9 w-16 rounded-lg" />
      <SkeletonLine tone={tone} className="mt-3 h-2.5 w-20 rounded-full" />
    </div>
  );
}

export function SkeletonCommentRow({
  tone = "dark",
  className,
}: {
  tone?: SkeletonTone;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)} aria-hidden="true">
      <SkeletonAvatar tone={tone} className="h-8 w-8" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonLine tone={tone} className="h-3 w-24" />
          <SkeletonLine tone={tone} className="h-2.5 w-12" />
        </div>
        <SkeletonLine tone={tone} className="h-3 w-full" />
        <SkeletonLine tone={tone} className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonFeedCard({
  className,
  showMedia = true,
}: {
  className?: string;
  showMedia?: boolean;
}) {
  return (
    <div className={cn("flex gap-3.5 px-6 py-6", className)} aria-hidden="true">
      <SkeletonAvatar className="mt-0.5 h-10 w-10" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-3 w-20" />
          <SkeletonLine className="h-3 w-12" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-[86%]" />
          <SkeletonLine className="w-[54%]" />
        </div>
        {showMedia && <SkeletonMedia className="h-48" />}
        <div className="flex gap-2 border-t border-dashed border-ink-line pt-3">
          <SkeletonButton className="h-8 w-16" />
          <SkeletonButton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfileCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-[14px] border border-cream/[0.08] bg-cream/[0.04] p-4", className)}
      aria-hidden="true"
    >
      <SkeletonAvatar className="mb-3 h-11 w-11" />
      <SkeletonLine className="h-3.5 w-24" />
      <SkeletonLine className="mt-2 h-2.5 w-16" />
      <SkeletonButton className="mt-3 h-7 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonLeaderboardRow({
  columns = 6,
  compact = false,
}: {
  columns?: 5 | 6;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-x-4 border-b border-dashed border-cream/[0.06] px-4",
        compact
          ? "grid-cols-[40px_1fr_auto] py-3.5 sm:grid-cols-[60px_1fr_120px_110px_120px]"
          : "grid-cols-[40px_1fr_auto] py-4 sm:grid-cols-[60px_1fr_130px_100px_110px_130px]",
      )}
      aria-hidden="true"
    >
      <SkeletonLine className="h-7 w-9 rounded-lg" />
      <div className="flex min-w-0 items-center gap-3">
        <SkeletonAvatar className="h-9 w-9" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="h-3.5 w-32" />
          <SkeletonLine className="h-2.5 w-20" />
        </div>
      </div>
      <SkeletonLine className="hidden h-3.5 w-16 sm:block" />
      <SkeletonLine className="hidden h-3.5 w-12 sm:block" />
      {columns === 6 && <SkeletonButton className="hidden h-7 w-20 rounded-lg sm:block" />}
      <div className="ml-auto space-y-2">
        <SkeletonLine className="h-4 w-16" />
        <SkeletonLine className="ml-auto h-2.5 w-10" />
      </div>
    </div>
  );
}
