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
import { login, register, signInWithOAuthStrategy } from "../features/authFeatures/auth";
import { authProviderStrategies } from "../strategies/auth";

type AuthMode = "login" | "signup";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
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
            {authProviderStrategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                className="btn-ghost w-full justify-center gap-3 py-2.5 text-sm"
                disabled={loading}
                onClick={() => handleOAuth(strategy)}
              >
                <strategy.Icon />
                {strategy.label}
              </button>
            ))}
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


