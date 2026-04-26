import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  MapPin, BadgeCheck, ExternalLink, Flame, Zap,
  Github, Globe, Trophy, TrendingUp,
  Camera, Pencil, Lock, Shield, Award, Sparkles,
} from "lucide-react";
import { ProfileMotif } from "../../../components/PageBackgroundMotif";
import AuthDialog from "../../../components/AuthDialog";
import FeedImageLightbox from "../../../components/FeedImageLightbox";
import { useAuth } from "../../authFeatures/AuthProvider";
import { updateProfile, uploadAvatar } from "../../authFeatures/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "../../../components/ui/sonner";
import { getExploreActionableMessage } from "../../exploreFeatures/exploreErrors";
import { ExplorePostCard } from "../../exploreFeatures/ExplorePostCard";
import {
  useExploreAddCommentMutation,
  useExploreCommentsQuery,
  useExploreLikeMutation,
  useProfileByUsernameQuery,
  useUserPostsInfiniteQuery,
} from "../../exploreFeatures/useExplorePageData";

const projects = [
  { name: "NeuralDeploy", desc: "One-click ML model deployment. Next.js, Python, Docker.", stars: 412, verified: true, featured: true },
  { name: "FormForge", desc: "AI-powered form builder with validation generation.", stars: 187, verified: true, featured: false },
  { name: "PixelSync", desc: "Real-time collaborative design annotation tool.", stars: 156, verified: true, featured: false },
];

const achievements = [
  { title: "Won AI Challenge — Week 22", desc: "RAG pipeline scoring 94% on domain QA", xp: "+250 XP" },
  { title: "7-Week Shipping Streak", desc: "Consecutive weekly verified commits", xp: "+90 XP" },
  { title: "Reached Tier 4", desc: "Top 5% of all ranked developers", xp: "+500 XP" },
];

const badges = [
  { label: "Early Adopter", icon: Shield },
  { label: "Challenge Winner", icon: Trophy },
  { label: "7-Week Streak", icon: Flame },
  { label: "Open Source", icon: Github },
  { label: "AI Builder", icon: Zap },
  { label: "Verified ×3", icon: BadgeCheck },
];

const monthlyStats = [
  { label: "Challenges", value: "4", sub: "completed" },
  { label: "Commits", value: "87", sub: "verified" },
  { label: "XP Earned", value: "+840", sub: "this month" },
  { label: "Rank Δ", value: "+12", sub: "positions" },
];

const allTimeStats = [
  { label: "Total XP", value: "6,240" },
  { label: "Challenges Won", value: "9" },
  { label: "Projects Shipped", value: "12" },
  { label: "Streak Best", value: "12w" },
];

const generateHeatmapData = () => {
  const data: number[][] = [];
  for (let w = 0; w < 52; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const base = Math.random();
      if (w > 40) week.push(base > 0.3 ? Math.ceil(Math.random() * 4) : 0);
      else if (w > 30) week.push(base > 0.5 ? Math.ceil(Math.random() * 3) : 0);
      else week.push(base > 0.6 ? Math.ceil(Math.random() * 2) : 0);
    }
    data.push(week);
  }
  return data;
};
const heatmapData = generateHeatmapData();

function heatmapColor(level: number): string {
  switch (level) {
    case 0: return "bg-muted/20";
    case 1: return "bg-ember/20";
    case 2: return "bg-ember/40";
    case 3: return "bg-ember/60";
    case 4: return "bg-ember/80";
    default: return "bg-ember";
  }
}

const tiers = [
  { name: "Aegis", minScore: 2800, color: "from-amber-400 to-ember" },
  { name: "Tier 5", minScore: 2500, color: "from-ember to-ember-glow" },
  { name: "Tier 4", minScore: 2200, color: "from-ember/80 to-ember" },
  { name: "Tier 3", minScore: 1800, color: "from-muted-foreground to-ember/60" },
  { name: "Tier 2", minScore: 1400, color: "from-muted-foreground/60 to-muted-foreground" },
  { name: "Tier 1", minScore: 800, color: "from-muted/60 to-muted-foreground/40" },
  { name: "Unranked", minScore: 0, color: "from-muted/30 to-muted/50" },
];

