import { motion } from "framer-motion";
import { Link as LinkIcon, Star, Shield, Trophy, BadgeCheck, Search } from "lucide-react";

const features = [
  {
    icon: LinkIcon,
    title: "Verified Links",
    description: "Connect GitHub, Twitter, and personal site.",
  },
  {
    icon: Star,
    title: "Featured Shipments",
    description: "Highlight your best projects with live metrics.",
  },
  {
    icon: Shield,
    title: "Badges & Tiers",
    description: "Earn public recognition for specific tech stacks.",
  },
  {
    icon: Trophy,
    title: "Regional Leaderboards",
    description: "Compete locally, rise globally. See who's building the best.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Projects",
    description: "Connect your repos and let your code speak. No self-reported skills.",
  },
  {
    icon: Search,
    title: "Discover by Stack",
    description: "Find builders by language, framework, or domain.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 border-t border-border">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="tier-badge mb-4 w-fit">
            <Star size={12} />
            PRESTIGE PORTFOLIO
          </div>
          <h2 className="font-title font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
            Your new central hub<span className="text-ember">.</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            Stop sending links to five different platforms. Tierd aggregates your GitHub, LeetCode, deployed projects, and hackathon wins into one undeniable source of truth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-surface-hover p-6 group"
            >
              <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-colors" style={{
                background: "linear-gradient(135deg, hsl(var(--ember) / 0.12), hsl(var(--ember-glow) / 0.08))",
                border: "1px solid hsl(var(--ember) / 0.1)"
              }}>
                <feature.icon size={18} className="text-ember" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
