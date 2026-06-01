import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import WhyTierdSection from "../components/WhyTierdSection";
import LiveSection from "../components/LiveSection";
import FeaturesSection from "../components/FeaturesSection";
import LadderSection from "../components/LadderSection";
import LeaderboardPreview from "../components/LeaderboardPreview";
import ProfilePreview from "../components/ProfilePreview";
import SocialProof from "../components/SocialProof";
import FooterCTA from "../components/FooterCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <WhyTierdSection />
      <LiveSection />
      <FeaturesSection />
      <LadderSection />
      <LeaderboardPreview />
      <ProfilePreview />
      <SocialProof />
      <FooterCTA />
    </div>
  );
};

export default Index;
