import { Link } from "react-router-dom";

import {
  Doodle,
  DoodleAvatar,
  MonoCaption,
  ScribbleUnderline,
  Sticker,
  StickerBadge,
  Tape,
  TierBadge,
  type Tier,
} from "../components/tierd";
import {
  InlineSpinner,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCommentRow,
  SkeletonFeedCard,
  SkeletonLeaderboardRow,
  SkeletonLine,
  SkeletonStatTile,
} from "../components/ui/loading";
import { tiltFromId } from "../lib/tilt";

/**
 * Starter kit reference for the Studio Notebook design system — every
 * token, primitive, and doodle the redesign relies on. Internal page;
 * reach via `/design-system` (not linked from the user-facing nav).
 */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-ink text-cream font-grot">
      {/* Header */}
      <header className="px-10 pt-10 pb-12 md:px-14">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="font-mono-jb text-[12px] uppercase tracking-[0.1em] text-cream/60 hover:text-cream"
          >
            ← back to app
          </Link>
          <MonoCaption tone="muted">// internal · design system reference</MonoCaption>
        </div>

        <StickerBadge
          color="orange"
          tilt={-2}
          icon={<Doodle.CodeBracket size={11} />}
          className="mb-6"
        >
          Tierd. design system · v0.1
        </StickerBadge>

        <h1 className="font-boldonse text-[72px] md:text-[96px] leading-[0.92] tracking-[-0.02em]">
          starter <span className="text-orange">kit.</span>
        </h1>
        <p className="font-grot text-[17px] text-cream/70 mt-5 max-w-[640px] leading-[1.6]">
          Every Studio Notebook token, primitive, and doodle in one place. Copy
          what you need. Refactor against this reference. Anything not in here
          isn't part of the system.
        </p>
      </header>

      <div className="px-10 pb-24 md:px-14 space-y-16">
        {/* ============ 01 · COLORS ============ */}
        <Section title="01. Color tokens" code="// tailwind.config -> theme.colors">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Swatch name="ink" bg="bg-ink" fg="text-cream" hex="#15110D" />
            <Swatch name="ink-2" bg="bg-ink-2" fg="text-cream" hex="#1E1812" />
            <Swatch name="ink-3" bg="bg-ink-3" fg="text-cream" hex="#2A2118" />
            <Swatch name="ink-line" bg="bg-ink-line" fg="text-cream" hex="#3A2E22" />
            <Swatch name="cream" bg="bg-cream" fg="text-ink" hex="#F1EBDF" />
            <Swatch name="cream-2" bg="bg-cream-2" fg="text-ink" hex="#E8E0D1" />
            <Swatch name="cream-3" bg="bg-cream-3" fg="text-ink" hex="#D9CFBC" />
            <Swatch name="orange" bg="bg-orange" fg="text-cream" hex="#FF5A1F" />
            <Swatch name="orange-2" bg="bg-orange-2" fg="text-cream" hex="#FF7B45" />
            <Swatch name="orange-soft" bg="bg-orange-soft" fg="text-ink" hex="#FFB892" />
            <Swatch name="peach" bg="bg-peach" fg="text-ink" hex="#FDD9C2" />
            <Swatch name="forest" bg="bg-forest" fg="text-cream" hex="#2D5F3F" />
            <Swatch name="sage" bg="bg-sage" fg="text-ink" hex="#A8C5B0" />
            <Swatch name="tape" bg="bg-tape" fg="text-ink" hex="#F4D75E" />
            <Swatch name="plum" bg="bg-plum" fg="text-cream" hex="#6B3A4F" />
            <Swatch name="muted-ink" bg="bg-muted-ink" fg="text-cream" hex="#8A7F6E" />
            <Swatch name="muted-cream" bg="bg-muted-cream" fg="text-cream" hex="#6E6353" />
          </div>
        </Section>

        {/* ============ 02 · TYPE ============ */}
        <Section title="02. Type" code="// font-boldonse · font-grot · font-mono-jb">
          <div className="space-y-6">
            <TypeRow label="font-boldonse" sample="ship · climb · rank." className="font-boldonse text-[56px] leading-[0.95] tracking-[-0.02em]" />
            <TypeRow label="font-grot" sample="The social for developers who actually ship." className="font-grot text-[22px] font-medium leading-[1.4]" />
            <TypeRow label="font-mono-jb" sample="// activity · 14 commits / 30d" className="font-mono-jb text-[13px] uppercase tracking-[0.12em] text-cream/80" />
          </div>
        </Section>

        {/* ============ 03 · STICKERS ============ */}
        <Section title="03. Stickers" code="// <Sticker color tilt padding radius>">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["cream", "peach", "orange", "sage", "tape", "plum", "forest", "dark"] as const).map(
              (color, i) => (
                <Sticker
                  key={color}
                  color={color}
                  tilt={tiltFromId(color, 2)}
                  padding="md"
                  className="min-h-[110px] flex flex-col justify-between"
                >
                  <MonoCaption
                    tone={color === "cream" || color === "peach" || color === "sage" || color === "tape" ? "muted" : "cream"}
                    className="opacity-70"
                  >
                    // {color}
                  </MonoCaption>
                  <div className="font-boldonse text-[28px] leading-none">
                    {`T${i}`}
                  </div>
                </Sticker>
              ),
            )}
          </div>
          <p className="font-mono-jb text-[11px] text-muted-ink mt-4">
            tilt seeded from item id via <code>tiltFromId()</code> — stable across renders.
          </p>
        </Section>

        {/* ============ 04 · STICKER BADGES ============ */}
        <Section title="04. Sticker badges" code="// <StickerBadge color tilt icon>">
          <div className="flex flex-wrap gap-3">
            <StickerBadge color="orange" tilt={-2} icon={<Doodle.Bolt size={11} />}>
              FEATURED
            </StickerBadge>
            <StickerBadge color="cream">
              NOW IN PUBLIC BETA · BiH 🇧🇦
            </StickerBadge>
            <StickerBadge color="forest" icon={<Doodle.Pulse size={11} />}>
              LIVE NOW
            </StickerBadge>
            <StickerBadge color="plum" tilt={1}>EARLY ADOPTER</StickerBadge>
            <StickerBadge color="tape" icon={<Doodle.Sparkle size={11} />}>
              WEEK 14
            </StickerBadge>
            <StickerBadge color="peach">CHALLENGE WINNER</StickerBadge>
            <StickerBadge color="dark">SETTINGS</StickerBadge>
            <StickerBadge color="sage">BUILDER</StickerBadge>
          </div>
        </Section>

        {/* ============ 05 · TIER BADGES ============ */}
        <Section title="05. Tier badges" code="// <TierBadge tier size>">
          <div className="flex flex-wrap items-center gap-3">
            {(["T0", "T1", "T2", "T3", "—"] as Tier[]).map((tier) => (
              <TierBadge key={tier} tier={tier} />
            ))}
            <span className="font-mono-jb text-[11px] text-muted-ink ml-4">sizes:</span>
            <TierBadge tier="T1" size="sm" />
            <TierBadge tier="T1" size="md" />
            <TierBadge tier="T1" size="lg" />
            <span className="font-mono-jb text-[11px] text-muted-ink ml-4">custom label:</span>
            <TierBadge tier="T1" label="T1 SHIPPER" />
          </div>
        </Section>

        {/* ============ 06 · MONO CAPTIONS ============ */}
        <Section title="06. Mono captions" code="// <MonoCaption tone icon>">
          <div className="space-y-2">
            <div>
              <MonoCaption icon={<Doodle.Pulse size={11} />}>// activity</MonoCaption>
            </div>
            <div>
              <MonoCaption tone="cream">// feed · live · global</MonoCaption>
            </div>
            <div>
              <MonoCaption tone="orange" icon={<Doodle.Sparkle size={11} />}>
                // trending
              </MonoCaption>
            </div>
            <div>
              <MonoCaption tone="forest">● live</MonoCaption>
            </div>
            <div>
              <MonoCaption tone="plum">// communities</MonoCaption>
            </div>
          </div>
        </Section>

        {/* ============ 07 · SCRIBBLE UNDERLINE ============ */}
        <Section title="07. Scribble underline" code="// <ScribbleUnderline w />">
          <div className="font-boldonse text-[72px] leading-[1] tracking-[-0.02em] inline-block relative">
            developers
            <ScribbleUnderline w={420} className="absolute left-0 -bottom-2 text-orange" />
          </div>
        </Section>

        {/* ============ 08 · TAPE ============ */}
        <Section title="08. Tape" code="// <Tape color size tilt /> (absolute-positioned)">
          <div className="relative bg-ink-2 border border-ink-line rounded-[14px] h-[140px] overflow-hidden">
            <Tape color="tape" size="md" tilt={-6} className="top-3 left-10" />
            <Tape color="orange-soft" size="md" tilt={4} className="top-5 left-44" />
            <Tape color="peach" size="lg" tilt={-2} className="top-3 left-80" />
            <Tape color="cream" size="sm" tilt={8} className="top-6 right-12" />
            <div className="absolute bottom-3 left-3 font-mono-jb text-[10px] text-muted-ink uppercase tracking-[0.1em]">
              // tape · md, md, lg, sm
            </div>
          </div>
        </Section>

        {/* ============ 09 · DOODLE AVATARS ============ */}
        <Section title="09. Doodle avatars" code="// <DoodleAvatar name size bg />">
          <div className="flex flex-wrap items-end gap-4">
            {["Tarik", "Lena", "Amir", "Dino", "Mia", "Haris", "Sara", "Nina"].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <DoodleAvatar name={n} size={56} />
                <span className="font-mono-jb text-[10px] text-muted-ink">{n}</span>
              </div>
            ))}
            <span className="font-mono-jb text-[11px] text-muted-ink mx-4">sizes:</span>
            {[24, 32, 44, 64, 88, 120].map((s) => (
              <DoodleAvatar key={s} name="T" size={s} />
            ))}
          </div>
        </Section>

        {/* ============ 10 · DOODLES ============ */}
        <Section title="10. Doodles" code="// <Doodle.* size />">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(
              [
                ["Star", Doodle.Star],
                ["Asterisk", Doodle.Asterisk],
                ["Sparkle", Doodle.Sparkle],
                ["Bolt", Doodle.Bolt],
                ["Heart", Doodle.Heart],
                ["Trophy", Doodle.Trophy],
                ["Shield", Doodle.Shield],
                ["Pulse", Doodle.Pulse],
                ["CodeBracket", Doodle.CodeBracket],
                ["Search", Doodle.Search],
                ["Pin", Doodle.Pin],
                ["GridIcon", Doodle.GridIcon],
                ["Plus", Doodle.Plus],
              ] as const
            ).map(([name, Icon]) => (
              <DoodleCell key={name} name={name}>
                <Icon size={28} className="text-orange" />
              </DoodleCell>
            ))}
            <DoodleCell name="CornerBracket">
              <Doodle.CornerBracket size={28} corner="tl" className="text-orange" />
            </DoodleCell>
            <DoodleCell name="ArrowSquiggle">
              <Doodle.ArrowSquiggle w={60} h={20} className="text-orange" />
            </DoodleCell>
            <DoodleCell name="Squiggle">
              <Doodle.Squiggle w={80} h={10} className="text-orange" />
            </DoodleCell>
            <DoodleCell name="Mountains">
              <Doodle.Mountains w={100} h={36} className="text-orange" />
            </DoodleCell>
            <DoodleCell name="Dots">
              <Doodle.Dots rows={3} cols={5} className="text-orange" />
            </DoodleCell>
          </div>
        </Section>

        {/* ============ 11 · SHADOWS ============ */}
        <Section title="11. Shadow utilities" code="// shadow-sticker · shadow-cta-orange · shadow-press · shadow-glow-orange">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ShadowCard className="bg-cream text-ink shadow-sticker" label="shadow-sticker" />
            <ShadowCard className="bg-orange text-cream shadow-cta-orange" label="shadow-cta-orange" />
            <ShadowCard className="bg-cream text-ink shadow-press" label="shadow-press" />
            <ShadowCard className="bg-orange text-cream shadow-glow-orange" label="shadow-glow-orange" />
          </div>
        </Section>

        {/* ============ 12 · ANIMATION ============ */}
        <Section title="12. animate-blink" code="// composer cursor — respects prefers-reduced-motion">
          <div className="font-grot text-[22px] font-bold text-cream">
            what did you ship today
            <span className="inline-block w-[0.5ch] h-[0.9em] bg-orange ml-1 align-middle animate-blink" />
          </div>
        </Section>

        {/* ============ 13 · LOADING STATES ============ */}
        <Section title="13. Loading states" code="// Skeleton · InlineSpinner · feature shells">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-[18px] border border-ink-line bg-ink-2 p-5">
              <MonoCaption tone="cream" className="mb-4">// dark surface skeletons</MonoCaption>
              <div className="flex items-center gap-3 mb-5">
                <SkeletonAvatar />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-40" />
                  <SkeletonLine className="h-3 w-28" />
                </div>
                <SkeletonButton />
              </div>
              <SkeletonFeedCard className="rounded-[14px] border border-cream/[0.08] bg-cream/[0.02] px-4" />
            </div>

            <div className="rounded-[18px] bg-cream text-ink p-5 shadow-sticker">
              <MonoCaption tone="muted" className="mb-4">// light sticker skeletons</MonoCaption>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <SkeletonStatTile tone="light" />
                <SkeletonStatTile tone="light" className="bg-peach" />
              </div>
              <div className="space-y-3">
                <SkeletonCommentRow tone="light" />
                <SkeletonCommentRow tone="light" />
              </div>
            </div>

            <div className="rounded-[18px] border border-cream/10 bg-cream/[0.04] p-2 lg:col-span-2">
              <div className="hidden sm:grid grid-cols-[60px_1fr_130px_100px_110px_130px] gap-x-4 items-center px-4 py-3.5 border-b border-dashed border-cream/10">
                {["#", "Developer", "Scope", "Streak", "Tier"].map((h) => (
                  <MonoCaption key={h} tone="muted">{h}</MonoCaption>
                ))}
                <MonoCaption tone="muted" className="justify-end">Score</MonoCaption>
              </div>
              <SkeletonLeaderboardRow />
              <SkeletonLeaderboardRow />
              <SkeletonLeaderboardRow />
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-cta-orange"
              >
                <InlineSpinner className="h-3.5 w-3.5 border-cream/30 border-t-cream" label="Saving example" />
                saving...
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-cream/25 text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5"
              >
                <InlineSpinner label="Loading example" />
                loading more
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* -------- Layout helpers (page-local; not exported) -------- */

