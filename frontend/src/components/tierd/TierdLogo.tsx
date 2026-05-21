import * as React from "react";
import { Link } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const wordmarkVariants = cva(
  "font-boldonse leading-none tracking-[-0.02em] inline-block",
  {
    variants: {
      size: {
        xs: "text-[16px]",
        sm: "text-[22px]",
        md: "text-[26px]",
        lg: "text-[36px]",
        xl: "text-[56px]",
        display: "text-[88px] sm:text-[120px]",
      },
      tone: {
        cream: "text-cream",
        ink: "text-ink",
      },
    },
    defaultVariants: { size: "md", tone: "cream" },
  },
);

const markVariants = cva(
  "font-boldonse leading-none tracking-[-0.04em] inline-flex items-baseline justify-center",
  {
    variants: {
      size: {
        sm: "text-[18px] w-7 h-7",
        md: "text-[22px] w-9 h-9",
        lg: "text-[28px] w-11 h-11",
      },
      tone: {
        cream: "text-cream",
        ink: "text-ink",
        orange: "text-orange",
      },
    },
    defaultVariants: { size: "md", tone: "cream" },
  },
);

type WordmarkSize = NonNullable<
  VariantProps<typeof wordmarkVariants>["size"]
>;
type WordmarkTone = NonNullable<
  VariantProps<typeof wordmarkVariants>["tone"]
>;
type MarkSize = NonNullable<VariantProps<typeof markVariants>["size"]>;
type MarkTone = NonNullable<VariantProps<typeof markVariants>["tone"]>;

interface BaseProps {
  /** Render inside a router `<Link>` to `to` (default `/`). Pass `null` to skip. */
  to?: string | null;
  /** Extra classes on the outer element. */
  className?: string;
  /** Optional `aria-label` override. */
  ariaLabel?: string;
}

interface WordmarkProps extends BaseProps {
  variant?: "wordmark";
  size?: WordmarkSize;
  tone?: WordmarkTone;
  /** Show a small "BETA" sticker chip to the right of the wordmark. */
  beta?: boolean;
}

interface MarkProps extends BaseProps {
  variant: "mark";
  size?: MarkSize;
  tone?: MarkTone;
  /** Background of the rounded square the "t." sits inside. */
  bg?: "ink" | "ink-2" | "cream" | "orange" | "none";
}

type TierdLogoProps = WordmarkProps | MarkProps;

/**
 * Tierd brand primitive. Two shapes:
 *
 * 1. `<TierdLogo />` — full **wordmark** `Tierd.` with the period in orange.
 *    Use in nav bars, footers, and any large hero treatment. Pick a `size`
 *    + `tone` for the surface; tone="cream" sits on dark, tone="ink" on light.
 *
 * 2. `<TierdLogo variant="mark" />` — compact **t.** glyph in a rounded
 *    square chip. Use as a favicon, OG fallback, mobile-collapsed nav, or
 *    avatar-sized brand chip. `bg` controls the square's fill so the mark
 *    blends with its surface without an extra wrapper.
 *
 * Both render as `<Link to="/">` by default. Pass `to={null}` to skip.
 */
export const TierdLogo = (props: TierdLogoProps) => {
  if (props.variant === "mark") {
    const {
      size = "md",
      tone = "orange",
      bg = "ink",
      to = "/",
      className,
      ariaLabel = "Tierd",
    } = props;
    const bgClass =
      bg === "none"
        ? ""
        : bg === "cream"
          ? "bg-cream"
          : bg === "orange"
            ? "bg-orange"
            : bg === "ink-2"
              ? "bg-ink-2"
              : "bg-ink";

    const inner = (
      <span
        className={cn(
          "rounded-[8px] inline-flex items-center justify-center shadow-press",
          bgClass,
          markVariants({ size, tone }),
          className,
        )}
        aria-label={ariaLabel}
      >
        <span aria-hidden>t</span>
        <span aria-hidden className="text-orange">
          .
        </span>
      </span>
    );

    return to ? (
      <Link to={to} className="inline-flex items-center">
        {inner}
      </Link>
    ) : (
      inner
    );
  }

  const {
    size = "md",
    tone = "cream",
    beta = false,
    to = "/",
    className,
    ariaLabel = "Tierd",
  } = props;

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        beta ? "shrink-0" : "",
      )}
      aria-label={ariaLabel}
    >
      <span className={cn(wordmarkVariants({ size, tone }), className)}>
        <span aria-hidden>Tierd</span>
        <span aria-hidden className="text-orange">
          .
        </span>
      </span>
      {beta && (
        <span className="hidden sm:inline-flex items-center rounded-full bg-orange-soft text-ink font-mono-jb font-bold text-[9px] uppercase tracking-[0.12em] px-2 py-[3px]">
          BETA
        </span>
      )}
    </span>
  );

  return to ? (
    <Link to={to} className="inline-flex items-center">
      {inner}
    </Link>
  ) : (
    inner
  );
};

TierdLogo.displayName = "TierdLogo";
