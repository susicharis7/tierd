import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const stickerVariants = cva(
  "relative rounded-[14px] shadow-sticker transition-transform duration-200",
  {
    variants: {
      color: {
        cream: "bg-cream text-ink",
        peach: "bg-peach text-ink",
        orange: "bg-orange text-cream",
        sage: "bg-sage text-ink",
        tape: "bg-tape text-ink",
        plum: "bg-plum text-cream",
        forest: "bg-forest text-cream",
        dark: "bg-ink-2 text-cream border border-ink-line",
      },
      padding: {
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
        xl: "p-7",
        none: "p-0",
      },
      radius: {
        sm: "rounded-[10px]",
        md: "rounded-[14px]",
        lg: "rounded-[18px]",
        xl: "rounded-[22px]",
        "2xl": "rounded-[24px]",
      },
    },
    defaultVariants: {
      color: "cream",
      padding: "md",
      radius: "md",
    },
  },
);

interface StickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof stickerVariants> {
  /**
   * Rotation in degrees (-2 to +2 by convention). Pass a stable per-id value
   * (see `tiltFromId`) so the wobble doesn't change on every render.
   * Halve the range on mobile.
   */
  tilt?: number;
  asChild?: boolean;
}

/**
 * The signature primitive of the Studio Notebook redesign — a tinted card
 * with rounded corners, a slight tilt, and the 3-layer signature shadow.
 * Use `tiltFromId(item.id)` for feed-style lists so the rotation is stable.
 */
const Sticker = React.forwardRef<HTMLDivElement, StickerProps>(
  ({ className, color, padding, radius, tilt, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stickerVariants({ color, padding, radius }), className)}
      style={tilt !== undefined ? { transform: `rotate(${tilt}deg)`, ...style } : style}
      {...props}
    >
      {children}
    </div>
  ),
);
Sticker.displayName = "Sticker";

export { Sticker, stickerVariants };
