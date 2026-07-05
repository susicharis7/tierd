import { Doodle } from "../../../components/tierd";
import { InlineSpinner } from "../../../components/ui/loading";

type ExploreSearchBarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchLoading: boolean;
};

/**
 * Sticky cream-sticker search input. Lives at the top of the page body so it
 * stays pinned while the feed scrolls (sticks under the fixed Navbar).
 */
export function ExploreSearchBar({
  searchQuery,
  onSearchQueryChange,
  searchLoading,
}: ExploreSearchBarProps) {
  return (
    <div className="sticky top-[72px] z-30 bg-ink/85 backdrop-blur-xl border-b border-dashed border-cream/[0.08] py-3">
      <div className="section-container">
        <div
          className="relative rounded-[18px] bg-cream text-ink p-[6px] pl-[22px] flex items-center gap-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-ink/[0.08]"
          style={{ transform: "rotate(-0.3deg)" }}
        >
          <Doodle.Search size={18} className="text-ink shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="search builders by name, handle, or repo..."
            className="flex-1 border-none bg-transparent outline-none font-mono-jb text-[14px] text-ink placeholder:text-ink/40 py-3 min-w-0"
          />
          <span className="hidden sm:inline-flex items-center font-mono-jb text-[11px] uppercase tracking-[0.1em] text-muted-cream">
            FILTERS
          </span>
          {searchLoading && (
            <InlineSpinner tone="light" label="Searching" />
          )}
          <button
            type="button"
            className="rounded-[14px] bg-ink text-cream font-mono-jb font-bold text-[13px] px-5 py-3 inline-flex items-center gap-2 hover:translate-y-px transition-transform shrink-0"
          >
            <Doodle.Bolt size={13} className="text-orange" />
            search
          </button>
        </div>
      </div>
    </div>
  );
}
