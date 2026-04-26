import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FooterCTA = () => {
  return (
    <section className="relative py-32 border-t border-border">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] rounded-full blur-[120px]" style={{ background: "hsl(var(--ember) / 0.06)" }} />
      </div>

      <div className="section-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-title font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 leading-tight">
            Build in public.
            <br />
            <span className="gradient-text">Rank with proof.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8">
            Your work deserves more than a bullet point on a resume. Make it count.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn-primary">
              Claim your Tierd.
              <ArrowRight size={16} />
            </button>
            <Link to="/explore" className="btn-ghost">
              Explore as guest
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="section-container mt-24 pt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-sm text-foreground">
            Tierd<span className="text-ember">.</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link>
            <Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            <Link to="/profile/jay" className="hover:text-foreground transition-colors">Profiles</Link>
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
