import { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Doodle, MonoCaption, Tape } from "../../../components/tierd";
import { useAuth } from "../AuthProvider";

const SecurityPageContent = () => {
  const {
    session,
    loading,
    twoFactor,
    initTwoFactorSetup,
    verifyTwoFactorSetup,
    resendTwoFactorChallenge,
    disableTwoFactor,
  } = useAuth();

  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupStarted, setSetupStarted] = useState(false);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(null);
    }
  };

  const handleStartSetup = async () => {
    await run("setup-init", async () => {
      await initTwoFactorSetup();
      setSetupStarted(true);
      setMessage("A verification code was sent to your email.");
    });
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(setupCode.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    await run("setup-verify", async () => {
      await verifyTwoFactorSetup(setupCode.trim());
      setSetupStarted(false);
      setSetupCode("");
      setMessage("Email 2FA is now enabled.");
    });
  };

  const handleSendDisableCode = async () => {
    await run("disable-resend", async () => {
      await resendTwoFactorChallenge();
      setMessage("Disable code sent to your email.");
    });
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(disableCode.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    await run("disable", async () => {
      await disableTwoFactor(disableCode.trim());
      setDisableCode("");
      setMessage("Email 2FA is disabled.");
    });
  };

  const disabled = loading || !session;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <Navbar />

      <main className="section-container pt-28 pb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <Doodle.Pulse size={14} className="text-orange" />
            <MonoCaption tone="cream">// security</MonoCaption>
          </div>

          <div className="rounded-[18px] border border-cream/10 bg-ink-2 p-6 relative overflow-hidden">
            <Tape color="tape" size="md" tilt={-4} className="-top-[10px] right-16" />
            <h1 className="font-grot font-extrabold text-[30px] leading-tight">
              Email 2FA
            </h1>
            <p className="mt-2 font-mono-jb text-[12px] text-muted-ink leading-[1.6]">
              {session
                ? "Use email codes to confirm each sign-in. Trusting this device keeps it verified for 7 days."
                : "Log in first to manage email 2FA."}
            </p>

            <div className="mt-5 inline-flex items-center rounded-full border border-cream/20 px-3 py-1.5 font-mono-jb text-[11px] uppercase tracking-[0.08em]">
              {twoFactor.enabled ? "enabled" : "not enabled"}
            </div>
            {twoFactor.enabled && twoFactor.hasTrustedDevice && (
              <div className="mt-2 font-mono-jb text-[11px] text-sage uppercase tracking-[0.08em]">
                trusted device active
              </div>
            )}

            {twoFactor.statusError && (
              <p className="mt-3 font-mono-jb text-[11px] text-orange-2">{twoFactor.statusError}</p>
            )}
            {error && <p className="mt-3 font-mono-jb text-[11px] text-orange-2">{error}</p>}
            {message && <p className="mt-3 font-mono-jb text-[11px] text-sage">{message}</p>}

            {!twoFactor.enabled ? (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  disabled={disabled || busy === "setup-init"}
                  onClick={handleStartSetup}
                  className="inline-flex items-center justify-center rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2.5 disabled:opacity-60"
                >
                  {busy === "setup-init" ? "sending..." : "enable email 2fa"}
                </button>

                {setupStarted && (
                  <form onSubmit={handleVerifySetup} className="space-y-3 max-w-sm">
                    <label className="block">
                      <span className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">
                        // setup code
                      </span>
                      <input
                        value={setupCode}
                        onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                        className="mt-1.5 w-full rounded-[10px] h-10 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb tracking-[0.2em]"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={busy === "setup-verify"}
                      className="inline-flex items-center justify-center rounded-full border border-cream/25 text-cream font-mono-jb font-bold text-[12px] px-4 py-2 disabled:opacity-60"
                    >
                      {busy === "setup-verify" ? "verifying..." : "verify and enable"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  disabled={disabled || busy === "disable-resend"}
                  onClick={handleSendDisableCode}
                  className="inline-flex items-center justify-center rounded-full border border-cream/25 text-cream font-mono-jb font-bold text-[12px] px-4 py-2 disabled:opacity-60"
                >
                  {busy === "disable-resend" ? "sending..." : "send disable code"}
                </button>

                <form onSubmit={handleDisable} className="space-y-3 max-w-sm">
                  <label className="block">
                    <span className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">
                      // disable code
                    </span>
                    <input
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      className="mt-1.5 w-full rounded-[10px] h-10 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb tracking-[0.2em]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={busy === "disable"}
                    className="inline-flex items-center justify-center rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2 disabled:opacity-60"
                  >
                    {busy === "disable" ? "disabling..." : "disable email 2fa"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecurityPageContent;
