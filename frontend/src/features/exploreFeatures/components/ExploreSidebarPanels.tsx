import { Link } from "react-router-dom";
import { Activity, Code2, Heart, Lock, MessageSquare, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { toast } from "../../../components/ui/sonner";
import { myCommunities, recentActivity } from "../constants/exploreUIData";


export function MiniProfileCard({ profile, userId }: { profile: { full_name: string | null; username: string | null; avatar_url: string | null } | null; userId: string | null }) {
  const ini = (profile?.full_name || profile?.username || "U").charAt(0).toUpperCase();
  const name = profile?.full_name?.trim() || "Your Name";
  const handle = profile?.username?.trim() ? `@${profile.username}` : "@handle";

  return (
    <div className="rounded-2xl border border-border/20 bg-muted/4 overflow-hidden">
      {/* Mini banner */}
      <div
        className="h-16 relative"
        style={{
          background: "radial-gradient(500px 120px at 50% 80%, hsl(var(--ember) / 0.2), transparent 60%), linear-gradient(180deg, hsl(var(--glass) / 0.8) 0%, hsl(var(--background) / 0.4) 100%)",
        }}
      />
      <div className="px-4 pb-4 -mt-7">
        <Link to={userId ? `/profile/${profile?.username ?? userId}` : "/profile/me"}>
          <Avatar className="h-14 w-14 ring-[3px] ring-[hsl(var(--background))] shadow-lg mb-2">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
            <AvatarFallback
              className="font-display text-lg font-bold text-ember"
              style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.2), hsl(var(--ember-glow) / 0.1))" }}
            >
              {ini}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Link to={userId ? `/profile/${profile?.username ?? userId}` : "/profile/me"} className="block group">
          <p className="font-display font-bold text-sm text-foreground truncate group-hover:text-ember transition-colors">{name}</p>
          <p className="text-xs text-muted-foreground/50 truncate">{handle}</p>
        </Link>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/15">
          <div>
            <p className="font-display font-bold text-sm text-foreground">128</p>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Following</p>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground">847</p>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Followers</p>
          </div>
        </div>
        <Link
          to="/profile/me"
          className="mt-3 block w-full text-center rounded-lg border border-border/30 bg-muted/10 py-2 text-xs font-medium text-foreground/70 transition-all hover:bg-muted/20 hover:text-foreground hover:border-border/50"
        >
          My Profile
        </Link>
      </div>
    </div>
  );
};

export function CommunitiesPanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-border/20 bg-muted/4 p-4 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/15">
          <Lock size={16} className="text-muted-foreground/40" />
        </div>
        <p className="font-display text-xs font-bold text-foreground/70 mb-1">Communities</p>
        <p className="text-xs text-muted-foreground/45 mb-3 leading-relaxed">
          Log in to discover developer communities.
        </p>
        <button
          type="button"
          className="w-full rounded-lg border border-ember/15 bg-ember/5 py-2 text-xs font-medium text-ember/80 transition-all hover:bg-ember/10"
          onClick={() => toast("Use the Log in button in the top-right.")}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/55">
        <Code2 size={12} className="text-ember" /> Communities
      </h3>
      <div className="space-y-2">
        {myCommunities.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-muted/10 group cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember/8 shrink-0">
              <Users size={13} className="text-ember/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground/80 truncate group-hover:text-foreground transition-colors">
                {c.name}
              </p>
              <p className="text-xs text-muted-foreground/45">
                {c.members.toLocaleString()} members
                {c.active && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-400/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" /> active
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 w-full rounded-lg border border-border/20 bg-muted/8 py-2 text-xs font-medium text-muted-foreground/50 transition-all hover:bg-muted/15 hover:text-foreground/70">
        Discover communities
      </button>
    </div>
  );
}

export function ActivityPanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-border/20 bg-muted/4 p-4 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/15">
          <Activity size={16} className="text-muted-foreground/40" />
        </div>
        <p className="font-display text-xs font-bold text-foreground/70 mb-1">Activity</p>
        <p className="text-xs text-muted-foreground/45 leading-relaxed">
          Sign in to see what builders are up to.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/20 bg-muted/4 p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/55">
        <Activity size={12} className="text-ember" /> Recent Activity
      </h3>
      <div className="space-y-1">
        {recentActivity.map((a, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl p-2.5 transition-all hover:bg-muted/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/15 shrink-0 mt-0.5">
              {a.type === "follow" ? (
                <UserPlus size={12} className="text-ember/60" />
              ) : a.type === "like" ? (
                <Heart size={12} className="text-ember/60" />
              ) : (
                <MessageSquare size={12} className="text-ember/60" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground/75 leading-relaxed">
                <span className="font-semibold text-foreground">{a.user}</span>{" "}
                {a.action}
              </p>
              <p className="text-xs text-ember/50 font-medium">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}