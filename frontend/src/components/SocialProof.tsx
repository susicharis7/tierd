import { motion } from "framer-motion";

const marqueeItems = [
  "Top 12 in Bosnia", "5 verified projects", "Rising in AI", "7-week streak",
  "Aegis Tier", "Challenge Winner", "React Expert", "Open Source Contributor",
  "Tier 5 Unlocked", "3,200 XP this month", "Rust Specialist", "Full Stack Builder",
];

const quotes = [
  { text: "Finally, a platform that rewards shipping over talking.", author: "Sara K.", tier: "Aegis" },
  { text: "My Tierd profile got me more inbound than LinkedIn ever did.", author: "Amir H.", tier: "Tier 5" },
  { text: "The leaderboard is addictive. I've shipped 3x more since joining.", author: "Lena M.", tier: "Tier 5" },
];

const SocialProof = () => {
  return (
    <section className="relative py-24 border-t border-border overflow-hidden">
      {/* Marquee */}
      <div className="mb-16 relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="mx-4 px-4 py-2 rounded-full text-xs font-medium border border-border text-muted-foreground whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-title font-bold text-2xl sm:text-3xl text-foreground mb-2">
            Where developers build <span className="gradient-text">reputation</span>.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-surface p-5"
            >
              <p className="text-sm text-foreground/85 leading-relaxed mb-4">"{q.text}"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{q.author}</span>
                <span className="tier-badge text-[10px] py-0.5 px-1.5">{q.tier}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
