import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ExternalLink, BadgeCheck, Flame, Star, Globe, Code, Trophy } from "lucide-react";

const ProfilePreview = () => {
  return (
    <section className="relative py-24 border-t border-border">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="tier-badge mb-4 w-fit">
              <Star size={12} />
              PRESTIGE PORTFOLIO
            </div>
            <h2 className="font-title font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
              Your new central hub<span className="text-ember">.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Stop sending links to five different platforms. Tierd aggregates your GitHub, LeetCode, deployed projects, and hackathon wins into one undeniable source of truth.
            </p>

            <div className="space-y-5">
              {[
                { icon: ExternalLink, title: "Verified Links", desc: "Connect GitHub, Twitter, and personal site." },
                { icon: Star, title: "Featured Shipments", desc: "Highlight your best projects with live metrics." },
                { icon: Flame, title: "Badges & Tiers", desc: "Earn public recognition for specific tech stacks." },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{
                    background: "linear-gradient(135deg, hsl(var(--ember) / 0.12), hsl(var(--ember-glow) / 0.08))",
                    border: "1px solid hsl(var(--ember) / 0.1)"
                  }}>
                    <f.icon size={18} className="text-ember" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground mb-0.5">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-surface-hover p-6 sm:p-8 relative"
          >
            {/* Remote badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
              <Globe size={10} />
              Remote
            </div>

            {/* Header */}
            <div className="flex flex-col items-start gap-4 mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center font-display font-bold text-3xl shrink-0">
                  M
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 tier-badge text-[9px] py-0.5 px-2">A-TIER</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-xl text-foreground">Marcus Levin</h3>
                  <Trophy size={16} className="text-ember" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">@mlevin · Senior Frontend Engineer</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={10} /> Vercel</span>
                  <span className="flex items-center gap-1"><Code size={10} /> React, TS</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "SCORE", value: "10.2k" },
                { label: "GLOBAL", value: "#14" },
                { label: "SHIPS", value: "42" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-md bg-muted/30">
                  <p className="font-display font-bold text-lg text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Featured Ship */}
            <div className="p-4 rounded-md bg-muted/20 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-ember" />
                  <span className="text-xs font-display font-semibold text-foreground">Featured Ship</span>
                </div>
                <ExternalLink size={10} className="text-muted-foreground" />
              </div>
              <h4 className="font-display font-bold text-sm text-foreground mb-1">Nexar UI Library</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                A modern, accessible component library built with Tailwind and Radix.
              </p>
              <div className="flex gap-1.5">
                {["React", "Tailwind"].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-5 text-center">
              <Link to="/profile/jay" className="btn-ghost text-xs">
                View full profile
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePreview;
