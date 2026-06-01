import { Link } from "react-router-dom";

import { MonoCaption, TierdLogo } from "./tierd";

const Footer = () => {
  return (
    <footer className="border-t border-dashed border-cream/15 bg-ink">
      <div className="section-container py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="space-y-3 max-w-[260px]">
            <TierdLogo size="md" tone="cream" />
            <p className="font-mono-jb text-[12px] text-muted-ink leading-[1.6]">
              The developer ranking platform. Build in public, rank with proof.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono-jb text-[12px] text-cream/70">
            <Link to="/explore" className="hover:text-cream transition-colors">Explore</Link>
            <Link to="/leaderboard" className="hover:text-cream transition-colors">Leaderboard</Link>
            <Link to="/challenges" className="hover:text-cream transition-colors">Challenges</Link>
            <Link to="/get-verified" className="hover:text-cream transition-colors">Get Verified</Link>
            <Link to="/profile/me" className="hover:text-cream transition-colors">Profile</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-5 border-t border-dashed border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-5 font-mono-jb text-[11px] text-muted-ink">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <MonoCaption tone="muted" className="text-[10px]">
            © 2026 Tierd. all rights reserved.
          </MonoCaption>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