const currentScore = 2401;
const currentTierIndex = tiers.findIndex((t, i) => currentScore >= t.minScore && (i === 0 || currentScore < tiers[i - 1].minScore));
const nextTier = currentTierIndex > 0 ? tiers[currentTierIndex - 1] : null;
const progressToNext = nextTier
  ? ((currentScore - tiers[currentTierIndex].minScore) / (nextTier.minScore - tiers[currentTierIndex].minScore)) * 100
  : 100;

type ProfileAuthMode = "login" | "signup";

/* ── Edit Profile Dialog ── */
function EditProfileDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (next: { username?: string | null }) => void;
}) {
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
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
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
      const trimmedUsername = username.trim().toLowerCase().replace(/^@/, "");

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

  const previewUrl = avatarPreview || profile?.avatar_url;
  const initial = (profile?.full_name || profile?.username || "U").charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-surface max-w-[420px] border-border/60 p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="font-display text-xl font-bold tracking-tight">
              Edit profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your name, handle, or profile picture.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Avatar picker */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group"
            >
              <Avatar className="h-20 w-20">
                {previewUrl && <AvatarImage src={previewUrl} alt="Avatar" />}
                <AvatarFallback
                  className="font-display text-2xl font-bold text-ember"
                  style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.3), hsl(var(--ember-glow) / 0.2))" }}
                >
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
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
            <Label htmlFor="edit-fullname" className="text-xs text-muted-foreground">
              Full name
            </Label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-username" className="text-xs text-muted-foreground">
              Username <span className="text-muted-foreground/50">(optional)</span>
            </Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_handle"
              className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Profile Page ── */
