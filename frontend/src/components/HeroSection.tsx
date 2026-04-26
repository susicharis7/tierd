import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroBackground from "./HeroBackground";
import { ArrowRight, TrendingUp, Trophy, Zap } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Alex Rivera", handle: "@arivera", score: 12450, tier: "DIAMOND", delta: "+120" },
  { rank: 2, name: "Sarah Jenkins", handle: "@sjenkins", score: 11890, tier: "PLATINUM", delta: "+85" },
  { rank: 3, name: "Sara K.", handle: "@sarakdev", score: 11200, tier: "PLATINUM", delta: "+63" },
  { rank: 4, name: "Amir H.", handle: "@amirh_", score: 10800, tier: "GOLD", delta: "+45" },
  { rank: 5, name: "Jay D.", handle: "@jaydev", score: 9540, tier: "GOLD", delta: "+32" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <HeroBackground />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(var(--glass-border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--glass-border)) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="section-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="tier-badge mb-6 w-fit">
              <Zap size={12} />
              THE RANKED NETWORK
            </div>

            <h1 className="font-title font-bold text-6xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.92] tracking-tight mb-6">
              <span className="text-foreground">Tierd</span>
              <span className="text-ember">.</span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground/70 font-medium mb-3">
              Show your work. Earn your tier.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Build reputation with undeniable proof on an elite developer network.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/profile/jay" className="btn-primary">
                Claim Your Profile
                <Zap size={14} />
              </Link>
              <Link to="/leaderboard" className="btn-ghost">
                Explore Leaderboard
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="mt-10 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>2,400+ developers ranked this month</span>
            </div>
          </motion.div>

          {/* Right: Leaderboard Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="glass-surface p-5 rounded-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Trophy size={14} className="text-ember" />
                  Top Builders in Bosnia
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] text-ember font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
                  Live
                </span>
              </div>
              <div className="space-y-1">
                {leaderboardData.map((dev) => (
                  <div key={dev.rank} className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-bold text-sm w-5 ${dev.rank <= 3 ? "text-ember" : "text-muted-foreground"}`}>
                        {dev.rank}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        dev.rank <= 2 ? "bg-gradient-to-br from-ember/40 to-ember-glow/40" : "bg-muted/50"
                      }`}>
                        {dev.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{dev.name}</p>
                        <p className="text-xs text-muted-foreground">{dev.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ember">{dev.tier}</span>
                      <span className="text-sm font-display font-bold text-foreground">{dev.score.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating rank badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 glass-surface p-3 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--ember)), hsl(var(--ember-glow)))" }}>
                  <Trophy size={14} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Rank up!</p>
                  <p className="text-xs font-display font-bold gradient-text">Gold → Platinum</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
