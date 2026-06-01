import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

export type Tier = "T0" | "T1" | "T2" | "T3" | "UNRANKED";

const tierBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-mono-jb font-bold uppercase tracking-[0.08em]",
  {
    variants: {
      tier: {
        T0: "bg-ink-2 text-orange border-[1.5px] border-dashed border-orange",
        T1: "bg-orange text-cream",
        T2: "bg-transparent text-orange border-[1.5px] border-orange",
        T3: "bg-transparent text-orange border-[1.5px] border-orange/60",
        UNRANKED: "bg-transparent text-muted-ink border border-muted-ink/40",
      },
      size: {
        sm: "text-[9px] px-[6px] py-[2px]",
        md: "text-[11px] px-2.5 py-[3px]",
        lg: "text-[13px] px-3 py-[5px]",
      },
    },
    defaultVariants: {
      tier: "T1",
      size: "md",
    },
  },
);

interface TierBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tierBadgeVariants> {
  label?: string;
}

const TierBadge = React.forwardRef<HTMLSpanElement, TierBadgeProps>(
  ({ className, tier = "T1", size, label, children, ...props }, ref) => {
    const display = label ?? (tier === "UNRANKED" ? "UNRANKED" : tier);
    return (
      <span
        ref={ref}
        className={cn(tierBadgeVariants({ tier, size }), className)}
        {...props}
      >
        {tier === "T0" && <span aria-hidden>LOCK</span>}
        {display}
        {children}
      </span>
    );
  },
);
TierBadge.displayName = "TierBadge";

export { TierBadge, tierBadgeVariants };
