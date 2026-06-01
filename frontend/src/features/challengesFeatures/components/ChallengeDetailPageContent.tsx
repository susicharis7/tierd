import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Doodle, MonoCaption, UserAvatar } from "../../../components/tierd";
import { useAuth } from "../../authFeatures/AuthProvider";
import {
  useChallengeDetailQuery,
  useChallengeLeaderboardQuery,
  useChallengeParticipantsStatusQuery,
  useJoinChallengeMutation,
  useMyChallengeStateQuery,
  useMyChallengeSubmissionQuery,
  useSubmitChallengeMutation,
} from "../useChallengesData";

type BriefContent = {
  objective: string;
  task: string;
  expectedOutput: string;
  functionalRequirements: string[];
  technicalRequirements: string[];
  restrictions: string[];
  submissionRequirements: string[];
  evaluationCriteria: Array<{ title: string; points: number; bullets: string[] }>;
  rules: string[];
};

const FALLBACK_BRIEF: BriefContent = {
  objective:
    "Build a production-ready feature for a web application with clean state handling, validation, responsive UI, and at least basic tests.",
  task:
    "Build a Challenge Submission feature for Tierd: open challenge details, join, submit GitHub repo + live demo, explain your work, and track status/ranking.",
  expectedOutput:
    "Functional, deployed, and documented feature with public repository and clear demo.",
  functionalRequirements: [
    "User can view challenge title, description, category, difficulty, reward, deadline, and rules.",
    "User can join the challenge only once.",
    "Joined user can submit a GitHub repository URL.",
    "Joined user can submit an optional live demo URL.",
    "User can update submission before deadline.",
    "System validates repository URL format.",
    "System blocks submission after deadline.",
    "Challenge page displays participant list.",
    "Challenge page displays ranking after evaluation.",
    "Winner receives ranking points and reward points.",
  ],
  technicalRequirements: [
    "Repository URL is required.",
    "Repository URL must start with https://github.com/.",
    "Live demo URL must be valid if provided.",
    "Description must be at least 50 characters.",
    "Submission is disabled after deadline.",
  ],
  restrictions: [
    "No plagiarism.",
    "Repository must be public or accessible.",
    "Demo must work.",
    "Late submissions are rejected.",
  ],
  submissionRequirements: [
    "Repository URL *",
    "Live Demo URL",
    "Description *",
    "Test Command",
    "Demo Video URL",
  ],
  evaluationCriteria: [
    {
      title: "Functionality",
      points: 35,
      bullets: [
        "Feature works as described",
        "Main user flow is complete",
        "Edge cases are handled",
      ],
    },
    {
      title: "Code Quality",
      points: 20,
      bullets: [
        "Clean structure",
        "Reusable components",
        "No unnecessary duplicated logic",
        "Clear naming",
      ],
    },
    {
      title: "UI/UX",
      points: 15,
      bullets: [
        "Responsive layout",
        "Clear visual hierarchy",
        "Good loading/success/error feedback",
      ],
    },
    {
      title: "Testing",
      points: 15,
      bullets: [
        "At least 3 meaningful tests",
        "Tests cover main functionality",
        "Test command is documented",
      ],
    },
    {
      title: "Deployment & Demo",
      points: 10,
      bullets: [
        "Live demo works",
        "Repository is accessible",
        "Demo explanation is clear",
      ],
    },
    {
      title: "Documentation",
      points: 5,
      bullets: ["README explains setup, feature, and usage"],
    },
  ],
  rules: [
    "Deadline is strict.",
    "No plagiarism.",
    "Repository must be public or accessible.",
    "Demo must work.",
    "Late submissions are rejected.",
  ],
};

function formatCountdown(targetIso: string, now: number): string {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return "-";
  const diff = target - now;
  if (diff <= 0) return "ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function friendlyDifficulty(value: string) {
  return value.replace(/_/g, " ");
}

function stringFromMeta(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function listFromMeta(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
}

function criteriaFromMeta(
  value: unknown,
  fallback: BriefContent["evaluationCriteria"],
): BriefContent["evaluationCriteria"] {
  if (!Array.isArray(value)) return fallback;
  const mapped = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const obj = entry as Record<string, unknown>;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const points = typeof obj.points === "number" ? obj.points : Number(obj.points ?? 0);
      const bullets = listFromMeta(obj.bullets, []);
      if (!title || Number.isNaN(points)) return null;
      return { title, points, bullets };
    })
    .filter((x): x is { title: string; points: number; bullets: string[] } => Boolean(x));

  return mapped.length > 0 ? mapped : fallback;
}

