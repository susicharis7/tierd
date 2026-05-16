import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const stickerBadgeVariants = cva(
  "inline-flex items-center gap-2 font-mono-jb font-bold uppercase tracking-[0.1em] text-[12px] px-[14px] py-[8px] rounded-[10px] shadow-[0_3px_0_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.15)]",
  {
    variants: {
      color: {
        orange: "bg-orange text-cream",
        cream: "bg-cream text-ink",
        forest: "bg-forest text-cream",
        plum: "bg-plum text-cream",
        tape: "bg-tape text-ink",
        peach: "bg-peach text-ink",
        dark: "bg-ink-2 text-cream",
        sage: "bg-sage text-ink",
      },
    },
    defaultVariants: {
      color: "orange",
    },
  },
);

interface StickerBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof stickerBadgeVariants> {
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Rotation in degrees. Default 0. */
  tilt?: number;
}

/**
 * Small sticker-style label used as a section kicker. Slight tilt baked in
 * when `tilt` is provided.
 *
 *   <StickerBadge color="orange" tilt={-2} icon={<Doodle.Bolt size={11} />}>
 *     FEATURED
 *   </StickerBadge>
 */
const StickerBadge = React.forwardRef<HTMLSpanElement, StickerBadgeProps>(
  ({ className, color, tilt, icon, style, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(stickerBadgeVariants({ color }), className)}
      style={tilt !== undefined ? { transform: `rotate(${tilt}deg)`, ...style } : style}
      {...props}
    >
      {icon}
      {children}
    </span>
  ),
);
StickerBadge.displayName = "StickerBadge";

export { StickerBadge, stickerBadgeVariants };
