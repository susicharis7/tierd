import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const tapeVariants = cva(
  "absolute pointer-events-none opacity-85 shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
  {
    variants: {
      color: {
        tape: "bg-tape",
        peach: "bg-peach",
        "orange-soft": "bg-orange-soft",
        cream: "bg-cream",
      },
      size: {
        sm: "w-[50px] h-[16px]",
        md: "w-[70px] h-[22px]",
        lg: "w-[90px] h-[26px]",
      },
    },
    defaultVariants: {
      color: "tape",
      size: "md",
    },
  },
);

interface TapeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof tapeVariants> {
  /** Rotation in degrees. Default 0. */
  tilt?: number;
}

/**
 * Decorative masking-tape strip. Absolutely positioned — pass Tailwind
 * positioning utilities via `className` (e.g. `top-[-10px] left-10`).
 */
const Tape = React.forwardRef<HTMLDivElement, TapeProps>(
  ({ className, color, size, tilt, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(tapeVariants({ color, size }), className)}
      style={tilt !== undefined ? { transform: `rotate(${tilt}deg)`, ...style } : style}
      {...props}
    />
  ),
);
Tape.displayName = "Tape";

export { Tape, tapeVariants };
