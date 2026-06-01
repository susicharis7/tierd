import { Link } from "react-router-dom";

import { Doodle, MonoCaption, StickerBadge, TierdLogo } from "./tierd";

const footerCols = [
  { title: "Product", links: ["Explore", "Leaderboard", "Challenges", "Get Verified"] },
  { title: "For Devs", links: ["Docs", "API", "CLI", "Embeds"] },
  { title: "Company", links: ["About", "Manifesto", "Press", "Brand"] },
  { title: "Legal", links: ["Privacy", "Terms", "Anonymity", "DMCA"] },
] as const;

const FooterCTA = () => {
  return (
    <>
      <section className="relative pt-28 pb-24 text-center overflow-hidden">
        <Doodle.Mountains
          w={900}
          h={250}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-orange/10 hidden md:block pointer-events-none"
          aria-hidden
        />
        <Doodle.Sparkle
          size={32}
          className="absolute top-24 left-[20%] text-orange hidden lg:block pointer-events-none"
          aria-hidden
        />
        <Doodle.Sparkle
          size={22}
          className="absolute top-32 right-[22%] text-tape hidden lg:block pointer-events-none"
          aria-hidden
        />
        <Doodle.Asterisk
          size={36}
          className="absolute top-16 right-[15%] text-orange hidden lg:block pointer-events-none"
          aria-hidden
        />

        <div className="section-container relative">
          <StickerBadge
            color="orange"
            tilt={-2}
            icon={<Doodle.Bolt size={11} />}
          >
            free forever for devs
          </StickerBadge>
          <h2 className="font-boldonse text-[64px] sm:text-[96px] lg:text-[120px] leading-[0.92] tracking-[-0.03em] text-cream mt-8">
            ready to <br />
            <span className="text-orange">get ranked?</span>
          </h2>
          <p className="font-grot font-medium text-[18px] sm:text-xl text-cream/75 mt-7 max-w-[560px] mx-auto leading-[1.5]">
            Connect GitHub. We do the rest. Your tier in under 4 minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 mt-10">
            <Link
              to="/get-verified"
              className="inline-flex items-center gap-3 rounded-full bg-orange text-cream font-mono-jb text-[16px] font-bold px-9 py-5 shadow-cta-orange hover:translate-y-px transition-transform"
            >
              <Doodle.CodeBracket size={16} />
              connect github
              <span className="text-xl leading-none">→</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center rounded-full border-2 border-dashed border-cream/30 text-cream font-mono-jb text-[16px] font-bold px-7 py-5 hover:border-cream/50 transition-colors"
            >
              browse without signing up
            </Link>
          </div>

          <div className="mt-9 inline-flex flex-wrap justify-center items-center gap-x-6 gap-y-2 font-mono-jb text-[11px] text-muted-ink">
            <span>✓ no email needed</span>
            <span className="text-cream/20">·</span>
            <span>✓ delete your data anytime</span>
            <span className="text-cream/20">·</span>
            <span>✓ anonymity-friendly</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-dashed border-cream/15 py-12">
        <div className="section-container">
          <div className="flex flex-wrap justify-between items-start gap-10">
            <div className="max-w-[320px]">
              <TierdLogo size="lg" tone="cream" />
              <p className="font-mono-jb text-[12px] text-muted-ink mt-3 leading-[1.6]">
                The ranked dev platform. Built by builders, for builders. Made with
                care in Sarajevo 🇧🇦.
              </p>
              <MonoCaption tone="muted" className="mt-4 text-[10px]">
                v0.3.0 · public beta
              </MonoCaption>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-6">
              {footerCols.map((col) => (
                <div key={col.title}>
                  <MonoCaption tone="cream" className="mb-4">
                    // {col.title}
                  </MonoCaption>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((l) => (
                      <li key={l}>
                        <span className="font-mono-jb text-[12px] text-cream/70 hover:text-cream cursor-pointer transition-colors">
                          {l}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-dashed border-cream/10 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-jb text-[11px] text-muted-ink">© 2026 Tierd.</span>
            <div className="flex items-center gap-4 font-mono-jb text-[11px] text-muted-ink">
              <Link to="/explore" className="hover:text-cream transition-colors">Explore</Link>
              <Link to="/leaderboard" className="hover:text-cream transition-colors">Leaderboard</Link>
              <Link to="/challenges" className="hover:text-cream transition-colors">Challenges</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterCTA;
