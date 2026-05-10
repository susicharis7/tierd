import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Zap } from "lucide-react";
import HeroBackground from "./HeroBackground";
import { useLandingTopBuildersQuery } from "../features/rankingFeatures/useRankingData";

const HeroSection = () => {
  const topBuildersQuery = useLandingTopBuildersQuery(5);
  const leaderboardData = topBuildersQuery.data ?? [];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <HeroBackground />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--glass-border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--glass-border)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="section-container relative z-10 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
              Build reputation with undeniable proof on a global developer network.
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

            <div className="mt-10 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>Developers are being ranked continuously</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative hidden lg:block"
          >
            <div className="glass-surface p-5 rounded-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2 uppercase tracking-wider">
                  <Trophy size={14} className="text-ember" />
                  Top Builders Global
                </h3>
                <span className="flex items-center gap-1.5 text-[10px] text-ember font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
                  Live
                </span>
              </div>

              {topBuildersQuery.isPending && (
                <div className="py-4 text-sm text-muted-foreground">
                  Loading top builders...
                </div>
              )}

              <div className="space-y-1">
                {leaderboardData.map((dev) => (
                  <div
                    key={`${dev.profileId}-${dev.rank}`}
                    className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-display font-bold text-sm w-5 ${
                          dev.rank <= 3 ? "text-ember" : "text-muted-foreground"
                        }`}
                      >
                        {dev.rank}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          dev.rank <= 2
                            ? "bg-gradient-to-br from-ember/40 to-ember-glow/40"
                            : "bg-muted/50"
                        }`}
                      >
                        {(dev.fullName || dev.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {dev.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{dev.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-ember">
                        {dev.tier}
                      </span>
                      <span className="text-sm font-display font-bold text-foreground">
                        {dev.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

