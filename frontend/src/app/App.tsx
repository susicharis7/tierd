import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "../components/ui/sonner";
import { Toaster } from "../components/ui/toaster";
import { TooltipProvider } from "../components/ui/tooltip";
import { AuthProvider } from "../features/authFeatures/AuthProvider";
import { useRankingRealtimeSync } from "../features/rankingFeatures/useRankingRealtimeSync";
import IndexPage from "../pages/IndexPage";
import ExplorePage from "../pages/ExplorePage";
import LeaderboardPage from "../pages/LeaderboardPage";
import ProfilePage from "../pages/ProfilePage";
import ChallengesPage from "../pages/ChallengesPage";
import ChallengeDetailPage from "../pages/ChallengeDetailPage";
import GetVerifiedPage from "../pages/GetVerifiedPage";
import SecurityPage from "../pages/SecurityPage";
import DesignSystemPage from "../pages/DesignSystemPage";
import NotFoundPage from "../pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  },
});

function RankingRealtimeBridge() {
  useRankingRealtimeSync();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RankingRealtimeBridge />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:challengeId" element={<ChallengeDetailPage />} />
              <Route path="/get-verified" element={<GetVerifiedPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/design-system" element={<DesignSystemPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
