import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import {
  Flame,
  Clock,
  Users,
  Trophy,
  ArrowUpRight,
  Zap,
  Star,
  Shield,
  TrendingUp,
  MapPin,
  Award,
  Target,
  ChevronDown,
} from "lucide-react";
import { ChallengesMotif } from "../../../components/PageBackgroundMotif";
import Footer from "../../../components/Footer";

/* ── mock data ── */

const statPills = [
  { label: "Active challenges", value: "14", icon: Flame },
  { label: "Total participants", value: "2,340+", icon: Users },
  { label: "This week's submissions", value: "187", icon: Zap },
  { label: "Top region", value: "Bosnia", icon: MapPin },
];

const featuredChallenge = {
  title: "Top Builders Bosnia Sprint",
  description:
    "Build and ship a polished developer-facing web product in 5 days. Judged on design, code quality, and real-world utility.",
  tags: ["Web", "Full Stack", "Bosnia", "Intermediate"],
  daysLeft: 2,
  reward: 350,
  participants: 128,
};

type ChallengeStatus = "Live" | "Starts soon" | "Ended" | "New";

interface Challenge {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  daysLeft: number | string;
  reward: number;
  participants: number;
  status: ChallengeStatus;
}

const challenges: Challenge[] = [
  { title: "Build a Developer Portfolio in 48h", description: "Ship a polished personal portfolio site from scratch. Creativity and code quality matter.", category: "Web", difficulty: "Beginner", daysLeft: 3, reward: 200, participants: 94, status: "Live" },
  { title: "Fix the Broken API Sprint", description: "Debug and fix a real-world REST API with 12 failing tests. Speed and accuracy count.", category: "Backend", difficulty: "Intermediate", daysLeft: 1, reward: 280, participants: 67, status: "Live" },
  { title: "UI Clone: Premium Dashboard", description: "Recreate a pixel-perfect dashboard UI from a provided Figma file.", category: "UI", difficulty: "Advanced", daysLeft: 5, reward: 320, participants: 43, status: "Live" },
  { title: "AI Workflow Builder Challenge", description: "Build an AI-powered workflow tool using any LLM API. Judged on UX and utility.", category: "AI", difficulty: "Advanced", daysLeft: 4, reward: 400, participants: 112, status: "Live" },
  { title: "Contribute to Open Source Week", description: "Make meaningful contributions to approved open-source projects over 7 days.", category: "Open Source", difficulty: "All levels", daysLeft: 6, reward: 250, participants: 201, status: "Live" },
  { title: "Indie Game Landing Page Sprint", description: "Design and build a landing page for a fictional indie game. Ship fast, ship bold.", category: "Game Dev", difficulty: "Beginner", daysLeft: "Starts in 2d", reward: 180, participants: 0, status: "Starts soon" },
];

const topChallengers = [
  { name: "Sara Kovačević", handle: "@sarakdev", tier: "Aegis", wins: 7, score: 2847 },
  { name: "Amir Hadžić", handle: "@amirh_", tier: "Tier 5", wins: 5, score: 2691 },
  { name: "Lena Marić", handle: "@lenam", tier: "Tier 5", wins: 4, score: 2534 },
  { name: "Jay Delić", handle: "@jaydev", tier: "Tier 4", wins: 4, score: 2401 },
  { name: "Nina Petrović", handle: "@ninap", tier: "Tier 4", wins: 3, score: 2299 },
];

const pastWinners = [
  { name: "Ajla Karić", handle: "@ajla.dev", location: "Sarajevo", challenge: "API Sprint #4", score: 94, badge: "Gold", summary: "Built a fault-tolerant REST gateway with 100% test coverage in 48h." },
  { name: "Harun Delić", handle: "@harun.build", location: "Tuzla", challenge: "UI Challenge #7", score: 91, badge: "Platinum", summary: "Delivered a pixel-perfect dashboard clone with dark mode and responsive layout." },
  { name: "Emina Hadžić", handle: "@emina_h", location: "Mostar", challenge: "AI Workflow #2", score: 89, badge: "Gold", summary: "Created an AI-driven task planner with GPT-4 integration and drag-and-drop UX." },
  { name: "Dino Begović", handle: "@dinob", location: "Zenica", challenge: "Open Source Week #3", score: 87, badge: "Silver", summary: "Contributed 14 merged PRs across 3 major React ecosystem libraries." },
];

