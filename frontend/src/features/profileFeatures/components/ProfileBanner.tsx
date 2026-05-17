import { Doodle, Tape } from "../../../components/tierd";

/**
 * Hero banner — dark ink card with an orange grid overlay, two layered
 * mountain doodles, sparkles + asterisk, and a pair of tape strips. Includes
 * top-right "edit cover" / "share" buttons (visual only — placeholders for a
 * future cover-upload flow) and a "shipping since…" caption bottom-left.
 */
interface ProfileBannerProps {
  shippingSince?: string;
  /** When false, hides the edit/share buttons (for not-own profiles). */
  isOwn: boolean;
}

const ProfileBanner = ({
  shippingSince = "shipping since Q1 2024 · 🇧🇦 sarajevo",
  isOwn,
}: ProfileBannerProps) => {
  return (
    <div className="relative h-48 sm:h-52 rounded-[24px] overflow-hidden border border-ink-line bg-[linear-gradient(135deg,#2A1810_0%,hsl(var(--ink))_60%)]">
      {/* Orange grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,90,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,90,31,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Bottom-right orange glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 70% 100%, rgba(255,90,31,0.35), transparent 70%)",
        }}
      />

      {/* Layered mountains line-art */}
      <Doodle.Mountains
        w={760}
        h={140}
        className="absolute bottom-0 right-10 text-orange/50 pointer-events-none hidden sm:block"
        aria-hidden
      />
      <Doodle.Mountains
        w={500}
        h={100}
        className="absolute bottom-0 right-[200px] text-orange-2/30 pointer-events-none hidden lg:block"
        aria-hidden
      />

      {/* Decorations */}
      <Doodle.Sparkle
        size={22}
        className="absolute top-7 right-20 text-tape pointer-events-none hidden sm:block"
        aria-hidden
      />
      <Doodle.Sparkle
        size={14}
        className="absolute top-12 right-[200px] text-orange pointer-events-none hidden md:block"
        aria-hidden
      />
      <Doodle.Asterisk
        size={26}
        className="absolute top-5 left-14 text-orange/70 pointer-events-none hidden sm:block"
        aria-hidden
      />

      {/* Tape strips */}
      <Tape color="tape" size="md" tilt={-6} className="top-4 left-[18%] hidden sm:block" />
      <Tape
        color="orange-soft"
        size="md"
        tilt={4}
        className="top-6 left-[40%] hidden md:block"
      />

      {/* Action buttons */}
      {isOwn && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            className="rounded-[10px] bg-black/40 backdrop-blur-md border border-cream/20 text-cream font-mono-jb text-[11px] px-3.5 py-2 hover:bg-black/60 transition-colors"
          >
            edit cover
          </button>
          <button
            type="button"
            className="rounded-[10px] bg-black/40 backdrop-blur-md border border-cream/20 text-cream font-mono-jb text-[11px] px-3.5 py-2 hover:bg-black/60 transition-colors"
          >
            share ↗
          </button>
        </div>
      )}

      {/* Caption */}
      <p className="absolute bottom-4 left-7 font-mono-jb text-[10px] uppercase tracking-[0.15em] text-cream/60">
        {shippingSince}
      </p>
    </div>
  );
};

export default ProfileBanner;
