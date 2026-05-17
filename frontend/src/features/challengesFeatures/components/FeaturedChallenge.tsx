import {
  Doodle,
  StickerBadge,
  Tape,
  UserAvatar,
  MonoCaption,
} from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import type { ActiveChallenge } from "../../../services/rankingService";
import { formatTimeLeft } from "../challengesData";

interface FeaturedChallengeProps {
  challenge: ActiveChallenge | null | undefined;
  isPending: boolean;
}

const FEATURED_TAGS = ["Web", "Full Stack", "Bosnia"] as const;
const FEATURED_DIFFICULTY = "Intermediate";
const FEATURED_REGION = "BiH 🇧🇦";
// Decorative avatar stack for the "+N builders already in" cluster.
const STACK_AVATARS = ["T", "H", "D", "M", "A"] as const;

/**
 * The big featured challenge card. Pulls live title/description/reward/
 * participants/timeLeft from `useActiveChallengeQuery`; tags, difficulty, and
 * region are placeholders until the schema carries them.
 */
const FeaturedChallenge = ({ challenge, isPending }: FeaturedChallengeProps) => {
  const title = challenge?.title ?? "Top Builders Bosnia Sprint";
  const description =
    challenge?.description ??
    "Build and ship a polished developer-facing web product in 5 days. Judged on design, code quality, and real-world utility.";
  const reward = challenge?.rewardPoints ?? 350;
  const participants = challenge?.participantsCount ?? 128;
  const timeLeft = challenge ? formatTimeLeft(challenge.endsAt) : "2d 14h";

  return (
    <div className="relative mb-12">
      <Tape color="tape" size="lg" tilt={-3} className="-top-3 left-24 z-10" />
      <Tape
        color="orange-soft"
        size="md"
        tilt={5}
        className="-top-[10px] right-20 z-10"
      />

      <div className="relative rounded-[22px] bg-cream text-ink p-7 sm:p-9 shadow-sticker overflow-hidden">
        {/* Grid-paper background */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <Doodle.Trophy
          size={140}
          className="absolute -bottom-3 right-8 text-orange/15 pointer-events-none hidden md:block"
          aria-hidden
        />
        <Doodle.Sparkle
          size={24}
          className="absolute top-7 right-44 text-orange pointer-events-none hidden lg:block"
          aria-hidden
        />
        <Doodle.Sparkle
          size={16}
          className="absolute top-14 right-64 text-tape pointer-events-none hidden lg:block"
          aria-hidden
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              <StickerBadge
                color="orange"
                tilt={-2}
                icon={<Doodle.Trophy size={11} />}
              >
                FEATURED
              </StickerBadge>
              <span
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-forest text-cream font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] px-3.5 py-2 shadow-press"
                style={{ transform: "rotate(1deg)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                LIVE NOW
              </span>
            </div>

            <h2 className="font-boldonse text-[36px] sm:text-[48px] lg:text-[56px] leading-[0.95] text-ink mb-4">
              {isPending ? "Loading challenge…" : title}
            </h2>

            <p className="font-mono-jb text-[13px] sm:text-[14px] text-muted-cream leading-[1.6] max-w-[560px] mb-5">
              {description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {FEATURED_TAGS.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border-[1.5px] border-dashed border-ink/70 font-mono-jb text-[11px] font-semibold text-ink px-3 py-1"
                >
                  {t}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full bg-ink text-cream font-mono-jb text-[11px] font-semibold px-3 py-1">
                · {FEATURED_DIFFICULTY}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5 border-t-[1.5px] border-dashed border-ink/20">
              <StatBlock label="TIME LEFT" value={timeLeft ?? "—"} accent />
              <StatBlock label="POINTS" value={`+${reward}`} />
              <StatBlock label="BUILDERS" value={`${participants}`} />
              <StatBlock label="REGION" value={FEATURED_REGION} grotesk />
            </div>
          </div>

          {/* Right CTA card */}
          <div className="self-center rounded-[16px] bg-ink text-cream p-5">
            <MonoCaption tone="cream" className="text-[10px] opacity-70">
              // JOIN BEFORE 23:59 UTC
            </MonoCaption>
            <p className="font-grot font-extrabold text-[20px] leading-[1.2] mt-2">
              Ready to ship?
              <br />
              <span className="text-orange">Claim your slot.</span>
            </p>

            <div className="flex items-center mt-4 mb-4">
              {STACK_AVATARS.map((n, i) => (
                <span
                  key={n}
                  className={cn(
                    "relative rounded-full border-2 border-ink",
                    i > 0 && "-ml-3",
                  )}
                  style={{ zIndex: STACK_AVATARS.length - i }}
                >
                  <UserAvatar name={n} size={32} />
                </span>
              ))}
              <span className="ml-2 font-mono-jb text-[11px] text-muted-ink">
                +123 builders already in
              </span>
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange text-cream font-mono-jb text-[14px] font-bold px-4 py-3.5 shadow-press hover:translate-y-px transition-transform"
            >
              <Doodle.Bolt size={14} />
              JOIN NOW →
            </button>
            <button
              type="button"
              className="mt-2 w-full inline-flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-cream/30 text-cream font-mono-jb text-[12px] font-semibold px-4 py-2.5 hover:border-cream/50 transition-colors"
            >
              view rules + judging
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatBlockProps {
  label: string;
  value: string;
  accent?: boolean;
  grotesk?: boolean;
}

const StatBlock = ({ label, value, accent, grotesk }: StatBlockProps) => (
  <div>
    <div className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-cream">
      {label}
    </div>
    <div
      className={cn(
        "mt-1",
        grotesk
          ? "font-grot font-extrabold text-[20px] text-ink"
          : "font-boldonse text-[26px]",
        !grotesk && (accent ? "text-orange" : "text-ink"),
      )}
    >
      {value}
    </div>
  </div>
);

export default FeaturedChallenge;