const STATE_DESCRIPTIONS: Record<string, string> = {
  upcoming: "Challenge exists but cannot be joined yet.",
  active: "Users can join now.",
  joined: "You joined, but have not submitted yet.",
  submitted: "Submission received.",
  under_review: "Deadline passed, evaluation in progress.",
  completed: "Winners/rankings published.",
  expired: "Deadline passed without valid submission.",
  cancelled: "Challenge was removed or invalidated.",
};

const ChallengeDetailPageContent = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { userId } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  const [repoUrl, setRepoUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [testCommand, setTestCommand] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const detailQuery = useChallengeDetailQuery(challengeId ?? null);
  const stateQuery = useMyChallengeStateQuery(challengeId ?? null, Boolean(userId));
  const mySubmissionQuery = useMyChallengeSubmissionQuery(challengeId ?? null, userId);
  const participantsQuery = useChallengeParticipantsStatusQuery(challengeId ?? null);
  const leaderboardQuery = useChallengeLeaderboardQuery(challengeId ?? null);
  const joinMutation = useJoinChallengeMutation(userId);
  const submitMutation = useSubmitChallengeMutation(challengeId ?? null, userId);

  const challenge = detailQuery.data;
  const myState = stateQuery.data;
  const participants = participantsQuery.data ?? [];
  const leaderboard = leaderboardQuery.data ?? [];
  const submission = mySubmissionQuery.data;

  useEffect(() => {
    if (!submission) return;
    setRepoUrl(submission.repo_url ?? "");
    setLiveDemoUrl(submission.demo_url ?? "");
    setDescription(submission.description ?? "");
    setTestCommand(
      typeof submission.metadata?.test_command === "string"
        ? submission.metadata.test_command
        : "",
    );
    setDemoVideoUrl(
      typeof submission.metadata?.demo_video_url === "string"
        ? submission.metadata.demo_video_url
        : "",
    );
  }, [submission]);

  const brief = useMemo<BriefContent>(() => {
    const m = challenge?.metadata ?? {};
    return {
      objective: stringFromMeta(m.objective, FALLBACK_BRIEF.objective),
      task: stringFromMeta(m.task, FALLBACK_BRIEF.task),
      expectedOutput: stringFromMeta(m.expected_output, FALLBACK_BRIEF.expectedOutput),
      functionalRequirements: listFromMeta(
        m.functional_requirements,
        FALLBACK_BRIEF.functionalRequirements,
      ),
      technicalRequirements: listFromMeta(
        m.technical_requirements,
        FALLBACK_BRIEF.technicalRequirements,
      ),
      restrictions: listFromMeta(m.restrictions, FALLBACK_BRIEF.restrictions),
      submissionRequirements: listFromMeta(
        m.submission_requirements,
        FALLBACK_BRIEF.submissionRequirements,
      ),
      evaluationCriteria: criteriaFromMeta(
        m.evaluation_criteria,
        FALLBACK_BRIEF.evaluationCriteria,
      ),
      rules: listFromMeta(m.rules_list, FALLBACK_BRIEF.rules),
    };
  }, [challenge?.metadata]);

  const effectiveState = myState?.user_state ?? challenge?.phase ?? "upcoming";
  const canJoin = Boolean(myState?.can_join);
  const canSubmit = Boolean(myState?.can_submit || myState?.can_update_submission);

  const submitDisabled = !canSubmit || submitMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMutation.mutateAsync({
      repoUrl,
      demoUrl: liveDemoUrl,
      description,
      testCommand,
      demoVideoUrl,
    });
  };

  return (
    <div className="min-h-screen bg-ink text-cream font-grot">
      <Navbar />

      <div className="section-container pt-28 pb-20 space-y-8">
        <Link
          to="/challenges"
          className="inline-flex rounded-full border border-cream/20 px-4 py-2 font-mono-jb text-[11px] uppercase tracking-[0.08em] text-cream/80 hover:text-cream"
        >
          back to challenges
        </Link>

        {detailQuery.isPending && (
          <div className="rounded-[18px] border border-ink-line bg-ink-2 p-6 font-mono-jb text-[12px] text-muted-ink">
            loading challenge...
          </div>
        )}

        {!detailQuery.isPending && !challenge && (
          <div className="rounded-[18px] border border-dashed border-cream/20 bg-cream/[0.03] p-8 text-center">
            <p className="font-grot font-extrabold text-[22px] text-cream mb-2">Challenge not found</p>
          </div>
        )}

        {challenge && (
          <>
            <section className="rounded-[20px] border border-ink-line bg-ink-2 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Doodle.Bolt size={14} className="text-orange" />
                    <MonoCaption tone="cream">// HEADER</MonoCaption>
                    <span className="rounded-full border border-cream/20 px-2 py-0.5 font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/80">
                      {effectiveState}
                    </span>
                    <span className="font-mono-jb text-[10px] text-muted-ink">
                      {STATE_DESCRIPTIONS[effectiveState] ?? ""}
                    </span>
                  </div>
                  <h1 className="font-boldonse text-[38px] sm:text-[52px] leading-[0.95] text-cream">
                    {challenge.title}
                  </h1>
                  <p className="font-mono-jb text-[13px] text-muted-ink mt-3 leading-[1.7] max-w-[800px]">
                    {challenge.description}
                  </p>
                </div>

                <div className="rounded-[14px] bg-cream/[0.03] border border-cream/15 p-4 min-w-[260px]">
                  <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mb-1">countdown</p>
                  <p className="font-boldonse text-[24px] text-orange">
                    {challenge.phase === "upcoming"
                      ? formatCountdown(challenge.starts_at, now)
                      : formatCountdown(challenge.ends_at, now)}
                  </p>
                  <p className="font-mono-jb text-[11px] text-muted-ink mt-2">
                    {challenge.phase === "upcoming" ? "starts in" : "time left"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                <StatCell label="Category" value={challenge.category} />
                <StatCell label="Difficulty" value={friendlyDifficulty(challenge.difficulty)} />
                <StatCell label="Reward" value={`+${challenge.reward_points}`} />
                <StatCell label="Participants" value={String(challenge.participants_count)} />
                <StatCell label="Deadline" value={new Date(challenge.ends_at).toLocaleDateString()} />
              </div>

              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={!canJoin || joinMutation.isPending}
                  onClick={() => challengeId && joinMutation.mutate(challengeId)}
                  className="rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-5 py-2.5 disabled:opacity-50"
                >
                  {myState?.has_joined ? "joined" : "join challenge"}
                </button>
                {myState?.has_joined && (
                  <span className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-forest">
                    joined
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Doodle.CodeBracket size={14} className="text-orange" />
                <MonoCaption tone="cream">// BRIEF</MonoCaption>
              </div>
              <div className="space-y-4">
                <Block title="Objective" body={brief.objective} />
                <Block title="Task" body={brief.task} />
                <Block title="Expected Output" body={brief.expectedOutput} />
              </div>
            </section>

            <section className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Doodle.Pulse size={14} className="text-orange" />
                <MonoCaption tone="cream">// REQUIREMENTS</MonoCaption>
              </div>
              <RequirementList title="Functional Requirements" items={brief.functionalRequirements} />
              <RequirementList title="Technical Requirements" items={brief.technicalRequirements} />
              <RequirementList title="Restrictions" items={brief.restrictions} />
            </section>

            <section className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Doodle.Bolt size={14} className="text-orange" />
                <MonoCaption tone="cream">// SUBMISSION</MonoCaption>
              </div>

              <RequirementList title="Submission Requirements" items={brief.submissionRequirements} />

              <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3">
                <Field
                  label="Repository URL *"
                  value={repoUrl}
                  onChange={setRepoUrl}
                  placeholder="https://github.com/username/repo"
                  required
                />
                <Field
                  label="Live Demo URL"
                  value={liveDemoUrl}
                  onChange={setLiveDemoUrl}
                  placeholder="https://your-demo.app"
                />
                <Field
                  label="Description *"
                  value={description}
                  onChange={setDescription}
                  placeholder="Explain what you built, architecture, and decisions (min 50 chars)."
                  multiline
                  required
                />
                <Field
                  label="Test Command"
                  value={testCommand}
                  onChange={setTestCommand}
                  placeholder="npm test"
                  required
                />
                <Field
                  label="Demo Video URL"
                  value={demoVideoUrl}
                  onChange={setDemoVideoUrl}
                  placeholder="https://..."
                />

                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="submit"
                    disabled={submitDisabled}
                    className="rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-5 py-2.5 disabled:opacity-50"
                  >
                    {submitMutation.isPending ? "saving..." : submission ? "update submission" : "submit"}
                  </button>
                  <span className="font-mono-jb text-[11px] text-muted-ink">
                    status: {myState?.submission_status ?? "none"}
                  </span>
                </div>
              </form>
            </section>

            <section className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Doodle.Trophy size={14} className="text-orange" />
                <MonoCaption tone="cream">// EVALUATION (100 pts)</MonoCaption>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brief.evaluationCriteria.map((criterion) => (
                  <div key={criterion.title} className="rounded-[12px] border border-cream/10 bg-cream/[0.02] p-4">
                    <p className="font-grot font-extrabold text-[16px] text-cream">
                      {criterion.title} - {criterion.points} pts
                    </p>
                    <ul className="mt-2 space-y-1">
                      {criterion.bullets.map((item) => (
                        <li key={item} className="font-mono-jb text-[11px] text-muted-ink">- {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Doodle.Pulse size={14} className="text-orange" />
                  <MonoCaption tone="cream">// PARTICIPANTS</MonoCaption>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {participants.map((row) => (
                    <div
                      key={row.profile_id}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[12px] border border-cream/10 bg-cream/[0.02] px-3 py-2"
                    >
                      <Link to={`/profile/${row.username ?? row.profile_id}`} className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={row.full_name || row.username || "builder"}
                          src={row.avatar_url}
                          size={30}
                        />
                        <div className="min-w-0">
                          <p className="font-grot font-bold text-[13px] text-cream truncate">
                            {row.full_name || "Builder"}
                          </p>
                          <p className="font-mono-jb text-[10px] text-muted-ink truncate">@{row.username ?? "builder"}</p>
                        </div>
                      </Link>
                      <span className="rounded-md border border-cream/20 px-2 py-1 font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/80">
                        {row.submission_status}
                      </span>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="font-mono-jb text-[12px] text-muted-ink">No participants yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Doodle.Trophy size={14} className="text-orange" />
                  <MonoCaption tone="cream">// RANKING</MonoCaption>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {leaderboard.map((row, idx) => {
                    const position = row.position ?? idx + 1;
                    const isWinner = position === 1;
                    return (
                      <div
                        key={`${row.profile_id}-${idx}`}
                        className="grid grid-cols-[30px_1fr_auto_auto] items-center gap-2 rounded-[12px] border border-cream/10 bg-cream/[0.02] px-3 py-2"
                      >
                        <span className="font-boldonse text-[16px] text-orange">{String(position).padStart(2, "0")}</span>
                        <p className="font-mono-jb text-[11px] text-cream truncate">{row.full_name || row.username || "builder"}</p>
                        <span className="font-mono-jb text-[10px] text-muted-ink">{row.score ?? "-"}</span>
                        <span className="rounded-md bg-orange/15 text-orange font-mono-jb text-[10px] font-bold px-2 py-1">
                          +{row.awarded_points} {isWinner ? "winner" : ""}
                        </span>
                      </div>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <p className="font-mono-jb text-[12px] text-muted-ink">Ranking appears after evaluation.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[18px] bg-ink-2 border border-ink-line p-6">
              <div className="flex items-center gap-2 mb-4">
                <Doodle.CodeBracket size={14} className="text-orange" />
                <MonoCaption tone="cream">// RULES</MonoCaption>
              </div>
              <ul className="space-y-2">
                {brief.rules.map((rule) => (
                  <li key={rule} className="font-mono-jb text-[12px] text-muted-ink">- {rule}</li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-cream/10 bg-cream/[0.02] p-3">
      <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">{label}</p>
      <p className="font-grot font-extrabold text-[15px] text-cream mt-1 truncate">{value}</p>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-grot font-extrabold text-[16px] text-cream">{title}</p>
      <p className="font-mono-jb text-[12px] text-muted-ink mt-1 leading-[1.7]">{body}</p>
    </div>
  );
}

function RequirementList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4">
      <p className="font-grot font-extrabold text-[15px] text-cream mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="font-mono-jb text-[11px] text-muted-ink">- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mb-1">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className="w-full rounded-[10px] border border-cream/20 bg-cream/[0.03] px-3 py-2 font-mono-jb text-[12px] text-cream"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full h-10 rounded-[10px] border border-cream/20 bg-cream/[0.03] px-3 font-mono-jb text-[12px] text-cream"
        />
      )}
    </label>
  );
}

export default ChallengeDetailPageContent;