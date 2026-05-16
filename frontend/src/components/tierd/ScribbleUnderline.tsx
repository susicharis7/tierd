import * as React from "react";

import { cn } from "../../lib/utils";

interface ScribbleUnderlineProps extends Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Width in pixels. Default 220. */
  w?: number;
}

/**
 * Hand-drawn squiggle underline for emphasizing words in display headlines.
 * Colored via `currentColor` — wrap or apply Tailwind text utilities
 * (e.g. `text-orange`).
 */
const ScribbleUnderline = React.forwardRef<SVGSVGElement, ScribbleUnderlineProps>(
  ({ w = 220, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={w}
      height={14}
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("text-orange", className)}
      {...props}
    >
      <path
        d="M2 8 C 30 2, 60 12, 90 7 S 150 2, 180 9 S 210 5, 218 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
);
ScribbleUnderline.displayName = "ScribbleUnderline";

export { ScribbleUnderline };
