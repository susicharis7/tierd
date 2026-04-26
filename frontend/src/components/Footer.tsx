import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-muted/3">
      <div className="section-container py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="space-y-2">
            <span className="font-display font-bold text-base text-foreground">
              Tierd<span className="text-ember">.</span>
            </span>
            <p className="text-xs text-muted-foreground/50 max-w-[220px] leading-relaxed">
              The developer ranking platform. Build in public, rank with proof.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground/55">
            <Link to="/explore" className="transition-colors hover:text-foreground">Explore</Link>
            <Link to="/leaderboard" className="transition-colors hover:text-foreground">Leaderboard</Link>
            <Link to="/challenges" className="transition-colors hover:text-foreground">Challenges</Link>
            <Link to="/get-verified" className="transition-colors hover:text-foreground">Get Verified</Link>
            <Link to="/profile/me" className="transition-colors hover:text-foreground">Profile</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-5 border-t border-border/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5 text-[11px] text-muted-foreground/35">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <span className="text-[11px] text-muted-foreground/30">© 2026 Tierd. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
