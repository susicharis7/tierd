import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, UserCog } from "lucide-react";

import AuthDialog from "./AuthDialog";
import { useAuth } from "../features/authFeatures/AuthProvider";
import { Doodle, TierdLogo, UserAvatar } from "./tierd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Explore", href: "/explore" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Challenges", href: "/challenges" },
  { label: "Get Verified", href: "/get-verified" },
] as const;

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
  const profilesActive = location.pathname.startsWith("/profile");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const displayName =
    profile?.full_name?.trim() || profile?.username || "Account";
  const handleLabel = profile?.username ? `@${profile.username}` : null;

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink/85 backdrop-blur-xl border-b border-dashed border-cream/[0.12]">
      <div className="section-container flex items-center justify-between gap-4 py-4 sm:py-[18px]">
        {/* Logo — wordmark on >=sm, compact "t." mark on phones */}
        <div className="shrink-0 flex items-center">
          <div className="hidden sm:flex">
            <TierdLogo size="md" tone="cream" beta />
          </div>
          <div className="flex sm:hidden">
            <TierdLogo variant="mark" size="md" bg="ink-2" />
          </div>
        </div>

        {/* Centered pill nav (desktop) */}
        <div className="hidden md:flex items-center gap-1 rounded-full bg-cream/[0.04] border border-cream/[0.08] p-[5px]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono-jb text-[13px] font-medium transition-colors",
                  active
                    ? "bg-cream text-ink"
                    : "text-cream/70 hover:text-cream",
                )}
              >
                {active && (
                  <span className="w-[5px] h-[5px] rounded-full bg-orange" />
                )}
                {item.label}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <Link
              to={profileHref}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono-jb text-[13px] font-medium transition-colors",
                profilesActive
                  ? "bg-cream text-ink"
                  : "text-cream/70 hover:text-cream",
              )}
            >
              {profilesActive && (
                <span className="w-[5px] h-[5px] rounded-full bg-orange" />
              )}
              Profiles
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono-jb text-[13px] font-medium transition-colors",
                profilesActive
                  ? "bg-cream text-ink"
                  : "text-cream/70 hover:text-cream",
              )}
            >
              Profiles
            </button>
          )}
        </div>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-2.5 py-[7px] font-mono-jb text-[12px] text-cream hover:border-cream/30 transition-colors"
          >
            <Doodle.Search size={13} className="text-cream" />
            <span className="opacity-50">⌘K</span>
          </button>

          {!loading && isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full px-1 py-1 hover:bg-cream/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange">
                  <UserAvatar
                    name={displayName}
                    src={profile?.avatar_url}
                    size={36}
                  />
                  <div className="leading-tight text-left max-w-[160px]">
                    <div className="font-grot font-bold text-[14px] text-cream truncate">
                      {displayName}
                    </div>
                    {handleLabel && (
                      <div className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink mt-px truncate">
                        {handleLabel}
                      </div>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-ink">
                  {handleLabel ?? "Your account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 font-grot text-[13px]"
                  onClick={() => navigate(profileHref)}
                >
                  <UserCog size={14} />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 font-grot text-[13px] text-destructive focus:text-destructive"
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
                type="button"
                onClick={() => openAuth("login")}
                className="font-mono-jb text-[12px] font-bold text-cream/70 hover:text-cream transition-colors px-3 py-2"
              >
                log in
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange text-cream font-mono-jb text-[12px] font-bold px-4 py-2 shadow-cta-orange hover:translate-y-px transition-transform"
              >
                sign up
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-cream p-2"
          aria-label="Toggle menu"
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
            className="md:hidden bg-ink border-t border-dashed border-cream/[0.12] overflow-hidden"
          >
            <div className="section-container py-5 flex flex-col gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-3 font-mono-jb text-[13px] font-medium transition-colors",
                      active
                        ? "bg-cream text-ink"
                        : "text-cream/70 hover:text-cream",
                    )}
                  >
                    {active && (
                      <span className="w-[5px] h-[5px] rounded-full bg-orange" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
              {isLoggedIn ? (
                <Link
                  to={profileHref}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-3 font-mono-jb text-[13px] font-medium transition-colors",
                    profilesActive
                      ? "bg-cream text-ink"
                      : "text-cream/70 hover:text-cream",
                  )}
                >
                  {profilesActive && (
                    <span className="w-[5px] h-[5px] rounded-full bg-orange" />
                  )}
                  Profiles
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className={cn(
                    "text-left inline-flex items-center gap-2 rounded-full px-4 py-3 font-mono-jb text-[13px] font-medium transition-colors",
                    profilesActive
                      ? "bg-cream text-ink"
                      : "text-cream/70 hover:text-cream",
                  )}
                >
                  Profiles
                </button>
              )}

              <div className="border-t border-dashed border-cream/[0.12] mt-3 pt-4 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={profileHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-2 py-2"
                    >
                      <UserAvatar
                        name={displayName}
                        src={profile?.avatar_url}
                        size={32}
                      />
                      <div className="leading-tight">
                        <div className="font-grot font-bold text-[14px] text-cream">
                          {displayName}
                        </div>
                        {handleLabel && (
                          <div className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink mt-px">
                            {handleLabel}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="font-mono-jb text-[12px] font-bold text-destructive hover:text-destructive/80 px-4 py-2 text-left"
                    >
                      log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuth("login")}
                      className="font-mono-jb text-[12px] font-bold text-cream/70 hover:text-cream px-4 py-2 text-left"
                    >
                      log in
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth("signup")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-4 py-3 shadow-cta-orange"
                    >
                      sign up
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
