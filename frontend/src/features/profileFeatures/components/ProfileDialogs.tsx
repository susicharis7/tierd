import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Lock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "../../../components/ui/sonner";
import { UserAvatar } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../authFeatures/AuthProvider";
import { updateProfile, uploadAvatar } from "../../authFeatures/auth";
import { TECH_OPTIONS, type TechOption } from "../profileData";

/* ─────────── Guest gate (overlay shown when not signed in) ─────────── */

interface ProfileGuestGateProps {
  onAuth: (mode: "login" | "signup") => void;
}

export function ProfileGuestGate({ onAuth }: ProfileGuestGateProps) {
  return (
    <div
      className="fixed inset-x-0 top-16 bottom-0 z-40 flex items-center justify-center bg-ink/85 backdrop-blur-md px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-guest-title"
      aria-describedby="profile-guest-desc"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[18px] bg-ink-2 border border-cream/10 p-8 text-center shadow-[0_0_60px_-12px_hsl(var(--orange)/0.35)]"
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange/15 ring-1 ring-orange/30"
          aria-hidden
        >
          <Lock className="h-6 w-6 text-orange" />
        </div>
        <h2
          id="profile-guest-title"
          className="font-grot font-extrabold text-[20px] text-cream mb-2"
        >
          Sign in to unlock your profile
        </h2>
        <p
          id="profile-guest-desc"
          className="font-mono-jb text-[12px] text-muted-ink leading-[1.6] mb-7"
        >
          Log in or create an account to edit your profile, avatar, and handle —
          and connect your Tierd<span className="text-orange">.</span> builder
          identity.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-6 py-2.5 shadow-cta-orange hover:translate-y-px transition-transform"
            onClick={() => onAuth("login")}
          >
            log in
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border-[1.5px] border-cream/30 text-cream font-mono-jb font-bold text-[13px] px-6 py-2.5 hover:border-cream/50 transition-colors"
            onClick={() => onAuth("signup")}
          >
            sign up
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────── Edit profile dialog ─────────── */

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (next: { username?: string | null }) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  onSaved,
}: EditProfileDialogProps) {
  const { profile, userId, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);

      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(userId, avatarFile);
      }

      const fields: Record<string, string> = {};
      const trimmedName = fullName.trim();
      const trimmedUsername = username
        .trim()
        .toLowerCase()
        .replace(/^@/, "");

      if (trimmedName) fields.full_name = trimmedName;
      if (trimmedUsername) fields.username = trimmedUsername;
      if (avatarUrl) fields.avatar_url = avatarUrl;

      let nextUsername: string | null = null;
      if (Object.keys(fields).length > 0) {
        const updated = await updateProfile(userId, fields);
        nextUsername = updated?.username ?? fields.username ?? null;
      }

      await refreshProfile();
      onSaved?.({ username: nextUsername });
      toast("Profile updated");
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      toast(msg);
      console.error("EditProfile error:", err);
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = avatarPreview || profile?.avatar_url || null;
  const previewName = profile?.full_name || profile?.username || "U";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] bg-ink-2 border-cream/15 text-cream p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="font-grot text-[20px] font-extrabold text-cream">
              edit profile
            </DialogTitle>
            <DialogDescription className="font-mono-jb text-[12px] text-muted-ink">
              Update your name, handle, or profile picture.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group rounded-full"
            >
              <UserAvatar name={previewName} src={previewUrl} size={80} />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-cream" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-fullname"
              className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-ink"
            >
              full name
            </Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="bg-cream/[0.05] border-cream/10 text-cream placeholder:text-muted-ink focus-visible:ring-orange/40"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-username"
              className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-ink"
            >
              username{" "}
              <span className="text-muted-ink/50">(optional)</span>
            </Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_handle"
              className="bg-cream/[0.05] border-cream/10 text-cream placeholder:text-muted-ink focus-visible:ring-orange/40"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-50"
          >
            {saving ? "saving…" : "save changes"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Followers / Following list dialogs ─────────── */

interface SocialListItem {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface SocialListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  items: SocialListItem[];
  pending: boolean;
  onNavigate: (item: SocialListItem) => void;
}

export function SocialListDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  pending,
  onNavigate,
}: SocialListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] bg-ink-2 border-cream/15 text-cream">
        <DialogHeader>
          <DialogTitle className="font-grot font-extrabold text-[20px] text-cream">
            {title}
          </DialogTitle>
          <DialogDescription className="font-mono-jb text-[12px] text-muted-ink">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] overflow-y-auto space-y-2">
          {pending ? (
            <p className="font-mono-jb text-[12px] text-muted-ink">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="font-mono-jb text-[12px] text-muted-ink">
              Nothing here yet.
            </p>
          ) : (
            items.map((item) => {
              const name = item.full_name ?? item.username ?? "User";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item)}
                  className="w-full flex items-center gap-3 rounded-[12px] border border-cream/10 bg-cream/[0.04] px-3 py-2 text-left hover:bg-cream/[0.08] transition-colors"
                >
                  <UserAvatar name={name} src={item.avatar_url} size={36} />
                  <div className="min-w-0">
                    <p className="font-grot font-bold text-[14px] text-cream truncate">
                      {name}
                    </p>
                    <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink truncate">
                      @{item.username ?? item.id.slice(0, 8)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Tech editor dialog ─────────── */

interface TechDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topTech: string[];
  onToggle: (t: TechOption) => void;
}

export function TechDialog({
  open,
  onOpenChange,
  topTech,
  onToggle,
}: TechDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] bg-ink-2 border-cream/15 text-cream">
        <DialogHeader>
          <DialogTitle className="font-grot font-extrabold text-[20px] text-cream">
            technologies
          </DialogTitle>
          <DialogDescription className="font-mono-jb text-[12px] text-muted-ink">
            Pick your top 2–3 technologies (highlighted). You can adjust this
            later.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-[12px] border border-cream/10 bg-cream/[0.04] p-4">
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-ink font-bold mb-2.5">
            top tech ({topTech.length}/3)
          </p>
          <div className="flex flex-wrap gap-2">
            {TECH_OPTIONS.map((t) => {
              const active = topTech.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggle(t)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-mono-jb text-[11px] font-medium transition-colors",
                    active
                      ? "bg-orange text-cream"
                      : "bg-cream/[0.05] text-cream border border-dashed border-cream/20 hover:border-cream/40",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {topTech.length >= 3 && (
            <p className="mt-3 font-mono-jb text-[11px] text-muted-ink">
              Max 3 selected. Unselect one to choose another.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