const whyChallenges = [
  { icon: Zap, title: "Earn Tier Points", description: "Every challenge completed adds to your public score and pushes you up the leaderboard." },
  { icon: Award, title: "Unlock Badges", description: "Win challenges to earn exclusive badges displayed on your profile forever." },
  { icon: Star, title: "Get Featured Publicly", description: "Top performers are showcased on the homepage, leaderboard, and social feeds." },
  { icon: TrendingUp, title: "Climb Regional Leaderboards", description: "Dominate your local scene and become the top builder in your region." },
];

const tabs = ["Active", "Upcoming", "Past", "Winners", "My Challenges"];
const categories = ["All", "Web", "AI", "Backend", "UI", "Open Source", "Game Dev"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

/* ── helpers ── */

function statusColor(s: ChallengeStatus) {
  switch (s) {
    case "Live": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "Starts soon": return "bg-amber/15 text-amber border-amber/20";
    case "Ended": return "bg-muted/40 text-muted-foreground border-border";
    case "New": return "bg-ember/15 text-ember border-ember/20";
  }
}

function difficultyColor(d: string) {
  switch (d) {
    case "Beginner": return "text-emerald-400";
    case "Intermediate": return "text-amber";
    case "Advanced": return "text-ember";
    default: return "text-muted-foreground";
  }
}

/* ── page ── */

const Challenges = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = challenges.filter(
    (c) => activeCat === "All" || c.category === activeCat
  );

  return (
    <div className="min-h-screen bg-background relative">
      <ChallengesMotif />
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="pt-28 pb-14 section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-title font-extrabold text-4xl sm:text-5xl tracking-tight text-foreground mb-3">
            Challenges
          </h1>
          <p className="gradient-text font-bold text-lg sm:text-xl mb-3">
            Compete. Ship. Climb.
          </p>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed mb-6">
            Prove your skill through real builds, timed tasks, and ranked submissions.
            Every challenge is a chance to earn tier points, unlock badges, and move up the leaderboard.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <a href="#active" className="btn-primary text-xs">
              Browse active challenges <ArrowUpRight size={14} />
            </a>
            <button className="btn-ghost text-xs">Join Tierd.</button>
          </div>

          {/* stat pills */}
          <div className="flex flex-wrap gap-3">
            {statPills.map((s) => (
              <div
                key={s.label}
                className="glass-surface flex items-center gap-2 px-4 py-2.5 text-xs"
              >
                <s.icon size={14} className="text-ember shrink-0" />
                <span className="font-display font-semibold text-foreground">{s.value}</span>
                <span className="text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Featured Challenge ─── */}
      <section className="pb-14 section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass-surface-hover relative overflow-hidden p-6 sm:p-8"
          style={{ boxShadow: "0 0 60px -15px hsl(var(--ember) / 0.12)" }}
        >
          {/* subtle top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--ember)), hsl(var(--ember-glow)), transparent)" }} />

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="tier-badge text-[10px]">
                  <Trophy size={10} /> Featured
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>

              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-2">
                {featuredChallenge.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-lg">
                {featuredChallenge.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {featuredChallenge.tags.map((t) => (
                  <span key={t} className="text-[10px] font-medium text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-ember" />
                  <span className="font-semibold text-foreground">{featuredChallenge.daysLeft}d</span> left
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={12} className="text-ember" />
                  <span className="font-semibold text-foreground">+{featuredChallenge.reward}</span> Tier Points
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-ember" />
                  <span className="font-semibold text-foreground">{featuredChallenge.participants}</span> participants
                </span>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 lg:flex-col lg:items-end">
              <button className="btn-primary text-xs">Join now <ArrowUpRight size={14} /></button>
              <button className="btn-ghost text-xs">View challenge</button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Tabs + Filters ─── */}
      <section id="active" className="pb-4 section-container">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  activeTab === t
                    ? "bg-ember/15 text-ember"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
                style={activeTab === t ? { border: "1px solid hsl(var(--ember) / 0.2)" } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all whitespace-nowrap border ${
                activeCat === c
                  ? "border-ember/30 bg-ember/10 text-ember"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {c}
            </button>
          ))}

          {/* difficulty dropdown placeholder */}
          <button className="px-3 py-1.5 text-[11px] font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all flex items-center gap-1">
            Difficulty <ChevronDown size={10} />
          </button>
          <button className="px-3 py-1.5 text-[11px] font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all flex items-center gap-1">
            Region <ChevronDown size={10} />
          </button>
        </div>
      </section>

      {/* ─── Grid + Side Panel ─── */}
      <section className="pb-16 section-container">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Challenge cards */}
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            {filtered.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="glass-surface-hover p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <span className={`text-[10px] font-medium ${difficultyColor(c.difficulty)}`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-1.5">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{c.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock size={10} className="text-ember" /> {typeof c.daysLeft === "number" ? `${c.daysLeft}d left` : c.daysLeft}</span>
                    <span className="flex items-center gap-1"><Zap size={10} className="text-ember" /> +{c.reward} pts</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {c.participants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-primary text-[11px] py-2 px-4 rounded-md">
                      {c.status === "Starts soon" ? "Notify me" : "Join"}
                    </button>
                    <button className="btn-ghost text-[11px] py-2 px-4 rounded-md">Details</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Side panel (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            {/* Top Challengers */}
            <div className="glass-surface p-5">
              <h3 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <Trophy size={14} className="text-ember" /> Top Challengers
              </h3>
              <div className="space-y-3">
                {topChallengers.map((u, i) => (
                  <div key={u.handle} className="flex items-center gap-3">
                    <span className={`w-5 text-[11px] font-display font-bold ${i < 3 ? "text-ember" : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-bold shrink-0 ${i < 3 ? "bg-ember/20 text-ember" : "bg-muted/40 text-muted-foreground"}`}>
                      {u.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.wins} wins</p>
                    </div>
                    <span className="tier-badge text-[9px] py-0 px-1.5">{u.tier}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Winners */}
            <div className="glass-surface p-5">
              <h3 className="font-display font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <Award size={14} className="text-ember" /> Recent Winners
              </h3>
              <div className="space-y-3">
                {pastWinners.slice(0, 3).map((w) => (
                  <div key={w.handle} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-ember/15 flex items-center justify-center text-[11px] font-display font-bold text-ember shrink-0">
                      {w.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{w.handle}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{w.challenge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Past Winners ─── */}
      <section className="pb-16 section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-display font-bold text-xl text-foreground mb-1 flex items-center gap-2">
            <Shield size={18} className="text-ember" /> Hall of Proof
          </h2>
          <p className="text-muted-foreground text-sm mb-6">Previous winners and what they shipped.</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pastWinners.map((w, i) => (
              <motion.div
                key={w.handle}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-surface-hover p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center font-display font-bold text-sm text-ember">
                    {w.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={9} /> {w.location}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{w.handle}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="tier-badge text-[10px]">
                    <Trophy size={9} /> {w.badge}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Score {w.score}</span>
                </div>
                <p className="text-xs text-foreground/80 font-medium mb-1">{w.challenge}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{w.summary}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Why Challenges Matter ─── */}
      <section className="pb-16 section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-display font-bold text-xl text-foreground mb-1">
            Why challenges matter
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Challenges are how you turn effort into proof — and proof into rank.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyChallenges.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="glass-surface-hover p-5"
              >
                <div className="w-9 h-9 rounded-md bg-ember/10 flex items-center justify-center mb-3" style={{ border: "1px solid hsl(var(--ember) / 0.15)" }}>
                  <c.icon size={16} className="text-ember" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="pb-20 section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-surface relative overflow-hidden text-center py-14 px-6"
          style={{ boxShadow: "0 0 80px -20px hsl(var(--ember) / 0.1)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--ember)), hsl(var(--ember-glow)), transparent)" }} />
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground mb-3">
            Complete challenges. Earn proof. Move up.
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Your rank is built on what you ship. Start proving it today.
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn-primary text-xs">Join Tierd. <ArrowUpRight size={14} /></button>
            <Link to="/leaderboard" className="btn-ghost text-xs">Explore leaderboard</Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Challenges;
