import * as React from "react";

/**
 * Studio Notebook doodle library — hand-drawn SVG icons that live in negative
 * space across the redesign. All use `currentColor` by default so you can
 * color them with Tailwind text utilities (e.g. `text-orange`).
 *
 * Two flavors:
 *   - Square icons: take `size` (px, default 16).
 *   - Free-form icons (Mountains, ArrowSquiggle, Squiggle): take `w`/`h`.
 *
 * Usage:
 *   <Doodle.Asterisk size={48} className="text-orange" />
 *   <Doodle.Mountains w={400} h={150} className="text-orange/20" />
 */

type SvgBase = Omit<React.SVGProps<SVGSVGElement>, "width" | "height">;

interface IconProps extends SvgBase {
  size?: number;
}

interface RectIconProps extends SvgBase {
  w?: number;
  h?: number;
}

interface DotsProps extends SvgBase {
  rows?: number;
  cols?: number;
  size?: number;
  gap?: number;
}

interface CornerProps extends SvgBase {
  size?: number;
  corner?: "tl" | "tr" | "bl" | "br";
}

const Star = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 2v8M12 14v8M2 12h8M14 12h8M4.5 4.5l5.5 5.5M14 14l5.5 5.5M4.5 19.5l5.5-5.5M14 10l5.5-5.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const Asterisk = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 3v18M5 6l14 12M5 18L19 6M3 12h18"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const Sparkle = ({ size = 18, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
  </svg>
);

const Bolt = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M13 2L4 14h6l-2 8 10-12h-6l2-8z" />
  </svg>
);

const Heart = ({ size = 14, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 21s-7-4.5-9.5-9C0 8 3 4 6.5 4 9 4 11 5.5 12 7c1-1.5 3-3 5.5-3C21 4 24 8 21.5 12c-2.5 4.5-9.5 9-9.5 9z" />
  </svg>
);

const Trophy = ({ size = 18, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M7 4h10v4a5 5 0 11-10 0V4z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M5 6H3v2a3 3 0 003 3M19 6h2v2a3 3 0 01-3 3M9 14h6l-1 4h-4l-1-4zM8 20h8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Shield = ({ size = 20, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 2 L4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 12l2.5 2.5L15.5 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Pulse = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M3 12h4l2-7 4 14 2-7h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CodeBracket = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M8 4l-6 8 6 8M16 4l6 8-6 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Search = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Pin = ({ size = 16, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2C7.5 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-2.5-7-7-7zm0 10a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);

const GridIcon = ({ size = 20, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const Plus = ({ size = 14, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden {...props}>
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CornerBracket = ({ size = 18, corner = "tl", ...props }: CornerProps) => {
  const paths: Record<NonNullable<CornerProps["corner"]>, string> = {
    tl: "M2 8 V2 H8",
    tr: "M16 8 V2 H10",
    bl: "M2 10 V16 H8",
    br: "M16 10 V16 H10",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden {...props}>
      <path
        d={paths[corner]}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ArrowSquiggle = ({ w = 80, h = 30, ...props }: RectIconProps) => (
  <svg width={w} height={h} viewBox="0 0 80 30" fill="none" aria-hidden {...props}>
    <path
      d="M2 15 C 10 5, 20 25, 30 15 S 50 5, 60 15 S 75 22, 78 15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M70 9 L78 15 L70 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const Squiggle = ({ w = 120, h = 12, ...props }: RectIconProps) => (
  <svg
    width={w}
    height={h}
    viewBox="0 0 120 12"
    fill="none"
    preserveAspectRatio="none"
    aria-hidden
    {...props}
  >
    <path
      d="M2 6 Q 12 1, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 118 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Mountains = ({ w = 200, h = 80, ...props }: RectIconProps) => (
  <svg width={w} height={h} viewBox="0 0 200 80" fill="none" aria-hidden {...props}>
    <path
      d="M0 70 L40 30 L60 50 L90 15 L130 55 L160 25 L200 70 Z"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinejoin="round"
    />
    <circle cx="90" cy="15" r="2.5" fill="currentColor" />
  </svg>
);

const Dots = ({ rows = 3, cols = 6, size = 3, gap = 8, ...props }: DotsProps) => (
  <svg width={cols * gap} height={rows * gap} aria-hidden {...props}>
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((_, c) => (
        <circle
          key={`${r}-${c}`}
          cx={c * gap + size / 2}
          cy={r * gap + size / 2}
          r={size / 2}
          fill="currentColor"
        />
      )),
    )}
  </svg>
);

/**
 * Aggregate namespace export — matches the handoff's call sites
 * (`<Doodle.Asterisk />`). Individual exports above are tree-shakeable.
 */
export const Doodle = {
  Star,
  Asterisk,
  Sparkle,
  Bolt,
  Heart,
  Trophy,
  Shield,
  Pulse,
  CodeBracket,
  Search,
  Pin,
  GridIcon,
  Plus,
  CornerBracket,
  ArrowSquiggle,
  Squiggle,
  Mountains,
  Dots,
};

export {
  Star,
  Asterisk,
  Sparkle,
  Bolt,
  Heart,
  Trophy,
  Shield,
  Pulse,
  CodeBracket,
  Search,
  Pin,
  GridIcon,
  Plus,
  CornerBracket,
  ArrowSquiggle,
  Squiggle,
  Mountains,
  Dots,
};
