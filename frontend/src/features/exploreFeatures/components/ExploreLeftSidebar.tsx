import {
  MiniProfileCard,
  CommunitiesPanel,
} from "./ExploreSidebarPanels";

type ExploreLeftSidebarProps = {
  userId: string | null;
  authLoading: boolean;
  currentProfile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export function ExploreLeftSidebar({
  userId,
  authLoading,
  currentProfile,
}: ExploreLeftSidebarProps) {
  return (
    <aside className="hidden lg:block space-y-4 sticky top-24">
      {userId && currentProfile ? (
        <MiniProfileCard profile={currentProfile} userId={userId} />
      ) : !authLoading ? (
        <div className="rounded-2xl border border-border/20 bg-muted/4 p-4 text-center">
          <p className="font-display font-semibold text-sm text-foreground mb-1">Join Tierd.</p>
          <p className="text-xs text-muted-foreground/50 mb-3">Create your builder identity.</p>
          <button className="btn-primary text-xs w-full py-2">Sign up</button>
        </div>
      ) : null}
      <CommunitiesPanel isLoggedIn={!!userId} />
    </aside>
  );
}
