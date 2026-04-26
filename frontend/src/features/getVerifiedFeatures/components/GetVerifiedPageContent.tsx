import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Github, FolderGit2, ShieldCheck, Activity, BarChart3, Award,
  Globe, Linkedin, Trophy, CheckCircle2, ArrowRight, Sparkles,
  Code2, Flame, Target, Star, TrendingUp, Zap
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { VerificationMotif } from "../../../components/PageBackgroundMotif";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const processSteps = [
  { icon: Github, label: "Connect GitHub", color: "from-[hsl(var(--ember))]" },
  { icon: FolderGit2, label: "Add Projects", color: "from-[hsl(var(--ember-glow))]" },
  { icon: ShieldCheck, label: "Verify Proof", color: "from-[hsl(var(--ember))]" },
  { icon: Activity, label: "Analyze Activity", color: "from-[hsl(var(--amber))]" },
  { icon: BarChart3, label: "Score Signals", color: "from-[hsl(var(--ember-glow))]" },
  { icon: Award, label: "Claim Your Tier", color: "from-[hsl(var(--ember))]" },
];

const detailedSteps = [
  {
    step: 1, title: "Connect GitHub", icon: Github,
    items: ["Sync repositories", "Detect activity patterns", "Verify ownership"],
  },
  {
    step: 2, title: "Add Featured Projects", icon: FolderGit2,
    items: ["Choose your best repos", "Add live demos & URLs", "Tag stack & description"],
  },
  {
    step: 3, title: "Add More Proof", icon: Globe,
    items: ["Portfolio & personal site", "LinkedIn & social links", "Hackathons, certs, OSS contributions"],
  },
  {
    step: 4, title: "Analyze Developer Signals", icon: Activity,
    items: ["Consistency & shipping cadence", "Project quality & depth", "Challenge participation & completeness"],
  },
  {
    step: 5, title: "Generate Tier Preview", icon: Sparkles,
    items: ["Estimated starting rank", "Strength analysis", "Improvement recommendations"],
  },
];

const signalCards = [
  { icon: Code2, title: "Project Quality", desc: "Depth, polish, and technical complexity of your shipped work." },
  { icon: Activity, title: "Activity Consistency", desc: "Regular commits, shipping cadence, and sustained contribution." },
  { icon: ShieldCheck, title: "Verified Ownership", desc: "Confirmed repos, domains, and linked proof of identity." },
  { icon: Globe, title: "Public Proof of Work", desc: "Live projects, demos, open-source contributions visible to all." },
  { icon: Trophy, title: "Challenge Performance", desc: "Scores, placements, and badges earned through Tierd. challenges." },
  { icon: Target, title: "Profile Completeness", desc: "Bio, links, featured projects, and all connected signals." },
];

const mockEval = {
  github: { connected: true, repos: 47 },
  projects: { detected: 4, withDemos: 2 },
  activity: 78,
  credibility: 85,
  portfolio: 72,
  completion: 68,
  estimatedTier: "Gold",
};

const tierResult = {
  tier: "Gold",
  score: 2480,
  strengths: ["Strong shipping consistency", "Verified GitHub with 47 repos", "Active challenge participant"],
  nextSteps: ["Complete 1 more challenge", "Add 2 live demos", "Link LinkedIn profile"],
  nextTier: "Platinum",
  pointsNeeded: 520,
};

