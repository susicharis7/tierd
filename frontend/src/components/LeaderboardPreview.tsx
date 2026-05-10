import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useLandingTopBuildersQuery } from "../features/rankingFeatures/useRankingData";

const tabs = ["Global", "AI", "Web", "Game Dev"];

const LeaderboardPreview = () => {
  const [activeTab, setActiveTab] = useState("Global");
  const leaderboardQuery = useLandingTopBuildersQuery(8);
  const leaderboard = leaderboardQuery.data ?? [];

  return (
    <section className="relative py-24 border-t border-border">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4"
        >
          <div>
            <h2 className="font-title font-bold text-2xl sm:text-3xl text-foreground mb-2">
              Climb the leaderboard<span className="text-ember">.</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              A public score for private effort.
            </p>
          </div>
          <Link to="/leaderboard" className="btn-ghost text-xs gap-1.5 w-fit">
            View full leaderboard <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-ember/15 text-ember"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              style={
                activeTab === tab
                  ? { border: "1px solid hsl(var(--ember) / 0.2)" }
                  : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-surface overflow-hidden"
        >
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
            <span>#</span>
            <span>Developer</span>
            <span className="hidden sm:block">Scope</span>
            <span>Tier</span>
            <span className="text-right">Score</span>
          </div>

          {leaderboardQuery.isPending && (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              Loading leaderboard...
            </div>
          )}

          {leaderboard.map((dev) => (
            <div
              key={`${dev.profileId}-${dev.rank}`}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-3 items-center hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0"
            >
              <span
                className={`font-display font-bold text-sm w-5 ${
                  dev.rank <= 3 ? "text-ember" : "text-muted-foreground"
                }`}
              >
                {dev.rank}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 ${
                    dev.rank <= 3 ? "bg-ember/20" : "bg-muted/40"
                  }`}
                >
                  {(dev.fullName || dev.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {dev.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{dev.username}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {activeTab}
              </span>
              <span className="tier-badge text-[10px] py-0.5 px-2">
                {dev.tier}
              </span>
              <div className="text-right">
                <p className="text-sm font-display font-semibold text-foreground">
                  {dev.score.toLocaleString()}
                </p>
                <p className="text-[10px] text-ember flex items-center justify-end gap-0.5">
                  <TrendingUp size={9} />
                  {dev.delta >= 0 ? "+" : ""}
                  {dev.delta}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;

