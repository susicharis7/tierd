import { useEffect, useRef, useState } from "react";
import { Doodle, MonoCaption, StickerBadge, Tape } from "../../../components/tierd";

interface TwoFactorGateProps {
  emailMasked: string | null;
  statusError: string | null;
  onVerify: (code: string, rememberDevice: boolean) => Promise<void>;
  onInitialSend: () => Promise<void>;
  onResend: () => Promise<void>;
}

export function TwoFactorGate({
  emailMasked,
  statusError,
  onVerify,
  onInitialSend,
  onResend,
}: TwoFactorGateProps) {
  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const initialCodeRequestSentRef = useRef(false);

  useEffect(() => {
    if (initialCodeRequestSentRef.current) return;
    initialCodeRequestSentRef.current = true;

    setResending(true);
    onInitialSend()
      .then(() => setNotice("A verification code was sent to your email."))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Could not send code.";
        setError(message);
      })
      .finally(() => setResending(false));
  }, [onInitialSend]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    try {
      setSubmitting(true);
      await onVerify(clean, rememberDevice);
      setCode("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    try {
      setResending(true);
      await onResend();
      setNotice("A new code was sent.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not resend code.";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[18px] bg-ink-2 border border-cream/10 p-6 sm:p-7 relative shadow-[0_0_60px_-18px_hsl(var(--orange)/0.5)]">
        <Tape color="tape" size="md" tilt={-6} className="-top-[10px] left-12" />
        <div className="flex items-center justify-between gap-3 mb-4">
          <StickerBadge color="orange" icon={<Doodle.Bolt size={10} />}>
            security check
          </StickerBadge>
          <MonoCaption tone="cream">// required</MonoCaption>
        </div>

        <h2 className="font-grot font-extrabold text-[24px] text-cream leading-tight">
          verify sign-in code
        </h2>
        <p className="mt-2 font-mono-jb text-[12px] text-muted-ink leading-[1.55]">
          Enter the 6-digit email code{emailMasked ? ` sent to ${emailMasked}` : ""}.
        </p>

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="tierd-2fa-code"
              className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-ink"
            >
              // verification code
            </label>
            <input
              id="tierd-2fa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1.5 w-full rounded-[10px] h-11 px-3 bg-cream/[0.04] border border-cream/15 text-cream font-mono-jb text-[16px] tracking-[0.28em] placeholder:text-muted-ink/70 focus:outline-none focus:ring-2 focus:ring-orange/30"
              placeholder="000000"
            />
          </div>

          <label className="flex items-center gap-2.5 text-[12px] text-cream/80 font-mono-jb">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 rounded border-cream/30 bg-ink"
            />
            trust this device for 7 days
          </label>

          {(statusError || error) && (
            <p className="font-mono-jb text-[11px] text-orange-2">{error ?? statusError}</p>
          )}

          {notice && <p className="font-mono-jb text-[11px] text-sage">{notice}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-cta-orange disabled:opacity-60"
          >
            {submitting ? "verifying..." : "verify and continue"}
          </button>
        </form>

        <button
          type="button"
          disabled={resending}
          onClick={handleResend}
          className="mt-3 font-mono-jb text-[11px] uppercase tracking-[0.08em] text-cream/70 hover:text-cream disabled:opacity-50"
        >
          {resending ? "sending..." : "resend code"}
        </button>
      </div>
    </div>
  );
}
