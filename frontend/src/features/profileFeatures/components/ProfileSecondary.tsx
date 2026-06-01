import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import {
  formatChallengeStartsIn,
  formatChallengeTimeLeft,
  useMyActiveChallengeQuery,
} from "../../challengesFeatures/useChallengesData";
import { profileBadges, BADGE_BG, BADGE_TILTS } from "../profileData";
import type { ProjectRow } from "../../../repositories/projectRepository";

interface ProfileSecondaryProps {
  userId: string | null;
  postsLabel: string;
  followersCount: number;
  followingCount: number;
  currentScore: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  projects: ProjectRow[];
  projectsLoading: boolean;
  canManageProjects: boolean;
  addingProject: boolean;
  deletingProjectId: string | null;
  onAddProject: (input: {
    name: string;
    description?: string;
    repoUrl?: string;
    liveUrl?: string;
  }) => Promise<void>;
  onDeleteProject: (projectId: string) => void;
}

const ProfileSecondary = ({
  userId,
  postsLabel,
  followersCount,
  followingCount,
  currentScore,
  onOpenFollowers,
  onOpenFollowing,
  projects,
  projectsLoading,
  canManageProjects,
  addingProject,
  deletingProjectId,
  onAddProject,
  onDeleteProject,
}: ProfileSecondaryProps) => {
  return (
    <div className="space-y-6">
      <StatsRow
        postsLabel={postsLabel}
        followersCount={followersCount}
        followingCount={followingCount}
        currentScore={currentScore}
        onOpenFollowers={onOpenFollowers}
        onOpenFollowing={onOpenFollowing}
      />
      <BadgesCard />
      <ActiveChallengeCard userId={userId} />
      <ProjectsSection
        projects={projects}
        projectsLoading={projectsLoading}
        canManageProjects={canManageProjects}
        addingProject={addingProject}
        deletingProjectId={deletingProjectId}
        onAddProject={onAddProject}
        onDeleteProject={onDeleteProject}
      />
    </div>
  );
};

const ActiveChallengeCard = ({ userId }: { userId: string | null }) => {
  const query = useMyActiveChallengeQuery(userId);
  const challenge = query.data;

  const timer = challenge
    ? challenge.phase === "upcoming"
      ? formatChallengeStartsIn(challenge.starts_at)
      : formatChallengeTimeLeft(challenge.ends_at)
    : null;

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-3">
        <Doodle.Bolt size={14} className="text-orange" />
        <MonoCaption tone="cream">// active challenge</MonoCaption>
      </div>
      {challenge ? (
        <>
          <p className="font-grot font-extrabold text-[20px] leading-tight text-cream">
            {challenge.title}
          </p>
          <p className="font-mono-jb text-[11px] text-muted-ink mt-2">
            {challenge.phase === "upcoming" ? "starts in" : "ends in"} {timer ?? "-"}
          </p>
          <Link
            to={`/challenges/${challenge.id}`}
            className="inline-flex mt-3 rounded-full bg-orange text-cream font-mono-jb font-bold text-[11px] px-3.5 py-1.5"
          >
            open challenge
          </Link>
        </>
      ) : (
        <p className="font-mono-jb text-[12px] text-muted-ink">
          no active challenges joined.
        </p>
      )}
    </div>
  );
};

interface StatsRowProps {
  postsLabel: string;
  followersCount: number;
  followingCount: number;
  currentScore: number;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
}

const StatsRow = ({
  postsLabel,
  followersCount,
  followingCount,
  currentScore,
  onOpenFollowers,
  onOpenFollowing,
}: StatsRowProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <StatSticker label="posts" value={postsLabel} color="cream" tilt={-1.5} />
    <StatSticker
      label="following"
      value={followingCount.toLocaleString()}
      color="peach"
      tilt={1}
      onClick={onOpenFollowing}
    />
    <StatSticker
      label="followers"
      value={followersCount.toLocaleString()}
      color="sage"
      tilt={-1}
      onClick={onOpenFollowers}
    />
    <StatSticker
      label="score"
      value={currentScore.toLocaleString()}
      color="orange"
      tilt={1.2}
    />
  </div>
);

interface StatStickerProps {
  label: string;
  value: string;
  color: "cream" | "peach" | "sage" | "orange";
  tilt: number;
  onClick?: () => void;
}

const StatSticker = ({ label, value, color, tilt, onClick }: StatStickerProps) => {
  const colorMap: Record<StatStickerProps["color"], string> = {
    cream: "bg-cream text-ink",
    peach: "bg-peach text-ink",
    sage: "bg-sage text-ink",
    orange: "bg-orange text-cream",
  };
  const isOrange = color === "orange";

  const className = cn(
    "rounded-[14px] px-5 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.2)] block text-left w-full",
    colorMap[color],
  );
  const style = { transform: `rotate(${tilt}deg)` };

  const body = (
    <>
      <div className="font-boldonse text-[32px] sm:text-[38px] leading-none">{value}</div>
      <div
        className={cn(
          "font-mono-jb font-bold uppercase tracking-[0.1em] text-[9px] mt-2",
          isOrange ? "text-cream/70" : "text-muted-cream",
        )}
      >
        {label}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {body}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {body}
    </div>
  );
};

