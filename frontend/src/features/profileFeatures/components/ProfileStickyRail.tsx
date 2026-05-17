import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import {
  ACHIEVEMENT_TAG_BG,
  PROJECT_ACCENT_BG,
  mockAchievements,
  mockProjects,
} from "../profileData";

/**
 * Right-side rail with pinned projects + achievements. Designed to sit inside
 * a 2-col grid item with `lg:sticky lg:top-[140px]` on the wrapping aside —
 * the wrapper handles stickiness; this component just renders content.
 */
const ProfileStickyRail = () => {
  return (
    <div className="space-y-7">
      <ProjectsSection />
      <AchievementsSection />
    </div>
  );
};

const ProjectsSection = () => (
  <section>
    <div className="flex items-center gap-2.5 mb-4">
      <Doodle.CodeBracket size={14} className="text-orange" />
      <MonoCaption tone="cream">// pinned projects</MonoCaption>
      <div className="flex-1 h-px bg-cream/10" />
      <MonoCaption tone="cream" className="text-[9px]">
        {mockProjects.length} of 12
      </MonoCaption>
    </div>
    <div className="flex flex-col gap-2.5">
      {mockProjects.map((p) => (
        <div
          key={p.name}
          className="rounded-[14px] bg-ink-2 border border-ink-line p-4 flex items-center gap-4"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-boldonse text-[20px] text-cream shrink-0",
              PROJECT_ACCENT_BG[p.accent],
              p.accent === "tape" || p.accent === "sage" ? "!text-ink" : "",
            )}
          >
            {p.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-grot font-extrabold text-[15px] text-cream truncate">
                {p.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/[0.05] border border-cream/15 font-mono-jb text-[9px] text-cream/85 px-2 py-0.5">
                <span
                  className={cn(
                    "w-[5px] h-[5px] rounded-full",
                    PROJECT_ACCENT_BG[p.accent],
                  )}
                />
                {p.lang}
              </span>
              {p.featured && (
                <span className="rounded-md bg-orange/15 text-orange border border-orange/30 font-mono-jb text-[9px] font-bold px-1.5 py-0.5">
                  featured
                </span>
              )}
            </div>
            <p className="font-mono-jb text-[11px] text-muted-ink mt-1 leading-[1.5] truncate">
              {p.desc}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 font-mono-jb text-[12px] text-cream">
              <span className="text-orange">✦</span> {p.stars}
            </span>
            <Doodle.ArrowSquiggle w={28} h={12} className="text-orange" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const AchievementsSection = () => (
  <section>
    <div className="flex items-center gap-2.5 mb-4">
      <Doodle.Trophy size={14} className="text-orange" />
      <MonoCaption tone="cream">// achievements</MonoCaption>
      <div className="flex-1 h-px bg-cream/10" />
      <MonoCaption tone="cream" className="text-[9px]">
        milestones · wins
      </MonoCaption>
    </div>
    <div className="flex flex-col gap-2.5">
      {mockAchievements.map((a) => (
        <div
          key={a.title}
          className="rounded-[12px] bg-cream/[0.03] border border-dashed border-cream/15 p-4 flex items-center gap-4"
        >
          <span
            className={cn(
              "rounded-md font-mono-jb font-bold text-[9px] tracking-[0.05em] px-2 py-1 min-w-[68px] text-center shrink-0",
              ACHIEVEMENT_TAG_BG[a.tag],
            )}
          >
            {a.tag}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-grot font-bold text-[14px] text-cream leading-[1.3]">
              {a.title}
            </p>
            <p className="font-mono-jb text-[11px] text-muted-ink leading-[1.5] mt-0.5">
              {a.desc}
            </p>
          </div>
          <span className="font-mono-jb text-[11px] font-bold text-orange shrink-0">
            {a.xp}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default ProfileStickyRail;
