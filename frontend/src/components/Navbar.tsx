import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, UserCog } from "lucide-react";
import AuthDialog from "./AuthDialog";
import { useAuth } from "../features/authFeatures/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navItems = [
  { label: "Explore", href: "/explore" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Challenges", href: "/challenges" },
  { label: "Get Verified", href: "/get-verified" },
];

type AuthMode = "login" | "signup";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const location = useLocation();
  const navigate = useNavigate();

  const { session, profile, userId, loading, logout } = useAuth();
  const isLoggedIn = !!session || !!profile;

  const profileSlug = profile?.username?.trim() || userId || null;
  const profileHref = profileSlug ? `/profile/${profileSlug}` : "/profile/me";
  const profilesNavActive = location.pathname.startsWith("/profile");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const avatarInitial = (() => {
    const source = profile?.full_name || profile?.username || "U";
    return source.charAt(0).toUpperCase();
  })();

  const displayName = profile?.full_name?.trim() || profile?.username || "Account";

  const navLinkClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      active ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="section-container flex items-center justify-between h-16">
        <Link to="/" className="font-display font-bold text-xl tracking-tight text-foreground">
          Tierd<span className="text-ember">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={navLinkClass(location.pathname === item.href)}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link to={profileHref} className={navLinkClass(profilesNavActive)}>
              Profiles
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className={navLinkClass(profilesNavActive)}
            >
              Profiles
            </button>
          )}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-ember/15 text-ember font-display font-bold text-xs">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-display text-xs text-muted-foreground">
                  {profile?.username ? `@${profile.username}` : "Your account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => navigate(profileHref)}
                >
                  <UserCog size={14} />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <>
              <button
                onClick={() => openAuth("login")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Log in
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="btn-primary text-xs px-5 py-2"
              >
                Sign up
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-nav border-t border-border overflow-hidden"
          >
            <div className="section-container py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/30 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <Link
                  to={profileHref}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    profilesNavActive
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  Profiles
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    profilesNavActive
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  Profiles
                </button>
              )}
              <div className="border-t border-border mt-2 pt-4 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={profileHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-6 w-6">
                        {profile?.avatar_url && (
                          <AvatarImage src={profile.avatar_url} alt={displayName} />
                        )}
                        <AvatarFallback className="bg-ember/15 text-ember font-display font-bold text-[10px]">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      {displayName}
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className="text-sm font-medium text-destructive hover:text-destructive/80 px-4 py-2 text-left"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth("login")}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 text-left"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => openAuth("signup")}
                      className="btn-primary text-xs"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
      />
    </nav>
  );
};

export default Navbar;


