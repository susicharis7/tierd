import * as React from "react";

import { cn } from "../../lib/utils";

interface DoodleAvatarProps extends Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Name (or initial) used to seed the avatar's color + facial expression. */
  name?: string;
  /** Pixel size of the (square) avatar. Default 44. */
  size?: number;
  /** Optional background color override (any valid CSS color). */
  bg?: string;
}

/**
 * 6 background palettes + 6 expressions. Seeded from the first character of
 * `name` so the same user always renders the same face.
 */
const PALETTES: ReadonlyArray<{ bg: string; face: string }> = [
  { bg: "#FFB892", face: "#15110D" }, // orange-soft
  { bg: "#A8C5B0", face: "#15110D" }, // sage
  { bg: "#F4D75E", face: "#15110D" }, // tape
  { bg: "#FDD9C2", face: "#15110D" }, // peach
  { bg: "#FF7B45", face: "#15110D" }, // orange-2
  { bg: "#6B3A4F", face: "#F1EBDF" }, // plum
];

function expression(seed: number, face: string): React.ReactNode {
  switch (seed) {
    case 0: // dots eyes + small smile
      return (
        <>
          <circle cx="14" cy="20" r="1.6" fill={face} />
          <circle cx="26" cy="20" r="1.6" fill={face} />
          <path d="M14 27 Q 20 30, 26 27" stroke={face} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      );
    case 1: // line eyes + flat smile
      return (
        <>
          <path d="M12 20 L16 20 M24 20 L28 20" stroke={face} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15 27 L25 27" stroke={face} strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case 2: // sleepy
      return (
        <>
          <path d="M12 21 Q 14 19, 16 21 M24 21 Q 26 19, 28 21" stroke={face} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M14 27 Q 20 29, 26 27" stroke={face} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      );
    case 3: // glasses
      return (
        <>
          <circle cx="14" cy="20" r="3" stroke={face} strokeWidth="1.5" fill="none" />
          <circle cx="26" cy="20" r="3" stroke={face} strokeWidth="1.5" fill="none" />
          <path d="M17 20 L23 20" stroke={face} strokeWidth="1.5" />
          <path d="M15 27 Q 20 28, 25 27" stroke={face} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      );
    case 4: // surprised
      return (
        <>
          <circle cx="14" cy="20" r="1.8" fill={face} />
          <circle cx="26" cy="20" r="1.8" fill={face} />
          <ellipse cx="20" cy="28" rx="2" ry="2.5" fill={face} />
        </>
      );
    case 5: // chill
    default:
      return (
        <>
          <path d="M12 19 L16 21 M24 21 L28 19" stroke={face} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 27 Q 20 30, 24 27" stroke={face} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      );
  }
}

const DoodleAvatar = React.forwardRef<SVGSVGElement, DoodleAvatarProps>(
  ({ name = "?", size = 44, bg, className, ...props }, ref) => {
    const seed = (name.charCodeAt(0) || 65) % PALETTES.length;
    const palette = PALETTES[seed];
    const bgColor = bg ?? palette.bg;
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label={name === "?" ? "User avatar" : `${name} avatar`}
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle cx="20" cy="20" r="19" fill={bgColor} stroke={palette.face} strokeWidth="1.4" />
        {expression(seed, palette.face)}
      </svg>
    );
  },
);
DoodleAvatar.displayName = "DoodleAvatar";

export { DoodleAvatar };
