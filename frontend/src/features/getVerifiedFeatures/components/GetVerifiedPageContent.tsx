import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Doodle, StickerBadge, Tape } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { verifyFaqs } from "../getVerifiedData";
import EvaluationReport from "./EvaluationReport";
import EvaluationSteps from "./EvaluationSteps";
import GetVerifiedHero from "./GetVerifiedHero";
import { useAuth } from "../../authFeatures/AuthProvider";
import { toast } from "../../../components/ui/sonner";
import {
  type EvaluationRun,
  type EvaluationStep,
} from "../../../repositories/evaluationRepository";
import {
  useEvaluationStatusQuery,
  useStartEvaluationMutation,
} from "../useEvaluationFlow";

const FAQ_BG: Record<"peach" | "cream" | "sage", string> = {
  peach: "bg-peach text-ink",
  cream: "bg-cream text-ink",
  sage: "bg-sage text-ink",
};

function isRunActive(run: EvaluationRun | null | undefined) {
  return run?.status === "queued" || run?.status === "running";
}

function getCelebrationStorageKey(userId: string, runId: string) {
  return `tierd.evaluation.celebrated.${userId}.${runId}`;
}

function scrollToEvaluationControl() {
  const target = document.getElementById("evaluation-control");
  if (!target) return;
  const navOffset = 110;
  const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function launchCelebrationConfetti() {
  const burst = (originX: number, originY: number, angle: number) => {
    confetti({
      particleCount: 90,
      spread: 70,
      startVelocity: 48,
      ticks: 220,
      gravity: 0.9,
      scalar: 1.15,
      angle,
      origin: { x: originX, y: originY },
      colors: ["#FF5C1A", "#FFD166", "#F7F0DF", "#6B3A4F"],
    });
  };
  burst(0.15, 0.65, 55);
  burst(0.85, 0.65, 125);
  setTimeout(() => {
    confetti({
      particleCount: 140,
      spread: 95,
      startVelocity: 50,
      ticks: 240,
      gravity: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#FF5C1A", "#FFD166", "#F7F0DF", "#6B3A4F"],
    });
  }, 220);
}

const GetVerifiedPageContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, userId } = useAuth();

  const statusQuery = useEvaluationStatusQuery(userId);
  const startMutation = useStartEvaluationMutation(userId);

  const [showCelebration, setShowCelebration] = useState(false);
  const lastCelebratedRunIdRef = useRef<string | null>(null);

  useEffect(() => {
    const hash = location.hash?.replace(/^#/, "");
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const target = document.getElementById(hash);
    if (!target) return;

    const navOffset = 110;
    const y = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, [location.pathname, location.hash]);

  const latestRun = statusQuery.data?.latestRun ?? null;
  const readiness = statusQuery.data?.readiness ?? null;
  const evaluationCompleted = Boolean(statusQuery.data?.alreadyEvaluated);
  const activeRun = isRunActive(latestRun);

  useEffect(() => {
    if (latestRun?.status !== "completed" || !latestRun.id) return;
    if (!userId) return;
    if (lastCelebratedRunIdRef.current === latestRun.id) return;
    const storageKey = getCelebrationStorageKey(userId, latestRun.id);
    try {
      if (localStorage.getItem(storageKey) === "1") {
        lastCelebratedRunIdRef.current = latestRun.id;
        return;
      }
      localStorage.setItem(storageKey, "1");
    } catch {
      // ignore storage errors
    }
    lastCelebratedRunIdRef.current = latestRun.id;
    launchCelebrationConfetti();
    setShowCelebration(true);
    const timeoutId = window.setTimeout(() => setShowCelebration(false), 5200);
    return () => window.clearTimeout(timeoutId);
  }, [latestRun?.id, latestRun?.status, userId]);

  const canStartNow = Boolean(
    session &&
      readiness?.canEvaluate &&
      !evaluationCompleted &&
      !activeRun &&
      !startMutation.isPending,
  );

  const startDisabled = Boolean(
    startMutation.isPending || activeRun || evaluationCompleted,
  );

  const startLabel = useMemo(() => {
    if (!session) return "sign in to evaluate";
    if (startMutation.isPending) return "starting...";
    if (activeRun) return "evaluation running...";
    if (evaluationCompleted) return "evaluation completed";
    if (!readiness?.canEvaluate) return "review missing steps";
    return "start evaluation";
  }, [
    session,
    startMutation.isPending,
    activeRun,
    evaluationCompleted,
    readiness?.canEvaluate,
  ]);

  const handleStartEvaluation = () => {
    if (!session) {
      navigate("/");
      toast("Sign in first to start evaluation.");
      return;
    }

    if (!readiness?.canEvaluate) {
      toast("Complete all required steps first.");
      scrollToEvaluationControl();
      return;
    }

    if (!canStartNow) {
      scrollToEvaluationControl();
      return;
    }

    startMutation.mutate(undefined, {
      onSuccess: () => {
        toast("Evaluation started.");
        scrollToEvaluationControl();
      },
      onError: (err) => {
        const message =
          err instanceof Error ? err.message : "Failed to start evaluation.";
        toast(message);
        scrollToEvaluationControl();
      },
    });
  };

  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative">
      <Navbar />

      <GetVerifiedHero
        onStartEvaluation={handleStartEvaluation}
        startDisabled={startDisabled}
        startLabel={startLabel}
      />

      <EvaluationControlPanel
        loading={statusQuery.isPending}
        error={statusQuery.error}
        readinessSteps={readiness?.steps ?? []}
        readinessCanEvaluate={Boolean(readiness?.canEvaluate)}
        latestRun={latestRun}
      />

      <EvaluationSteps />
      <EvaluationReport />

      <FaqSection />
      <FinalCTA
        onStartEvaluation={handleStartEvaluation}
        startDisabled={startDisabled}
        startLabel={startLabel}
      />

      <Footer />

      <AnimatePresence>
        {showCelebration && latestRun?.status === "completed" && (
          <CelebrationOverlay run={latestRun} onClose={() => setShowCelebration(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const EvaluationControlPanel = ({
  loading,
  error,
  readinessSteps,
  readinessCanEvaluate,
  latestRun,
}: {
  loading: boolean;
  error: unknown;
  readinessSteps: EvaluationStep[];
  readinessCanEvaluate: boolean;
  latestRun: EvaluationRun | null;
}) => {
  const requiredSteps = readinessSteps.filter((step) => step.required);
  const missingSteps = requiredSteps.filter((step) => !step.done);
  const runActive = isRunActive(latestRun);

  return (
    <section id="evaluation-control" className="pb-8">
      <div className="section-container">
        <div className="rounded-[18px] border border-ink-line bg-ink-2 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-grot font-extrabold text-[22px] sm:text-[26px]">
              evaluation status
            </h3>
            {latestRun?.status === "completed" ? (
              <span className="rounded-full bg-orange text-cream font-mono-jb text-[11px] px-3 py-1">
                completed
              </span>
            ) : runActive ? (
              <span className="rounded-full bg-orange text-cream font-mono-jb text-[11px] px-3 py-1">
                running
              </span>
            ) : (
              <span className="rounded-full border border-cream/25 text-cream font-mono-jb text-[11px] px-3 py-1">
                waiting
              </span>
            )}
          </div>

          {loading && (
            <p className="font-mono-jb text-[12px] text-muted-ink">
              Loading evaluation status...
            </p>
          )}

          {!loading && error && (
            <p className="font-mono-jb text-[12px] text-orange">
              {error instanceof Error ? error.message : "Failed to load evaluation status."}
            </p>
          )}

          {!loading && !error && runActive && latestRun && <RunProgress run={latestRun} />}

          {!loading && !error && latestRun?.status === "completed" && (
            <RunCompleted run={latestRun} />
          )}

          {!loading && !error && latestRun?.status === "failed" && !runActive && (
            <div className="space-y-3">
              <p className="font-mono-jb text-[12px] text-orange">
                {latestRun.errorMessage ?? "Evaluation failed. Use the top start button to retry."}
              </p>
            </div>
          )}

          {!loading && !error && !runActive && latestRun?.status !== "completed" && (
            <div className="space-y-4">
              {!readinessCanEvaluate && (
                <>
                  <p className="font-mono-jb text-[12px] text-muted-ink">
                    You must complete these steps before evaluation:
                  </p>
                  <div className="space-y-2">
                    {missingSteps.map((step) => (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28 }}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-cream/15 bg-ink/35 px-3 py-2.5"
                      >
                        <div>
                          <p className="font-grot font-bold text-[14px]">{step.title}</p>
                          <p className="font-mono-jb text-[11px] text-muted-ink">
                            {step.description}
                          </p>
                        </div>
                        <Link
                          to={step.actionHref}
                          className="rounded-full border border-cream/30 text-cream font-mono-jb text-[11px] px-3 py-1.5 hover:border-cream/60"
                        >
                          {step.actionLabel}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {readinessCanEvaluate && (
                <p className="font-mono-jb text-[12px] text-orange">
                  All required steps completed. Start evaluation using the top button.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const RunProgress = ({ run }: { run: EvaluationRun }) => (
  <div className="space-y-4">
    <motion.p
      key={run.stageKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="font-mono-jb text-[12px] text-cream/85"
    >
      {run.stageLabel}
    </motion.p>

    <div className="relative h-3 rounded-full bg-ink border border-ink-line overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange via-orange-2 to-tape"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, run.progressPct))}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-y-0 w-[24%] bg-white/25 blur-[2px]"
        animate={{ x: ["-30%", "460%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
    </div>

    <div className="flex items-center justify-between gap-3">
      <p className="font-mono-jb text-[11px] text-cream/75">
        Evaluating your rank...
      </p>
      <motion.p
        key={run.progressPct}
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.22 }}
        className="font-boldonse text-[18px] text-orange"
      >
        {run.progressPct}%
      </motion.p>
    </div>
  </div>
);

const RunCompleted = ({ run }: { run: EvaluationRun }) => {
  const summary =
    typeof run.aiFeedback?.summary === "string"
      ? run.aiFeedback.summary
      : "Evaluation completed successfully.";
  const scoreAfter = run.scoreAfter ?? run.scoreBefore ?? 0;
  const calibrated = run.finalDelta !== 0;
  const breakdown = getBreakdownItems(run.deterministicBreakdown);
  const strengths = getFeedbackLines(run.aiFeedback, "strengths");
  const concerns = getFeedbackLines(run.aiFeedback, "concerns");
  const recommendations = getFeedbackLines(run.aiFeedback, "recommendations");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      <div className="relative overflow-hidden rounded-[16px] border border-orange/40 bg-ink p-4">
        <Tape color="tape" size="sm" tilt={-5} className="-top-[9px] left-7" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,hsl(var(--orange)/0.18),transparent_60%)]" />
        <div className="relative z-[1]">
          <p className="font-boldonse text-[24px] text-orange">EVALUATION COMPLETE</p>
          <p className="font-grot font-extrabold text-[20px] text-cream mt-1">
            Tier: {run.tierAfter ?? "Unranked"}
          </p>
          <p className="font-boldonse text-[38px] leading-none text-cream mt-2">
            {scoreAfter.toLocaleString()}
          </p>
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.12em] text-muted-ink mt-1">
            calibrated score
          </p>
          {calibrated && (
            <p className="font-mono-jb text-[11px] text-cream/80 mt-2">
              Calibration applied: {run.finalDelta >= 0 ? "+" : ""}
              {run.finalDelta}
            </p>
          )}
        </div>
      </div>
      <p className="font-mono-jb text-[11px] text-cream/75">{summary}</p>
      {breakdown.length > 0 && (
        <div className="rounded-[14px] border border-cream/15 bg-ink/55 p-3.5">
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.12em] text-cream/80">
            score breakdown
          </p>
          <div className="mt-2.5 space-y-2">
            {breakdown.map((item) => (
              <div
                key={item.source}
                className="rounded-[10px] border border-cream/10 bg-ink-2/80 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-grot font-bold text-[13px] text-cream capitalize">
                    {item.source}
                  </span>
                  <span className="font-mono-jb text-[11px] text-orange">
                    {item.score >= 0 ? "+" : ""}
                    {item.score}
                  </span>
                </div>
                {item.explanation && (
                  <p className="mt-1 font-mono-jb text-[10px] text-muted-ink">
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {(strengths.length > 0 || concerns.length > 0 || recommendations.length > 0) && (
        <div className="rounded-[14px] border border-cream/15 bg-ink/55 p-3.5 space-y-2.5">
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.12em] text-cream/80">
            ai feedback
          </p>
          <FeedbackGroup title="strengths" items={strengths} />
          <FeedbackGroup title="concerns" items={concerns} />
          <FeedbackGroup title="recommendations" items={recommendations} />
        </div>
      )}
    </motion.div>
  );
};

function getBreakdownItems(raw: Record<string, unknown>): Array<{
  source: string;
  score: number;
  explanation: string;
}> {
  const components = Array.isArray(raw?.components) ? raw.components : [];
  return components
    .map((item) => {
      const source =
        typeof (item as Record<string, unknown>).source === "string"
          ? (item as Record<string, unknown>).source
          : "signal";
      const score = Number((item as Record<string, unknown>).score ?? 0);
      const explanation =
        typeof (item as Record<string, unknown>).explanation === "string"
          ? (item as Record<string, unknown>).explanation
          : "";
      return {
        source,
        score: Number.isFinite(score) ? Math.round(score) : 0,
        explanation,
      };
    })
    .filter((item) => item.source.length > 0);
}

function getFeedbackLines(
  feedback: Record<string, unknown>,
  key: "strengths" | "concerns" | "recommendations",
): string[] {
  const raw = feedback?.[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim()))
    .filter(Boolean)
    .slice(0, 3);
}

const FeedbackGroup = ({ title, items }: { title: string; items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-orange">
        {title}
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((line, idx) => (
          <li key={`${title}-${idx}`} className="font-mono-jb text-[11px] text-cream/85">
            - {line}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CelebrationOverlay = ({
  run,
  onClose,
}: {
  run: EvaluationRun;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.82, y: 28, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.95, y: 10, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative w-full max-w-[560px] rounded-[24px] border border-orange/40 bg-ink-2 p-7 shadow-glow-orange overflow-hidden"
      onClick={(event) => event.stopPropagation()}
    >
      <motion.div
        className="absolute -inset-24 bg-[radial-gradient(circle,rgba(255,92,26,0.26)_0%,rgba(255,92,26,0)_66%)]"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-[1] text-center space-y-3">
        <p className="font-boldonse text-[36px] text-orange">SUPER !!</p>
        <p className="font-grot font-extrabold text-[28px] text-cream">
          Your rank is {run.tierAfter ?? "Unranked"}
        </p>
        <p className="font-mono-jb text-[13px] text-cream/80">
          Score now: {run.scoreAfter ?? run.scoreBefore ?? 0} ({run.finalDelta >= 0 ? "+" : ""}
          {run.finalDelta})
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-5 py-2.5"
        >
          continue
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const FaqSection = () => (
  <section className="pt-16 pb-12">
    <div className="section-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {verifyFaqs.map((f) => (
          <div
            key={f.q}
            className={cn(
              "relative rounded-[14px] p-5 shadow-sticker",
              FAQ_BG[f.color],
            )}
            style={{ transform: `rotate(${f.tilt}deg)` }}
          >
            <span className="absolute -top-2 left-4 font-boldonse text-[18px] text-orange">
              ?
            </span>
            <h3 className="font-grot font-extrabold text-[16px] mb-1.5">{f.q}</h3>
            <p className="font-mono-jb text-[11px] text-muted-cream leading-[1.55]">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = ({
  onStartEvaluation,
  startDisabled,
  startLabel,
}: {
  onStartEvaluation: () => void;
  startDisabled: boolean;
  startLabel: string;
}) => (
  <section className="pt-12 pb-24 relative text-center">
    <Doodle.Mountains
      w={680}
      h={200}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 text-orange/[0.08] hidden lg:block pointer-events-none"
      aria-hidden
    />
    <div className="section-container relative">
      <StickerBadge color="orange" tilt={-2} icon={<Doodle.Bolt size={11} />}>
        your move
      </StickerBadge>
      <h2 className="font-boldonse text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.95] tracking-[-0.02em] text-cream mt-6">
        your profile is your <span className="text-orange">proof.</span>
      </h2>
      <p className="font-mono-jb text-[13px] text-cream/75 mt-5 max-w-[520px] mx-auto leading-[1.6]">
        Connect your work, get evaluated, and claim your rank on the leaderboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onStartEvaluation}
          disabled={startDisabled}
          className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Doodle.Bolt size={14} />
          {startLabel}
        </button>
        <Link
          to="/leaderboard"
          className="inline-flex items-center rounded-full border-[1.5px] border-dashed border-cream/30 text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 hover:border-cream/50 transition-colors"
        >
          explore leaderboard
        </Link>
      </div>
    </div>
  </section>
);

export default GetVerifiedPageContent;
