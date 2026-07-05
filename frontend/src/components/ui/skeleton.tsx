import type * as React from "react";

import { cn } from "../../lib/utils";

type SkeletonTone = "dark" | "light";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: SkeletonTone;
}

function Skeleton({ className, tone = "dark", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "tierd-skeleton animate-pulse rounded-md",
        tone === "dark"
          ? "bg-cream/[0.07] border border-cream/[0.04]"
          : "bg-ink/[0.08] border border-ink/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
