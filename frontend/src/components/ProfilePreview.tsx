import { Link } from "react-router-dom";

import {
  Doodle,
  MonoCaption,
  Sticker,
  StickerBadge,
  Tape,
  TierBadge,
  UserAvatar,
} from "./tierd";

const features = [
  {
    icon: Doodle.CodeBracket,
    title: "Verified Links",
    desc: "Connect GitHub, Twitter, and personal site.",
  },
  {
    icon: Doodle.Sparkle,
    title: "Featured Shipments",
    desc: "Highlight your best projects with live metrics.",
  },
  {
    icon: Doodle.Trophy,
    title: "Badges & Tiers",
    desc: "Earn public recognition for specific tech stacks.",
  },
] as const;

const ProfilePreview = () => {
  return (
    <section className="relative py-24 border-t border-dashed border-cream/10">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left copy */}
          <div>
            <StickerBadge color="cream" tilt={-2} className="mb-5">
              prestige portfolio
            </StickerBadge>
            <h2 className="font-boldonse text-[44px] sm:text-[56px] lg:text-[68px] leading-[0.95] text-cream">
              your new <span className="text-orange">central hub.</span>
            </h2>
            <p className="font-grot font-medium text-[17px] text-cream/75 mt-6 max-w-[480px] leading-[1.6]">
              Stop sending links to five different platforms. Tierd aggregates your
              GitHub, LeetCode, deployed projects, and hackathon wins into one
              undeniable source of truth.
            </p>

            <div className="space-y-5 mt-9">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-orange/15 border border-orange/25 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-orange" />
                    </div>
                    <div>
                      <h3 className="font-grot font-extrabold text-[15px] text-cream mb-1">
                        {f.title}
                      </h3>
                      <p className="font-mono-jb text-[12px] text-muted-ink leading-[1.6]">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — profile sticker preview */}
          <Sticker
            color="cream"
            tilt={1.5}
            padding="lg"
            radius="xl"
            className="relative"
          >
            <Tape color="tape" size="md" tilt={-4} className="-top-[10px] left-10" />

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar name="Marcus Levin" size={72} />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <TierBadge tier="T1" size="sm" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-grot font-extrabold text-[22px] text-ink leading-none">
                      Marcus Levin
                    </h3>
                    <Doodle.Trophy size={18} className="text-orange" />
                  </div>
                  <p className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-cream mt-1.5">
                    @mlevin · senior frontend
                  </p>
                  <p className="font-mono-jb text-[11px] text-muted-cream mt-0.5">
                    📍 Vercel · React, TS
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/[0.07] font-mono-jb text-[10px] text-muted-cream">
                🌐 Remote
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[
                { label: "SCORE", value: "10.2k" },
                { label: "GLOBAL", value: "#14" },
                { label: "SHIPS", value: "42" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-3 rounded-xl bg-ink/[0.05] border border-dashed border-ink/10"
                >
                  <div className="font-boldonse text-[22px] text-orange leading-none">
                    {s.value}
                  </div>
                  <div className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-cream mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-ink/[0.05] border border-dashed border-ink/15 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <MonoCaption tone="muted" className="text-muted-cream">
                  // featured ship
                </MonoCaption>
                <span className="font-mono-jb text-[10px] text-muted-cream">↗</span>
              </div>
              <h4 className="font-grot font-extrabold text-[15px] text-ink">
                Nexar UI Library
              </h4>
              <p className="font-mono-jb text-[11px] text-muted-cream leading-[1.55] mt-1">
                A modern, accessible component library built with Tailwind and Radix.
              </p>
              <div className="flex gap-1.5 mt-2.5">
                {["React", "Tailwind"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-soft text-ink font-mono-jb text-[10px] font-bold px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/profile/jay"
              className="mt-5 block w-full text-center rounded-full bg-ink text-cream font-mono-jb text-[12px] font-bold px-4 py-3 shadow-press hover:translate-y-px transition-transform"
            >
              view full profile →
            </Link>
          </Sticker>
        </div>
      </div>
    </section>
  );
};

export default ProfilePreview;
