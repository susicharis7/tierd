import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { login, register } from "../features/authFeatures/auth";

type AuthMode = "login" | "signup";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const AuthDialog = ({ open, onOpenChange, defaultMode = "login" }: AuthDialogProps) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    console.log("[AUTH_DIALOG] submit", {
      mode,
      email,
      username,
      fullName,
    });

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

      console.log("[AUTH_DIALOG] success", { mode, email });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message);
      console.error("AUTH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-surface max-w-[420px] border-border/60 p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="font-display text-2xl font-bold tracking-tight">
              {isLogin ? (
                <>
                  Welcome back to <span className="gradient-text-warm">Tierd</span>
                </>
              ) : (
                <>
                  Join <span className="gradient-text-warm">Tierd</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isLogin
                ? "Log in to rank, debate, and climb the leaderboard."
                : "Create your account and start ranking."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-3">
            <button type="button" className="btn-ghost w-full justify-center gap-3 py-2.5 text-sm" disabled>
              <GoogleIcon />
              Continue with Google
            </button>
            <button type="button" className="btn-ghost w-full justify-center gap-3 py-2.5 text-sm" disabled>
              <GitHubIcon />
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-fullname" className="text-xs text-muted-foreground">
                  Full name
                </Label>
                <Input
                  id="auth-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-username" className="text-xs text-muted-foreground">
                  Username
                </Label>
                <Input
                  id="auth-username"
                  type="text"
                  placeholder="your_handle"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="********"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-confirm" className="text-xs text-muted-foreground">
                  Confirm password
                </Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted/30 border-border/60 focus-visible:ring-ember/50"
                />
              </div>
            )}

            {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <div className="border-t border-border/60 bg-muted/20 px-6 py-4 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-ember hover:text-ember-glow transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-ember hover:text-ember-glow transition-colors"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;


