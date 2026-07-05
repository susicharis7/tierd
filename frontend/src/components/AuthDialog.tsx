import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Doodle,
  MonoCaption,
  StickerBadge,
  Tape,
} from "./tierd";
import { InlineSpinner } from "./ui/loading";
import { cn } from "../lib/utils";
import { login, register, signInWithOAuthStrategy } from "../features/authFeatures/auth";
import { authProviderStrategies } from "../strategies/auth";

type AuthMode = "login" | "signup";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
}

const AuthDialog = ({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthDialogProps) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setErrorMsg("");
    setPassword("");
    setConfirmPassword("");
  }, [open, defaultMode]);

  const isLogin = mode === "login";

  const handleOAuth = async (strategy: typeof authProviderStrategies[number]) => {
    setErrorMsg("");
    try {
      setLoading(true);
      await signInWithOAuthStrategy(strategy);
      // Redirect happens; dialog close + session handled by AuthProvider on return.
    } catch (err) {
      const message = err instanceof Error ? err.message : "OAuth sign-in failed.";
      setErrorMsg(message);
      console.error("OAUTH ERROR:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        if (!fullName.trim() || !username.trim()) {
          throw new Error("Full name and username are required.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await register({
          email: email.trim(),
          password,
          username: username.trim().toLowerCase().replace(/^@/, ""),
          fullName: fullName.trim(),
        });
      }

      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
      console.error("AUTH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[440px] bg-ink-2 border-cream/10 text-cream p-0 gap-0 overflow-visible",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2",
          "duration-250 ease-out",
        )}
      >
        {/* Decorative chrome */}
        <Tape
          color="tape"
          size="md"
          tilt={-4}
          className="-top-[10px] left-14 z-10"
        />
        <Doodle.Sparkle
          size={22}
          className="absolute top-5 right-5 text-orange pointer-events-none"
          aria-hidden
        />
        <Doodle.Sparkle
          size={12}
          className="absolute top-4 right-14 text-orange/60 pointer-events-none"
          aria-hidden
        />

        <div className="px-7 pt-7 pb-2 text-center">
          <StickerBadge
            color={isLogin ? "cream" : "orange"}
            tilt={-2}
            icon={
              isLogin ? (
                <Doodle.Bolt size={10} />
              ) : (
                <Doodle.Sparkle size={10} />
              )
            }
            className="mb-5"
          >
            {isLogin ? "welcome back" : "join the ranks"}
          </StickerBadge>

          <DialogTitle asChild>
            <h2 className="font-boldonse text-[40px] sm:text-[48px] leading-[0.95] text-cream">
              {isLogin ? (
                <>
                  log in
                  <span className="text-orange">.</span>
                </>
              ) : (
                <>
                  join Tierd
                  <span className="text-orange">.</span>
                </>
              )}
            </h2>
          </DialogTitle>

          <DialogDescription className="font-mono-jb text-[12px] text-muted-ink mt-3 leading-[1.5]">
            {isLogin
              ? "Climb the ladder. Ship daily. Prove the rest."
              : "Connect your work and let the leaderboard do the talking."}
          </DialogDescription>
        </div>

        <div className="px-7 pt-5 pb-5 space-y-4">
          {/* OAuth */}
          <div className="grid gap-2.5">
            {authProviderStrategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                disabled={loading}
                onClick={() => handleOAuth(strategy)}
                className="inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-ink border-[1.5px] border-cream/30 text-cream font-mono-jb font-bold text-[13px] px-4 py-3 hover:border-cream/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <strategy.Icon />
                {strategy.label}
              </button>
            ))}
          </div>

          {/* Dashed "or" divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px border-b border-dashed border-cream/15" />
            <MonoCaption tone="muted" className="text-[10px]">
              // OR
            </MonoCaption>
            <div className="flex-1 h-px border-b border-dashed border-cream/15" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <FieldRow id="auth-fullname" label="// FULL NAME">
                <Input
                  id="auth-fullname"
                  type="text"
                  placeholder="Tarik Skender"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                />
              </FieldRow>
            )}

            {!isLogin && (
              <FieldRow id="auth-username" label="// HANDLE">
                <Input
                  id="auth-username"
                  type="text"
                  placeholder="@your_handle"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldClass}
                />
              </FieldRow>
            )}

            <FieldRow id="auth-email" label="// EMAIL">
              <Input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </FieldRow>

            <FieldRow id="auth-password" label="// PASSWORD">
              <Input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </FieldRow>

            {!isLogin && (
              <FieldRow id="auth-confirm" label="// CONFIRM PASSWORD">
                <Input
                  id="auth-confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={fieldClass}
                />
              </FieldRow>
            )}

            {errorMsg && (
              <p className="font-mono-jb text-[11px] text-orange-2 leading-[1.45]">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-3 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <InlineSpinner
                    className="h-3.5 w-3.5 border-cream/30 border-t-cream"
                    label="Authenticating"
                  />
                  please wait...
                </>
              ) : (
                <>
                  <Doodle.Bolt size={13} className="text-cream" />
                  {isLogin ? "log in" : "create account"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mode switch footer */}
        <div className="border-t border-dashed border-cream/10 px-7 py-4 text-center">
          <p className="font-mono-jb text-[12px] text-muted-ink">
            {isLogin ? (
              <>
                new to Tierd<span className="text-orange">.</span>?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-bold text-orange underline decoration-dashed underline-offset-[3px] hover:text-orange-2 transition-colors"
                >
                  sign up
                </button>
              </>
            ) : (
              <>
                already verified?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-orange underline decoration-dashed underline-offset-[3px] hover:text-orange-2 transition-colors"
                >
                  log in
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const fieldClass =
  "bg-cream/[0.04] border-cream/15 text-cream font-mono-jb text-[13px] placeholder:text-muted-ink/70 focus-visible:ring-orange/40 focus-visible:border-orange/60 rounded-[10px] h-10 px-3";

interface FieldRowProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

const FieldRow = ({ id, label, children }: FieldRowProps) => (
  <div className="space-y-1.5">
    <Label
      htmlFor={id}
      className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-ink"
    >
      {label}
    </Label>
    {children}
  </div>
);

export default AuthDialog;