const GetVerified = () => (
  <div className="min-h-screen bg-background relative">
    <VerificationMotif />
    <Navbar />

    {/* ── Hero ────────────────────────────────────────────── */}
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="section-container text-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="inline-flex items-center gap-2 tier-badge mb-6">
          <ShieldCheck size={14} /> Developer Evaluation
        </motion.div>

        <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
          className="font-title text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
          Get <span className="gradient-text">Verified</span>
        </motion.h1>

        <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
          className="text-lg sm:text-xl text-muted-foreground mb-3">
          Prove your skill. Claim your tier.
        </motion.p>

        <motion.p variants={fadeUp} custom={3} initial="hidden" animate="visible"
          className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
          Tierd<span className="text-ember">.</span> evaluates projects, activity, proof of work, and developer signals
          to build your profile and place you on the ladder.
        </motion.p>

        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
          className="flex flex-wrap justify-center gap-3">
          <button className="btn-primary">
            <Zap size={16} /> Start evaluation
          </button>
          <a href="#how-it-works" className="btn-ghost">See how it works</a>
        </motion.div>
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, hsl(var(--ember)), transparent 70%)" }} />
    </section>

    {/* ── Process Rail ────────────────────────────────────── */}
    <section id="how-it-works" className="py-20">
      <div className="section-container">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center mb-14">
          How evaluation <span className="gradient-text">works</span>
        </motion.h2>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--ember) / 0.3), transparent)" }} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {processSteps.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col items-center text-center relative z-10">
                <div className="w-14 h-14 rounded-xl glass-surface flex items-center justify-center mb-3 relative">
                  <s.icon size={22} className="text-ember" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border text-[10px] font-display font-bold flex items-center justify-center text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
                <span className="text-xs font-display font-semibold text-foreground">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Detailed Steps ──────────────────────────────────── */}
    <section className="py-20">
      <div className="section-container">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
          The evaluation <span className="gradient-text">process</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-sm text-muted-foreground text-center mb-14 max-w-md mx-auto">
          Each step contributes to your overall score and tier placement.
        </motion.p>

        <div className="space-y-4">
          {detailedSteps.map((s, i) => (
            <motion.div key={s.step} variants={fadeUp} custom={i} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              className="glass-surface-hover p-6 flex flex-col sm:flex-row gap-5">
              <div className="flex items-start gap-4 sm:w-64 shrink-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.15), hsl(var(--ember-glow) / 0.15))" }}>
                  <s.icon size={18} className="text-ember" />
                </div>
                <div>
                  <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider">Step {s.step}</span>
                  <h3 className="font-display font-semibold text-foreground text-sm">{s.title}</h3>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 size={12} className="text-ember shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── What Affects Your Evaluation ─────────────────── */}
    <section className="py-20">
      <div className="section-container">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
          What affects your <span className="gradient-text">evaluation</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-sm text-muted-foreground text-center mb-14 max-w-lg mx-auto">
          Tierd<span className="text-ember">.</span> uses multiple signals — no single metric defines your rank.
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {signalCards.map((c, i) => (
            <motion.div key={c.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              className="glass-surface-hover p-5 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.12), hsl(var(--ember-glow) / 0.12))" }}>
                <c.icon size={16} className="text-ember" />
              </div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Mock Evaluation Panel ────────────────────────── */}
    <section className="py-20">
      <div className="section-container">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
          Evaluation <span className="gradient-text">in progress</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-sm text-muted-foreground text-center mb-14 max-w-md mx-auto">
          Here's what a real evaluation session looks like.
        </motion.p>

        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="glass-surface p-6 sm:p-8 max-w-3xl mx-auto">
          {/* Top row: connection status */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 text-xs font-display font-semibold px-3 py-1.5 rounded-full"
              style={{ background: "hsl(var(--ember) / 0.1)", color: "hsl(var(--ember))" }}>
              <Github size={13} /> GitHub connected
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-border">
              <FolderGit2 size={13} /> {mockEval.projects.detected} projects detected
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-full border border-border">
              <Globe size={13} /> {mockEval.projects.withDemos} live demos
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-5 mb-8">
            {[
              { label: "Activity Score", value: mockEval.activity },
              { label: "Credibility Score", value: mockEval.credibility },
              { label: "Portfolio Strength", value: mockEval.portfolio },
              { label: "Profile Completion", value: mockEval.completion },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-display font-medium text-foreground">{m.label}</span>
                  <span className="text-muted-foreground">{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(var(--ember)), hsl(var(--amber)))" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Estimated tier */}
          <div className="flex items-center justify-between p-4 rounded-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--ember) / 0.08), hsl(var(--ember-glow) / 0.08))", border: "1px solid hsl(var(--ember) / 0.15)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(var(--ember)), hsl(var(--amber)))" }}>
                <Flame size={18} className="text-primary-foreground" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-display font-bold tracking-wider">Estimated Tier</span>
                <p className="font-display font-bold text-foreground">{mockEval.estimatedTier}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{mockEval.github.repos} repos analyzed</span>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Tier Result Preview ──────────────────────────── */}
    <section className="py-20">
      <div className="section-container">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
          Your tier <span className="gradient-text">result</span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-sm text-muted-foreground text-center mb-14 max-w-md mx-auto">
          After evaluation, you'll receive a full profile breakdown and rank placement.
        </motion.p>

        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="glass-surface p-6 sm:p-8 max-w-2xl mx-auto">
          {/* Tier badge */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--ember)), hsl(var(--amber)))" }}>
              <Award size={28} className="text-primary-foreground" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-display font-bold text-muted-foreground tracking-wider">Your Tier</span>
              <p className="font-display text-2xl font-bold text-foreground">{tierResult.tier}</p>
              <p className="text-xs text-muted-foreground">{tierResult.score} Tier Points</p>
            </div>
          </div>

          {/* Strengths */}
          <div className="mb-6">
            <h4 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">Strengths Found</h4>
            <div className="flex flex-wrap gap-2">
              {tierResult.strengths.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-foreground">
                  <Star size={10} className="text-ember" /> {s}
                </span>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="mb-6">
            <h4 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommended Next Steps</h4>
            <ul className="space-y-2">
              {tierResult.nextSteps.map((s) => (
                <li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowRight size={12} className="text-ember shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Progress to next tier */}
          <div className="p-4 rounded-lg" style={{ background: "hsl(var(--muted) / 0.3)" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-display font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp size={12} className="text-ember" /> Progress to {tierResult.nextTier}
              </span>
              <span className="text-[10px] text-muted-foreground">{tierResult.pointsNeeded} pts needed</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--ember)), hsl(var(--amber)))" }}
                initial={{ width: 0 }}
                whileInView={{ width: "83%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Final CTA ────────────────────────────────────── */}
    <section className="py-24">
      <div className="section-container text-center">
        <motion.h2 variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="font-display text-3xl sm:text-4xl font-bold mb-4">
          Your profile is your <span className="gradient-text">proof</span>.
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your work, get evaluated, and claim your rank on the ladder.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3">
          <button className="btn-primary"><Zap size={16} /> Start evaluation</button>
          <Link to="/leaderboard" className="btn-ghost">Explore leaderboard</Link>
        </motion.div>
      </div>
    </section>
    <Footer />
  </div>
);

export default GetVerified;