function Section({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-5 pb-3 border-b-[1.5px] border-dashed border-cream/15">
        <h2 className="font-boldonse text-[28px] text-cream">{title}</h2>
        <code className="font-mono-jb text-[11px] text-muted-ink tracking-[0.05em]">{code}</code>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  bg,
  fg,
  hex,
}: {
  name: string;
  bg: string;
  fg: string;
  hex: string;
}) {
  return (
    <div
      className={`rounded-[14px] p-4 min-h-[110px] border border-cream/8 flex flex-col justify-between ${bg} ${fg}`}
    >
      <div className="font-grot font-extrabold text-[15px]">{name}</div>
      <div>
        <div className="font-mono-jb text-[10px] font-semibold">--{name}</div>
        <div className="font-mono-jb text-[10px] opacity-70 mt-0.5">{hex}</div>
      </div>
    </div>
  );
}

function TypeRow({
  label,
  sample,
  className,
}: {
  label: string;
  sample: string;
  className: string;
}) {
  return (
    <div className="grid md:grid-cols-[140px_1fr] gap-4 md:gap-6 items-baseline py-3 border-b border-dashed border-cream/10">
      <MonoCaption tone="cream">{label}</MonoCaption>
      <div className={className}>{sample}</div>
    </div>
  );
}

function DoodleCell({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-[12px] bg-cream/[0.04] border border-cream/8">
      <div className="h-10 flex items-center justify-center">{children}</div>
      <span className="font-mono-jb text-[10px] text-muted-ink">{name}</span>
    </div>
  );
}

function ShadowCard({ className, label }: { className: string; label: string }) {
  return (
    <div className={`rounded-[14px] p-5 min-h-[110px] flex flex-col justify-between ${className}`}>
      <span className="font-mono-jb text-[10px] uppercase tracking-[0.1em] opacity-70">// shadow</span>
      <div className="font-grot font-bold text-[14px]">{label}</div>
    </div>
  );
}