const Profile = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username: string }>();
  const { profile: authProfile, session, userId: authUserId, loading: authLoading } = useAuth();

  const isOwnProfile = useMemo(() => {
    if (!authProfile || !routeUsername) return false;
    const clean = routeUsername.toLowerCase().replace(/^@/, "");
    return (
      clean === authProfile.username?.toLowerCase() ||
      clean === authUserId?.toLowerCase() ||
      clean === "me"
    );
  }, [authProfile, authUserId, routeUsername]);

  const externalProfileQuery = useProfileByUsernameQuery(
    isOwnProfile ? undefined : routeUsername,
  );

  const profile = isOwnProfile
    ? authProfile
    : externalProfileQuery.data ?? null;

  const resolvedUserId = isOwnProfile
    ? authUserId
    : externalProfileQuery.data?.id ?? null;

  const userPostsQuery = useUserPostsInfiniteQuery(authUserId, resolvedUserId);
  const userPosts =
    userPostsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const postsCountLabel =
    userPosts.length === 0
      ? "0"
      : userPostsQuery.hasNextPage
        ? `${userPosts.length}+`
        : String(userPosts.length);

  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null,
  );
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const commentsFetchPostId = lightboxPostId ?? openCommentsPostId;
  const commentsQuery = useExploreCommentsQuery(commentsFetchPostId);

  useEffect(() => {
    if (!commentsFetchPostId || !commentsQuery.isError) return;
    const err = commentsQuery.error;
    toast(getExploreActionableMessage(err) ?? "Could not load comments.");
  }, [commentsFetchPostId, commentsQuery.isError, commentsQuery.error]);

  const likeMutation = useExploreLikeMutation(authUserId);
  const commentMutation = useExploreAddCommentMutation(authUserId, authProfile);

  const commentsForActivePost = commentsFetchPostId
    ? (commentsQuery.data ?? [])
    : [];
  const commentsLoadingActive =
    Boolean(commentsFetchPostId) &&
    (commentsQuery.isPending || commentsQuery.isFetching);

  const lightboxPost = lightboxPostId
    ? userPosts.find((p) => p.id === lightboxPostId)
    : undefined;

  const handleOpenMediaLightbox = (postId: string) => {
    setOpenCommentsPostId(null);
    setCommentDraft("");
    setLightboxPostId(postId);
  };

  const handleToggleLike = (postId: string) => {
    if (!authUserId) {
      toast("Log in to like posts.");
      return;
    }
    likeMutation.mutate({ postId });
  };

  const handleToggleComments = (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      setCommentDraft("");
      return;
    }
    setOpenCommentsPostId(postId);
    setCommentDraft("");
  };

  const handleSubmitComment = (postId: string) => {
    if (!authUserId) {
      toast("Log in to comment.");
      return;
    }
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    commentMutation.mutate(
      { postId, content: trimmed },
      {
        onSuccess: () => {
          setCommentDraft("");
        },
      },
    );
  };

  const [editOpen, setEditOpen] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateMode, setAuthGateMode] = useState<ProfileAuthMode>("login");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [techOpen, setTechOpen] = useState(false);

  const showGuestGate = !authLoading && !session;

  const displayName = useMemo(() => {
    if (authLoading && isOwnProfile) return "Loading...";
    return profile?.full_name?.trim() || "Your Name";
  }, [profile, authLoading, isOwnProfile]);

  const displayUsername = useMemo(() => {
    if (authLoading && isOwnProfile) return "loading";
    return profile?.username?.trim() || "your_handle";
  }, [profile, authLoading, isOwnProfile]);

  const avatarInitial = useMemo(() => {
    const source = profile?.full_name || profile?.username || "U";
    return source.charAt(0).toUpperCase();
  }, [profile]);

  const profileHeadline = "Software Engineer";
  const profileLocation = "Sarajevo, Bosnia & Herzegovina";
  const profileBio =
    "Full-stack builder. Obsessed with developer tools and AI infra. Shipping every week, proving every day — performance, DX, and taste.";

  const mutualDevelopers = [
    { name: "Sara K.", username: "sarakdev" },
    { name: "Amir H.", username: "amirh_" },
    { name: "Lena M.", username: "lenam" },
    { name: "Dino B.", username: "dinob" },
  ];

  const techOptions = [
    "React", "TypeScript", "Node.js", "PostgreSQL", "Next.js",
    "Docker", "Python", "Rust", "Go", "AI/ML",
  ] as const;
  const [topTech, setTopTech] = useState<string[]>(["React", "TypeScript", "Node.js"]);
  const subSkills = useMemo(
    () => techOptions.filter((t) => !topTech.includes(t)),
    [topTech],
  );

  const toggleTopTech = (t: string) => {
    setTopTech((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev;
      return [...prev, t];
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ProfileMotif />
      <Navbar />

      {/* Guest gate */}
      {showGuestGate && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-md px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-guest-title"
          aria-describedby="profile-guest-desc"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface w-full max-w-md border border-border/60 p-8 text-center shadow-[0_0_60px_-12px_hsl(var(--ember)/0.25)]"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-ember/15 ring-1 ring-ember/25" aria-hidden>
              <Lock className="h-6 w-6 text-ember" />
            </div>
            <h2 id="profile-guest-title" className="font-display text-xl font-bold tracking-tight text-foreground mb-2">
              Sign in to unlock your profile
            </h2>
            <p id="profile-guest-desc" className="text-sm text-muted-foreground leading-relaxed mb-8">
              Log in or create an account to edit your profile, avatar, and handle — and connect your Tierd. builder identity.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" className="btn-primary text-sm px-6 py-2.5 w-full sm:w-auto" onClick={() => { setAuthGateMode("login"); setAuthGateOpen(true); }}>
                Log in
              </button>
              <button type="button" className="w-full sm:w-auto rounded-md border border-border/60 bg-muted/20 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40" onClick={() => { setAuthGateMode("signup"); setAuthGateOpen(true); }}>
                Sign up
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className={`pt-24 pb-0 relative z-10 ${showGuestGate ? "pointer-events-none select-none opacity-40" : ""}`}>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-container mt-5 mb-10"
        >
          {/* Banner — inset, rounded, blends into hero */}
          <div className="rounded-2xl border border-border/25 bg-muted/[0.03] overflow-hidden ring-1 ring-border/10">
            <div
              className="relative h-40 sm:h-48"
              style={{
                background:
                  "radial-gradient(720px 220px at 18% 28%, hsl(var(--ember) / 0.22), transparent 58%), radial-gradient(560px 200px at 88% 8%, hsl(var(--ember-glow) / 0.14), transparent 62%), linear-gradient(188deg, hsl(var(--glass) / 0.85) 0%, hsl(var(--background) / 0.75) 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.05]"
                aria-hidden
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--glass-border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--glass-border)) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-background/35 to-background"
                aria-hidden
              />
            </div>
          </div>

          {/* Row A — identity | rank + next tier */}
          <div className="relative z-10 -mt-12 sm:-mt-14">
            <div className="grid lg:grid-cols-[1fr_minmax(280px,340px)] gap-8 lg:gap-10 items-start">

              {/* Left: Identity (no technologies here) */}
              <div>
                {/* Avatar row */}
                <div className="flex items-end gap-5 sm:gap-6">
                  <div className="shrink-0">
                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-[4px] ring-background shadow-[0_8px_32px_-8px_hsl(var(--ember)/0.4)]">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={displayName} />
                      )}
                      <AvatarFallback
                        className="font-display text-3xl font-bold text-ember sm:text-4xl"
                        style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.25), hsl(var(--ember-glow) / 0.15))" }}
                      >
                        {avatarInitial}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Stats + Edit */}
                  <div className="flex flex-1 items-end justify-between gap-4 min-w-0 pb-1">
                    <div className="flex items-center gap-5 sm:gap-7">
                      {[
                        { label: "Posts", value: postsCountLabel },
                        { label: "Following", value: "128" },
                        { label: "Followers", value: "847" },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <p className="font-display font-bold text-lg leading-tight text-foreground">{s.value}</p>
                          <p className="text-xs text-muted-foreground/45 uppercase tracking-wider">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {isOwnProfile && profile && (
                      <button
                        onClick={() => setEditOpen(true)}
                        className="shrink-0 rounded-lg border border-border/30 bg-muted/10 px-4 py-2 text-xs font-medium text-muted-foreground/60 transition-all hover:bg-muted/20 hover:text-foreground hover:border-border/50"
                        type="button"
                      >
                        <Pencil size={13} className="inline mr-1.5 -mt-0.5" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Name + headline + location */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-title max-w-full truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {displayName}
                    </h1>
                    <BadgeCheck size={20} className="shrink-0 text-ember" aria-hidden />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-medium text-foreground/70">{profileHeadline}</span>
                    <span className="text-border/50">·</span>
                    <span className="text-muted-foreground/55">@{displayUsername}</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                    <MapPin size={12} className="shrink-0" aria-hidden />
                    <span>{profileLocation}</span>
                  </p>
                </div>

                {/* Bio + Social links */}
                <div className="mt-4 space-y-3">
                  <p className={`text-sm leading-relaxed text-foreground/80 ${bioExpanded ? "" : "line-clamp-2"}`}>
                    {profileBio}
                  </p>
                  {profileBio.length > 120 && (
                    <button
                      type="button"
                      onClick={() => setBioExpanded((v) => !v)}
                      className="text-xs font-medium text-ember/65 transition-colors hover:text-ember"
                    >
                      {bioExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <a href="#" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/30 bg-muted/8 px-3 text-xs text-muted-foreground/65 transition-all hover:border-border/50 hover:text-foreground">
                      <Github size={13} /> GitHub
                    </a>
                    <a href="#" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/30 bg-muted/8 px-3 text-xs text-muted-foreground/65 transition-all hover:border-border/50 hover:text-foreground">
                      <Globe size={13} /> Website
                    </a>
                  </div>
                </div>

                {/* Mutuals */}
                <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border/20 bg-muted/5 px-4 py-2.5">
                  <div className="flex -space-x-2 shrink-0">
                    {mutualDevelopers.slice(0, 4).map((m) => (
                      <div
                        key={m.username}
                        className="h-7 w-7 rounded-full border-2 border-background bg-muted/30 flex items-center justify-center text-[10px] font-semibold text-muted-foreground/60"
                        title={`${m.name} (@${m.username})`}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/50">
                    <span className="text-foreground/70 font-medium">{mutualDevelopers.length} mutual developers</span> you both follow
                  </p>
                </div>
              </div>

              {/* Right: Rank card (stretched taller) */}
              <div className="rounded-2xl border border-border/20 bg-muted/4 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={13} className="text-ember" />
                  <h3 className="font-display font-bold text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em]">Rank</h3>
                </div>
                <div className="text-center mb-5">
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--ember) / 0.12), hsl(var(--ember-glow) / 0.06))",
                      border: "1px solid hsl(var(--ember) / 0.2)",
                    }}
                  >
                    <span className="font-display font-bold text-3xl gradient-text">Tier 4</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[
                    { label: "Score", value: "2,401" },
                    { label: "Global Rank", value: "#847" },
                    { label: "Bosnia Rank", value: "#4" },
                    { label: "This Week", value: "+5" },
                    { label: "Percentile", value: "Top 5%" },
                    { label: "Peak Rank", value: "#790" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 rounded-xl bg-muted/6 flex flex-col items-center justify-center">
                      <p className="font-display font-bold text-sm text-foreground">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground/35 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row B — badges | technologies | monthly + all-time */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5"
          >
            <div className="min-w-0 rounded-2xl border border-border/20 bg-muted/4 p-4 lg:p-5">
              <h2 className="font-display font-bold text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                <Award size={13} className="text-ember shrink-0" /> Badges
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                {badges.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.label}
                      className="flex items-center gap-2 shrink-0 rounded-xl border border-border/20 bg-muted/5 px-3 py-2.5 transition-all hover:border-ember/15 hover:bg-ember/[0.03] group"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ember/8 group-hover:bg-ember/12 transition-colors shrink-0">
                        <Icon size={13} className="text-ember/70" />
                      </div>
                      <span className="text-[11px] font-medium text-foreground/75 whitespace-nowrap">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-border/20 bg-muted/4 p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">
                  Technologies
                </p>
                <button
                  type="button"
                  onClick={() => setTechOpen(true)}
                  className="text-[11px] font-medium text-ember/65 transition-colors hover:text-ember"
                >
                  Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {topTech.map((t) => (
                  <span
                    key={t}
                    className="inline-flex h-7 items-center rounded-lg px-2.5 text-[11px] font-bold text-ember"
                    style={{ background: "hsl(var(--ember) / 0.1)", border: "1px solid hsl(var(--ember) / 0.2)" }}
                  >
                    {t}
                  </span>
                ))}
                {subSkills.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="inline-flex h-7 items-center rounded-lg border border-border/25 bg-muted/8 px-2.5 text-[11px] font-medium text-muted-foreground/65"
                  >
                    {t}
                  </span>
                ))}
                {subSkills.length > 4 && (
                  <span className="inline-flex h-7 items-center rounded-lg border border-border/15 bg-muted/5 px-2.5 text-[11px] text-muted-foreground/35">
                    +{subSkills.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Tier Progress */}
            <div className="min-w-0 rounded-2xl border border-border/20 bg-muted/4 p-4 lg:p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-bold">Next Tier</p>
                {nextTier && (
                  <p className="text-[11px] text-muted-foreground/45">
                    <span className="text-ember font-bold">{nextTier.minScore - currentScore}</span> pts away
                  </p>
                )}
              </div>
              {nextTier && (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground/50 mb-2">
                    <span className="font-bold text-foreground/70">{tiers[currentTierIndex].name}</span>
                    <span className="font-bold text-foreground/70">{nextTier.name}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, hsl(var(--ember)), hsl(var(--ember-glow)))" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground/35 mt-1.5">
                    <span>{tiers[currentTierIndex].minScore}</span>
                    <span className="text-ember font-bold text-[11px]">{currentScore}</span>
                    <span>{nextTier.minScore}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Row C — Monthly+All-time | Activity heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6"
          >
            {/* Stats columns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-3 font-bold">This month</p>
                <div className="space-y-2.5">
                  {monthlyStats.map((s) => (
                    <div key={s.label}>
                      <p className="font-display font-bold text-base text-foreground leading-tight">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground/50">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-3 font-bold">All time</p>
                <div className="space-y-2.5">
                  {allTimeStats.map((s) => (
                    <div key={s.label}>
                      <p className="font-display font-bold text-base text-foreground leading-tight">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground/50">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity heatmap */}
            <div className="rounded-2xl border border-border/20 bg-muted/4 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-bold flex items-center gap-2">
                  <TrendingUp size={12} className="text-ember" /> Activity — Last 52 Weeks
                </p>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground/35">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={`w-2.5 h-2.5 rounded-sm ${heatmapColor(l)}`} />
                  ))}
                  <span>More</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-[3px]" style={{ minWidth: 680 }}>
                  {heatmapData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {week.map((day, di) => (
                        <div
                          key={di}
                          className={`w-[11px] h-[11px] rounded-[2px] ${heatmapColor(day)} transition-colors`}
                          title={`Week ${wi + 1}, Day ${di + 1}: ${day} contributions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/35 mt-3">
                <span className="font-bold text-foreground/60">312</span> contributions in the last year
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Posts + sticky Projects / Achievements */}
        <div className="section-container pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-7 min-w-0">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Posts</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground/45">
                    {userPostsQuery.hasNextPage
                      ? `${userPosts.length} shown · more below`
                      : `${userPosts.length} ${userPosts.length === 1 ? "post" : "posts"}`}
                  </p>
                </div>
              </div>

              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {userPostsQuery.isPending ? (
                  <div className="rounded-2xl border border-border/20 bg-muted/3 p-8">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/50">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-ember/30 border-t-ember" />
                      Loading posts...
                    </div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="rounded-2xl border border-border/20 bg-muted/3 p-10 text-center">
                    <Sparkles size={24} className="mx-auto mb-2 text-ember/50" />
                    <p className="text-sm font-medium text-foreground/70">No posts yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/45">
                      {isOwnProfile
                        ? "Head to Explore to share your first update."
                        : "This builder hasn't posted anything yet."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-border/20 bg-muted/3 overflow-hidden">
                      {userPosts.map((post, i) => (
                        <ExplorePostCard
                          key={post.id}
                          post={post}
                          index={i}
                          isCommentsOpen={openCommentsPostId === post.id}
                          comments={
                            openCommentsPostId === post.id &&
                            commentsFetchPostId === post.id
                              ? commentsForActivePost
                              : []
                          }
                          commentsLoading={
                            openCommentsPostId === post.id &&
                            commentsLoadingActive
                          }
                          commentDraft={commentDraft}
                          commentSubmitting={
                            commentMutation.isPending &&
                            commentMutation.variables?.postId === post.id
                          }
                          onToggleLike={() => handleToggleLike(post.id)}
                          onToggleComments={() => handleToggleComments(post.id)}
                          onChangeCommentDraft={setCommentDraft}
                          onSubmitComment={() => handleSubmitComment(post.id)}
                          onOpenMediaLightbox={() =>
                            handleOpenMediaLightbox(post.id)
                          }
                        />
                      ))}
                    </div>
                    {userPostsQuery.hasNextPage && (
                      <div className="mt-5 flex justify-center">
                        <button
                          type="button"
                          className="rounded-lg border border-border/40 bg-muted/10 px-5 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/20 hover:text-foreground disabled:opacity-50"
                          disabled={userPostsQuery.isFetchingNextPage}
                          onClick={() => void userPostsQuery.fetchNextPage()}
                        >
                          {userPostsQuery.isFetchingNextPage
                            ? "Loading…"
                            : "Load more posts"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.section>
            </div>

            <aside
              className="lg:col-span-5 min-w-0 space-y-10 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:pb-2 lg:-mr-1 lg:pr-1"
              aria-label="Projects and achievements"
            >
              <section>
                <div className="mb-4 border-b border-border/20 pb-3">
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Projects</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground/45">
                    {projects.length} {projects.length === 1 ? "showcased build" : "showcased builds"}
                  </p>
                </div>
                <div className="space-y-2.5">
                  {projects.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border bg-muted/4 p-4 sm:p-5 transition-all hover:bg-muted/6 group"
                      style={{ borderColor: p.featured ? "hsl(var(--ember) / 0.15)" : "hsl(var(--border) / 0.2)" }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-foreground group-hover:text-ember transition-colors">{p.name}</h3>
                          {p.featured && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md bg-ember/8 text-ember font-bold"
                              style={{ border: "1px solid hsl(var(--ember) / 0.15)" }}
                            >
                              Featured
                            </span>
                          )}
                        </div>
                        <ExternalLink size={12} className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground/55 mb-3 leading-relaxed">{p.desc}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/45">
                        {p.verified && (
                          <span className="flex items-center gap-1 text-emerald-400/70">
                            <BadgeCheck size={11} /> Verified
                          </span>
                        )}
                        <span>⭐ {p.stars}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-4 border-b border-border/20 pb-3">
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Achievements</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground/45">Milestones and wins</p>
                </div>
                <div className="space-y-2.5">
                  {achievements.map((a, i) => (
                    <div key={i} className="rounded-2xl border border-border/20 bg-muted/4 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-foreground mb-1">{a.title}</p>
                          <p className="text-xs text-muted-foreground/50 leading-relaxed">{a.desc}</p>
                        </div>
                        <span className="text-xs font-bold text-ember/70 shrink-0">{a.xp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <Footer />

      {lightboxPost?.image_url && (
        <FeedImageLightbox
          open
          onOpenChange={(next) => {
            if (!next) setLightboxPostId(null);
          }}
          post={lightboxPost}
          comments={commentsForActivePost}
          commentsLoading={commentsLoadingActive}
          commentDraft={commentDraft}
          onCommentDraftChange={setCommentDraft}
          onSubmitComment={() => handleSubmitComment(lightboxPost.id)}
          commentSubmitting={
            commentMutation.isPending &&
            commentMutation.variables?.postId === lightboxPost.id
          }
          onToggleLike={() => handleToggleLike(lightboxPost.id)}
        />
      )}

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={({ username }) => {
          const cleanNext = username?.trim().toLowerCase().replace(/^@/, "");
          const cleanRoute = routeUsername?.trim().toLowerCase().replace(/^@/, "");
          if (!cleanNext) return;
          if (cleanRoute !== cleanNext) {
            navigate(`/profile/${cleanNext}`, { replace: true });
          }
        }}
      />
      <Dialog open={techOpen} onOpenChange={setTechOpen}>
        <DialogContent className="glass-surface max-w-[520px] border-border/60">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold tracking-tight">
              Technologies
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pick your top 2–3 technologies (highlighted). You can adjust this later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-xl border border-border/40 bg-muted/15 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                Top tech ({topTech.length}/3)
              </p>
              <div className="flex flex-wrap gap-2">
                {techOptions.map((t) => {
                  const active = topTech.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTopTech(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        active
                          ? "bg-ember/12 text-ember border-ember/20"
                          : "bg-background/30 text-muted-foreground border-border/40 hover:bg-muted/25 hover:text-foreground"
                      }`}
                      aria-pressed={active}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {topTech.length >= 3 && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Max 3 selected. Unselect one to choose another.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AuthDialog
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        defaultMode={authGateMode}
      />
    </div>
  );
};

export default Profile;
