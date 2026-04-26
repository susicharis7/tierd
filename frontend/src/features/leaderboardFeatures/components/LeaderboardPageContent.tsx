import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import { TrendingUp, Trophy, ArrowUpRight } from "lucide-react";
import { LeaderboardMotif } from "../../../components/PageBackgroundMotif";
import Footer from "../../../components/Footer";

const tabs = ["All", "Bosnia", "AI", "Web", "Systems", "Game Dev", "Mobile"];

const allDevs = [
  { rank: 1, name: "Sara Kovačević", handle: "@sarakdev", tier: "Aegis", score: 2847, delta: "+12", stack: "AI / Python", streak: "12w", projects: 8 },
  { rank: 2, name: "Amir Hadžić", handle: "@amirh_", tier: "Tier 5", score: 2691, delta: "+8", stack: "Rust / Systems", streak: "9w", projects: 6 },
  { rank: 3, name: "Lena Marić", handle: "@lenam", tier: "Tier 5", score: 2534, delta: "+23", stack: "TypeScript / Web", streak: "7w", projects: 11 },
  { rank: 4, name: "Jay Delić", handle: "@jaydev", tier: "Tier 4", score: 2401, delta: "+5", stack: "React / Full Stack", streak: "7w", projects: 12 },
  { rank: 5, name: "Nina Petrović", handle: "@ninap", tier: "Tier 4", score: 2299, delta: "+15", stack: "Go / Cloud", streak: "5w", projects: 4 },
  { rank: 6, name: "Dino Begović", handle: "@dinob", tier: "Tier 4", score: 2188, delta: "+3", stack: "Next.js / Web", streak: "7w", projects: 9 },
  { rank: 7, name: "Mia Vukojević", handle: "@miav_", tier: "Tier 3", score: 2045, delta: "+18", stack: "Python / Data", streak: "4w", projects: 5 },
  { rank: 8, name: "Emir Kurtović", handle: "@emirk", tier: "Tier 3", score: 1987, delta: "+7", stack: "React Native", streak: "3w", projects: 7 },
  { rank: 9, name: "Tara Šimić", handle: "@taras", tier: "Tier 3", score: 1923, delta: "+11", stack: "Vue / Frontend", streak: "6w", projects: 8 },
  { rank: 10, name: "Alen Mujić", handle: "@alenm", tier: "Tier 3", score: 1856, delta: "+9", stack: "Java / Backend", streak: "2w", projects: 3 },
  { rank: 11, name: "Ema Jurić", handle: "@emaj", tier: "Tier 2", score: 1744, delta: "+14", stack: "Swift / iOS", streak: "4w", projects: 6 },
  { rank: 12, name: "Haris Selimović", handle: "@hariss", tier: "Tier 2", score: 1698, delta: "+6", stack: "C++ / Game Dev", streak: "3w", projects: 2 },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="min-h-screen bg-background relative">
      <LeaderboardMotif />
      <Navbar />
      <div className="pt-24 pb-16 section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-title font-bold text-4xl sm:text-5xl tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Trophy size={28} className="text-ember" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm">A public score for private effort. Updated weekly.</p>
        </motion.div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-ember/15 text-ember" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              style={activeTab === tab ? { border: "1px solid hsl(var(--ember) / 0.2)" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_8rem_6rem_5rem_4rem] gap-x-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
            <span>#</span>
            <span>Developer</span>
            <span className="hidden sm:block">Stack</span>
            <span className="hidden sm:block">Streak</span>
            <span className="hidden sm:block">Tier</span>
            <span className="text-right">Score</span>
          </div>

          {allDevs.map((dev, i) => (
            <motion.div
              key={dev.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_8rem_6rem_5rem_4rem] gap-x-4 px-5 py-4 items-center hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0 ${
                dev.rank <= 3 ? "bg-ember/[0.03]" : ""
              }`}
            >
              <span className={`font-display font-bold text-sm ${dev.rank <= 3 ? "text-ember" : "text-muted-foreground"}`}>
                {dev.rank}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  dev.rank <= 3 ? "bg-ember/20" : "bg-muted/40"
                }`}>
                  {dev.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{dev.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{dev.handle}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">{dev.stack}</span>
              <span className="text-xs text-muted-foreground hidden sm:block">{dev.streak}</span>
              <span className="tier-badge text-[10px] py-0.5 px-2 hidden sm:inline-flex">{dev.tier}</span>
              <div className="text-right">
                <p className="text-sm font-display font-semibold text-foreground">{dev.score.toLocaleString()}</p>
                <p className="text-[10px] text-ember flex items-center justify-end gap-0.5">
                  <TrendingUp size={9} />{dev.delta}
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

export default Leaderboard;

