import { X, Image as ImageIcon } from "lucide-react";

import { Doodle, Sticker, UserAvatar } from "../../../components/tierd";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "../../../components/ui/sonner";
import { Textarea } from "../../../components/ui/textarea";

type ExploreComposerProps = {
  authLoading: boolean;
  userId: string | null;
  currentProfile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  composerContent: string;
  onComposerContentChange: (value: string) => void;
  composerImagePreview: string | null;
  onComposerImageSelect: (file: File) => void;
  onComposerImageRemove: () => void;
  onComposerSubmit: () => void;
  createPostPending: boolean;
};

export function ExploreComposer({
  authLoading,
  userId,
  currentProfile,
  composerContent,
  onComposerContentChange,
  composerImagePreview,
  onComposerImageSelect,
  onComposerImageRemove,
  onComposerSubmit,
  createPostPending,
}: ExploreComposerProps) {
  if (authLoading) return null;

  const composerName =
    currentProfile?.full_name?.trim() ||
    currentProfile?.username ||
    "Builder";

  if (userId) {
    return (
      <Sticker color="cream" tilt={0.6} padding="lg" radius="lg">
        <div className="flex items-start gap-3.5">
          <UserAvatar
            name={composerName}
            src={currentProfile?.avatar_url}
            size={42}
          />
          <div className="flex-1 min-w-0">
            <Textarea
              value={composerContent}
              onChange={(e) => onComposerContentChange(e.target.value)}
              placeholder="what did you ship today?"
              className="min-h-[3.5rem] resize-none border-none bg-transparent p-0 text-[20px] sm:text-[22px] font-grot font-bold leading-[1.3] text-ink placeholder:text-ink/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={2}
            />
            <p className="font-mono-jb text-[11px] text-muted-cream mt-1">
              drop a commit, screenshot, or thought. 280 chars · markdown ok.
            </p>

            {composerImagePreview && (
              <div className="relative inline-block max-w-full mt-3">
                <img
                  src={composerImagePreview}
                  alt="Preview"
                  className="h-24 max-h-28 w-auto rounded-xl border border-ink/15 object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-ink/30 bg-cream hover:bg-orange/20 transition-colors"
                  onClick={onComposerImageRemove}
                  aria-label="Remove image"
                >
                  <X size={12} className="text-ink/60" />
                </button>
              </div>
            )}

            <div className="border-t border-dashed border-ink/15 mt-4 pt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="composer-image"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink/[0.06] text-ink font-mono-jb text-[10px] font-bold uppercase tracking-[0.05em] px-2.5 py-1.5 cursor-pointer hover:bg-ink/10 transition-colors"
                >
                  <ImageIcon size={12} />+ IMG
                </Label>
                <Input
                  id="composer-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onComposerImageSelect(file);
                  }}
                  className="hidden"
                />
                {(["CODE", "POLL", "LINK"] as const).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-lg bg-ink/[0.06] text-ink/40 font-mono-jb text-[10px] font-bold uppercase tracking-[0.05em] px-2.5 py-1.5 cursor-not-allowed"
                  >
                    + {t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onComposerSubmit}
                disabled={createPostPending || !composerContent.trim()}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-press hover:translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {createPostPending ? "posting…" : "ship it"}
                <Doodle.Bolt size={12} className="text-cream" />
              </button>
            </div>

            {!currentProfile && (
              <p className="font-mono-jb text-[11px] text-muted-cream mt-2">
                Your profile record is missing or still loading; posting may
                take longer.
              </p>
            )}
          </div>
        </div>
      </Sticker>
    );
  }

  return (
    <div className="rounded-[14px] border border-dashed border-cream/20 bg-cream/[0.03] p-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-grot font-extrabold text-[15px] text-cream mb-0.5">
          Sign in to post
        </p>
        <p className="font-mono-jb text-[11px] text-muted-ink">
          Share updates, like posts, and join the conversation.
        </p>
      </div>
      <button
        type="button"
        className="rounded-full border border-cream/30 text-cream font-mono-jb font-bold text-[12px] px-5 py-2 hover:border-cream/50 transition-colors"
        onClick={() =>
          toast("Use the Log in button in the top-right to post.")
        }
      >
        log in
      </button>
    </div>
  );
}
