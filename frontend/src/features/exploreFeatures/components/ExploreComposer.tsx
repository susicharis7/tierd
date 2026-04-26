import { X, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "../../../components/ui/sonner";

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

  if (userId) {
    return (
      <div className="rounded-2xl border border-border/30 bg-muted/4 mb-4 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3">
            <div className="shrink-0 pt-0.5">
              <Avatar className="h-10 w-10 ring-1 ring-border/30">
                {currentProfile?.avatar_url && (
                  <AvatarImage src={currentProfile.avatar_url} />
                )}
                <AvatarFallback className="bg-ember/10 text-ember font-display font-bold text-sm">
                  {currentProfile
                    ? (
                        currentProfile.full_name ||
                        currentProfile.username ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <Textarea
                value={composerContent}
                onChange={(e) => onComposerContentChange(e.target.value)}
                placeholder="What did you build today?"
                className="min-h-[3.5rem] resize-none border-none bg-transparent p-0 text-sm leading-relaxed placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={2}
              />
              {composerImagePreview && (
                <div className="relative inline-block max-w-full">
                  <img
                    src={composerImagePreview}
                    alt="Preview"
                    className="h-20 max-h-24 w-auto rounded-xl border border-border/30 object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-background transition-colors hover:bg-destructive/20"
                    onClick={onComposerImageRemove}
                    aria-label="Remove image"
                  >
                    <X size={12} className="text-foreground/60" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 border-t border-border/15 pt-3">
                <div className="flex items-center gap-1">
                  <Label
                    htmlFor="composer-image"
                    className="cursor-pointer rounded-lg p-2 text-muted-foreground/40 transition-colors hover:bg-muted/15 hover:text-muted-foreground"
                  >
                    <ImageIcon size={18} />
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
                </div>
                <button
                  className="btn-primary shrink-0 px-5 py-2 text-xs"
                  onClick={onComposerSubmit}
                  disabled={createPostPending || !composerContent.trim()}
                  type="button"
                >
                  {createPostPending ? "Posting..." : "Post"}
                </button>
              </div>
              {!currentProfile && (
                <p className="text-xs text-muted-foreground/40">
                  Your profile record is missing or still loading;
                  posting may take longer.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/30 bg-muted/4 mb-4 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-sm text-foreground mb-0.5">
            Sign in to post
          </p>
          <p className="text-xs text-muted-foreground/50">
            Share updates, like posts, and join the conversation.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost text-xs py-2 shrink-0"
          onClick={() =>
            toast("Use the Log in button in the top-right to post.")
          }
        >
          Log in
        </button>
      </div>
    </div>
  );
}
