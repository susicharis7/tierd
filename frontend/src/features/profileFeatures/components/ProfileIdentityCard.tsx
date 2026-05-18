import { Pencil, UserCheck, UserPlus } from "lucide-react";

import { Doodle, UserAvatar } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { mockMutuals } from "../profileData";

interface ProfileIdentityCardProps {
  displayName: string;
  username: string;
  avatarUrl: string | null | undefined;
  headline: string;
  location: string;
  bio: string;
  bioExpanded: boolean;
  onToggleBio: () => void;

  isOwnProfile: boolean;
  isFollowing: boolean;
  followPending: boolean;
  onEdit: () => void;
  onToggleFollow: () => void;
}

/**
 * Profile head — avatar (overlapping the banner) + name block (verified pill,
 * handle/role/location, actions, bio, links). The card wrapper is gone in the
 * new layout: the head sits directly on the page background so the banner's
 * cover-art and the stats stickers below can breathe.
 */
const ProfileIdentityCard = ({
  displayName,
  username,
  avatarUrl,
  headline,
  location,
  bio,
  bioExpanded,
  onToggleBio,
  isOwnProfile,
  isFollowing,
  followPending,
  onEdit,
  onToggleFollow,
}: ProfileIdentityCardProps) => {
  return (
    <div className="relative -mt-[50px] z-[2] flex flex-col sm:flex-row gap-5 sm:gap-7 px-2 sm:px-4">
      {/* Avatar with verified badge */}
      <div className="shrink-0 self-start">
        <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-[24px] bg-ink-2 p-1.5 border-[4px] border-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <div className="w-full h-full rounded-[18px] overflow-hidden flex items-center justify-center bg-[linear-gradient(135deg,#FFB892_0%,#FF7B45_100%)]">
            <UserAvatar
              name={displayName}
              src={avatarUrl}
              size={120}
              className="!w-full !h-full"
            />
          </div>
          <span
            className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-[12px] bg-orange text-cream flex items-center justify-center border-[3px] border-ink shadow-[0_3px_0_rgba(0,0,0,0.3)]"
            style={{ transform: "rotate(-8deg)" }}
            aria-label="verified"
          >
            <Doodle.Shield size={18} className="text-cream" />
          </span>
        </div>
      </div>

      {/* Name block */}
      <div className="flex-1 min-w-0 sm:pt-[60px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-boldonse text-[40px] sm:text-[52px] lg:text-[64px] text-cream leading-none">
                {displayName}
              </h1>
              <span
                className="inline-flex items-center rounded-lg bg-cream text-ink font-mono-jb font-bold text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 shadow-press"
                style={{ transform: "rotate(-4deg)" }}
              >
                VERIFIED ✓
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3 font-mono-jb text-[13px]">
              <span className="text-cream">@{username}</span>
              <span className="text-muted-ink">·</span>
              <span className="text-muted-ink">{headline}</span>
              <span className="text-muted-ink">·</span>
              <span className="text-muted-ink inline-flex items-center gap-1.5">
                <Doodle.Pin size={11} className="text-orange" />
                {location}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-full bg-cream text-ink font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-press hover:translate-y-px transition-transform"
              >
                <Pencil size={13} /> edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onToggleFollow}
                  disabled={followPending}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-press hover:translate-y-px transition-transform disabled:opacity-50",
                    isFollowing
                      ? "bg-ink-2 text-cream border border-cream/20"
                      : "bg-cream text-ink",
                  )}
                >
                  {followPending ? (
                    "updating…"
                  ) : isFollowing ? (
                    <>
                      <UserCheck size={13} /> following
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} /> + follow
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-transparent text-cream font-mono-jb text-[13px] px-[18px] py-2.5 border-[1.5px] border-cream/30 hover:border-cream/50 transition-colors"
                >
                  message
                </button>
                <button
                  type="button"
                  className="rounded-full bg-transparent text-cream font-mono-jb text-[13px] px-3.5 py-2.5 border-[1.5px] border-cream/30 hover:border-cream/50 transition-colors"
                  aria-label="more"
                >
                  ···
                </button>
              </>
            )}
          </div>
        </div>

        <div
          className={cn(
            "mt-4 max-w-[720px] font-grot font-medium text-[15px] sm:text-[17px] leading-[1.5] text-cream/85",
            !bioExpanded && "line-clamp-2",
          )}
        >
          {bio}
        </div>
        {bio.length > 120 && (
          <button
            type="button"
            onClick={onToggleBio}
            className="mt-1 font-mono-jb text-[11px] font-bold text-orange/80 hover:text-orange transition-colors"
          >
            {bioExpanded ? "show less" : "show more"}
          </button>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 font-mono-jb text-[12px] text-cream">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 underline decoration-dashed underline-offset-[4px] hover:text-orange transition-colors"
          >
            <Doodle.CodeBracket size={12} className="text-orange" />
            github.com/{username}
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 underline decoration-dashed underline-offset-[4px] hover:text-orange transition-colors"
          >
            <Doodle.Pin size={12} className="text-orange" />
            {username}.dev
          </a>
          <span className="text-muted-ink">
            + {mockMutuals.length} mutual builders you both follow
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileIdentityCard;
