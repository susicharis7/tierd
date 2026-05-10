import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, ArrowUpRight } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { LeaderboardMotif } from "../../../components/PageBackgroundMotif";
import { useGlobalLeaderboardQuery } from "../../rankingFeatures/useRankingData";

const tabs = ["Global", "AI", "Web", "Systems", "Game Dev", "Mobile"];

const LeaderboardPageContent = () => {
  const [activeTab, setActiveTab] = useState("Global");
  const leaderboardQuery = useGlobalLeaderboardQuery(50);
  const developers = leaderboardQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background relative">
      <LeaderboardMotif />
      <Navbar />
      <div className="pt-24 pb-16 section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-title font-bold text-4xl sm:text-5xl tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Trophy size={28} className="text-ember" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm">
            A global score for private effort. Updated in near real-time.
          </p>
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
          animate={{ opacity: 1 }}
          className="glass-surface overflow-hidden"
        >
          <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_8rem_6rem_5rem_4rem] gap-x-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
            <span>#</span>
            <span>Developer</span>
            <span className="hidden sm:block">Scope</span>
            <span className="hidden sm:block">Streak</span>
            <span className="hidden sm:block">Tier</span>
            <span className="text-right">Score</span>
          </div>

          {leaderboardQuery.isPending && (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              Loading leaderboard...
            </div>
          )}

          {!leaderboardQuery.isPending && developers.length === 0 && (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              No leaderboard data yet.
            </div>
          )}

          {developers.map((dev, i) => (
            <motion.div
              key={`${dev.profileId}-${dev.rank}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_8rem_6rem_5rem_4rem] gap-x-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0 ${
                dev.rank <= 3 ? "bg-ember/[0.03]" : ""
              }`}
            >
              <span
                className={`font-display font-bold text-sm ${
                  dev.rank <= 3 ? "text-ember" : "text-muted-foreground"
                }`}
              >
                {dev.rank}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                    dev.rank <= 3 ? "bg-ember/20" : "bg-muted/40"
                  }`}
                >
                  {(dev.fullName || dev.username || "U").charAt(0).toUpperCase()}
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
              <span className="text-xs text-muted-foreground hidden sm:block">
                {dev.streakWeeks}w
              </span>
              <span className="tier-badge text-[10px] py-0.5 px-2 hidden sm:inline-flex">
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
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <button className="btn-primary text-xs">
            Claim your spot <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeaderboardPageContent;

