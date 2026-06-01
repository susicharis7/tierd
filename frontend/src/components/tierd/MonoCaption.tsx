import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const monoCaptionVariants = cva(
  "inline-flex items-center gap-2 font-mono-jb text-[11px] uppercase tracking-[0.12em] leading-[1.4]",
  {
    variants: {
      tone: {
        muted: "text-muted-ink",
        cream: "text-cream",
        orange: "text-orange",
        forest: "text-forest",
        plum: "text-plum",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

interface MonoCaptionProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof monoCaptionVariants> {
  /** Optional leading icon (e.g. <Doodle.Pulse size={11} />). */
  icon?: React.ReactNode;
}

/**
 * The `// section-name` label pattern in JetBrains Mono uppercase. Repeats on
 * every screen as a sectioning device. Children should typically include the
 * leading `// ` slashes (the design system treats them as decorative; consider
 * a screen-reader-only wrapper for the slashes).
 */
const MonoCaption = React.forwardRef<HTMLSpanElement, MonoCaptionProps>(
  ({ className, tone, icon, children, ...props }, ref) => (
    <span ref={ref} className={cn(monoCaptionVariants({ tone }), className)} {...props}>
      {icon}
      {children}
    </span>
  ),
);
MonoCaption.displayName = "MonoCaption";

export { MonoCaption, monoCaptionVariants };
