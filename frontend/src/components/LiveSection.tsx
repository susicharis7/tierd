import { motion } from "framer-motion";
import { TrendingUp, Zap, MessageSquare, Star, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const posts = [
  {
    author: "Marko", handle: "Backend Engineer", avatar: "M", time: "2h ago",
    content: "Rewrote the main matching service in Rust. Latency dropped from 250ms to 12ms. Deployed to production.",
    reactions: 89, comments: 24, xp: "+350", tags: ["Rust", "Performance"], tier: "A-TIER",
  },
  {
    author: "Elena", handle: "Frontend Architect", avatar: "E", time: "5h ago",
    content: "Published a new open-source React component library. 2k stars in the first 24h.",
    reactions: 124, comments: 37, xp: "+500", tags: ["React", "Open Source"], tier: "S-TIER",
  },
  {
    author: "Tariq", handle: "AI Researcher", avatar: "T", time: "1d ago",
    content: "Fine-tuned a custom LLM for internal docs. Achieved 94% accuracy on domain-specific queries.",
    reactions: 56, comments: 11, xp: "+420", tags: ["AI", "ML"], tier: "S-TIER",
  },
];

const topDevs = [
  { name: "Dev_Mirza", score: "14.2k", delta: "+120" },
  { name: "Amir_XYZ", score: "12.8k", delta: "+45" },
  { name: "Dino_Tech", score: "11.5k", delta: "+210" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const LiveSection = () => {
  return (
    <section className="relative py-24 border-t border-border">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">
              The Feed<span className="text-ember">.</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg">
              Real-time accomplishments, regional leaderboards, and trending builders.
            </p>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-1.5 text-xs font-display font-semibold text-ember uppercase tracking-wider hover:text-ember-glow transition-colors">
            View Full Feed
            <TrendingUp size={12} />
          </Link>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Feed column */}
          <div className="lg:col-span-2 space-y-4">
            {posts.map((post, i) => (
              <motion.div key={i} variants={item} className="glass-surface-hover p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center font-display font-bold text-sm">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-sm text-foreground">{post.author}</p>
                        <span className="tier-badge text-[9px] py-0 px-1.5">{post.tier}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{post.handle} · {post.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ border: "1px solid hsl(var(--ember) / 0.2)" }}>
                    <Trophy size={12} className="text-ember" />
                    <span className="text-xs font-display font-bold text-ember">{post.xp}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed mb-3">{post.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Top in Bosnia */}
            <motion.div variants={item} className="glass-surface p-5">
              <h3 className="font-display font-bold text-xs text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <TrendingUp size={14} className="text-ember" />
                Top in Bosnia
              </h3>
              <div className="space-y-3">
                {topDevs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-sm text-muted-foreground w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-xs font-bold">{d.name[0]}</div>
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display font-bold text-foreground">{d.score}</p>
                      <p className="text-[10px] text-ember font-medium">{d.delta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Challenge */}
            <motion.div variants={item} className="glass-surface p-5">
              <h3 className="font-display font-bold text-xs text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Clock size={14} className="text-muted-foreground" />
                Active Challenge
              </h3>
              <div className="p-4 rounded-md bg-muted/20 mb-4">
                <h4 className="font-display font-bold text-sm text-foreground mb-1">Build a Redis Clone</h4>
                <p className="text-xs text-muted-foreground mb-3">Implement a basic in-memory key-value store in C or Rust.</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ember font-semibold">Reward: 1000 pts</span>
                  <span className="text-muted-foreground">Ends in 2d 14h</span>
                </div>
              </div>
              <button className="btn-ghost text-xs w-full py-2.5">Join Challenge</button>
            </motion.div>

            {/* Sign up nudge */}
            <motion.div variants={item} className="glass-surface p-5" style={{ borderColor: "hsl(var(--ember) / 0.15)" }}>
              <p className="font-display font-semibold text-sm text-foreground mb-2">
                Join the network
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Claim your profile and start building your tier.
              </p>
              <button className="btn-primary text-xs w-full py-2.5">
                Claim your Tierd.
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveSection;