const BadgesCard = () => (
  <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-5 sm:p-6">
    <div className="flex items-center gap-2.5 mb-4 flex-wrap">
      <Doodle.Trophy size={14} className="text-orange" />
      <MonoCaption tone="cream">// badges . {String(profileBadges.length).padStart(2, "0")} earned</MonoCaption>
      <Doodle.ArrowSquiggle w={40} h={14} className="text-orange" />
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {profileBadges.map((b, i) => {
        const lightBg = b.accent === "tape" || b.accent === "sage";
        return (
          <div
            key={b.label}
            className={cn(
              "rounded-[14px] px-3 py-3.5 text-center cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.15)]",
              BADGE_BG[b.accent],
            )}
            style={{ transform: `rotate(${BADGE_TILTS[i % BADGE_TILTS.length]}deg)` }}
          >
            <div className="text-[24px] leading-none mb-1.5">{b.glyph}</div>
            <div className="font-grot font-extrabold text-[11px] leading-[1.2]">{b.label}</div>
            <div
              className={cn(
                "font-mono-jb text-[8px] uppercase tracking-[0.06em] mt-1",
                lightBg ? "text-muted-cream" : "text-cream/70",
              )}
            >
              {b.earned}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

interface ProjectsSectionProps {
  projects: ProjectRow[];
  projectsLoading: boolean;
  canManageProjects: boolean;
  addingProject: boolean;
  deletingProjectId: string | null;
  onAddProject: (input: {
    name: string;
    description?: string;
    repoUrl?: string;
    liveUrl?: string;
  }) => Promise<void>;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsSection = ({
  projects,
  projectsLoading,
  canManageProjects,
  addingProject,
  deletingProjectId,
  onAddProject,
  onDeleteProject,
}: ProjectsSectionProps) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddProject({ name, description, repoUrl, liveUrl });
    setName("");
    setDescription("");
    setRepoUrl("");
    setLiveUrl("");
    setOpenAdd(false);
  };

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <Doodle.CodeBracket size={14} className="text-orange" />
        <MonoCaption tone="cream">// submitted projects</MonoCaption>
        <div className="flex-1 h-px bg-cream/10" />
        <MonoCaption tone="cream" className="text-[9px]">{projects.length} total</MonoCaption>
      </div>

      {canManageProjects && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setOpenAdd((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-cream/25 px-3 py-1.5 font-mono-jb text-[11px] uppercase tracking-[0.08em] text-cream hover:border-cream/45"
          >
            <span className="text-orange">+</span>
            add project
          </button>
        </div>
      )}

      {openAdd && (
        <form
          onSubmit={submitAdd}
          className="mb-4 rounded-[14px] border border-cream/12 bg-cream/[0.03] p-4 space-y-3"
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-[10px] h-10 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb text-[13px]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
            className="w-full rounded-[10px] px-3 py-2 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb text-[12px]"
          />
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHub repo URL (optional)"
            className="w-full rounded-[10px] h-10 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb text-[12px]"
          />
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="Live/demo URL (optional)"
            className="w-full rounded-[10px] h-10 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb text-[12px]"
          />
          <button
            type="submit"
            disabled={addingProject}
            className="inline-flex items-center justify-center rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2 disabled:opacity-60"
          >
            {addingProject ? "saving..." : "submit project"}
          </button>
        </form>
      )}

      {projectsLoading ? (
        <div className="rounded-[14px] border border-ink-line bg-ink-2 p-4 font-mono-jb text-[12px] text-muted-ink">
          loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-cream/15 bg-cream/[0.03] p-6 text-center font-mono-jb text-[12px] text-muted-ink">
          no submitted projects yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-[14px] bg-ink-2 border border-ink-line p-4 sm:p-[18px] flex items-start gap-3"
            >
              <div className="w-11 h-11 rounded-[10px] bg-cream/[0.06] border border-cream/15 flex items-center justify-center shrink-0">
                <Doodle.CodeBracket size={14} className="text-cream/80" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-grot font-extrabold text-[19px] leading-tight text-cream truncate">{p.name}</h3>
                  {p.is_verified && (
                    <span className="rounded-md bg-forest/20 text-sage border border-forest/40 font-mono-jb text-[9px] uppercase tracking-[0.08em] font-bold px-1.5 py-0.5">
                      verified
                    </span>
                  )}
                </div>

                {p.description && (
                  <p className="font-mono-jb text-[12px] text-muted-ink mt-1.5 leading-[1.5]">{p.description}</p>
                )}

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {p.repo_url && (
                    <a
                      href={p.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-cream/20 px-2.5 py-1 font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/85 hover:text-cream"
                    >
                      repo
                    </a>
                  )}
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-cream/20 px-2.5 py-1 font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/85 hover:text-cream"
                    >
                      live
                    </a>
                  )}
                </div>
              </div>

              {canManageProjects && (
                <button
                  type="button"
                  disabled={deletingProjectId === p.id}
                  onClick={() => onDeleteProject(p.id)}
                  className="shrink-0 rounded-full border border-cream/20 w-8 h-8 inline-flex items-center justify-center text-cream/70 hover:text-cream disabled:opacity-50"
                >
                  {deletingProjectId === p.id ? "..." : <X size={14} />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileSecondary;