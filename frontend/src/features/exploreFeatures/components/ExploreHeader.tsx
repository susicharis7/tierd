import {
  Doodle,
  MonoCaption,
  ScribbleUnderline,
} from "../../../components/tierd";

type ExploreHeaderProps = {
  showSearchResults: boolean;
  profilesCount: number;
  postsCount: number;
};

/**
 * Title block + stats chips. The search bar lives in a separate sticky
 * wrapper at the page level so it stays pinned while the page scrolls.
 */
export function ExploreHeader({
  showSearchResults,
  profilesCount,
  postsCount,
}: ExploreHeaderProps) {
  return (
    <div className="pt-28 pb-0 relative">
      <Doodle.Asterisk
        size={42}
        className="absolute top-16 right-[28%] text-orange/60 hidden xl:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Dots
        rows={4}
        cols={8}
        className="absolute top-24 right-12 text-cream/25 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={26}
        className="absolute top-[130px] right-[200px] text-tape hidden xl:block pointer-events-none"
        aria-hidden
      />

      <div className="section-container relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <MonoCaption tone="orange" className="mb-3">
              ◢ developer discovery
            </MonoCaption>
            <h1 className="font-boldonse text-[56px] sm:text-[80px] lg:text-[96px] leading-[0.95] tracking-[-0.02em] text-cream">
              explore<span className="text-orange">.</span>
            </h1>
            <p className="font-mono-jb text-[13px] sm:text-[14px] text-cream/70 mt-4 max-w-[520px] leading-[1.6]">
              Discover builders, see what's shipping, and find who's worth
              following. Today is a good day to ship something.
            </p>
          </div>

          {!showSearchResults && (
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream text-ink font-mono-jb text-[11px] font-bold px-3 py-1.5 shadow-press">
                  <Doodle.Plus size={10} className="text-ink" />
                  {profilesCount} builders
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-soft text-ink font-mono-jb text-[11px] font-bold px-3 py-1.5 shadow-press">
                  {postsCount} posts · live
                </span>
              </div>
              <ScribbleUnderline w={180} className="text-orange" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
