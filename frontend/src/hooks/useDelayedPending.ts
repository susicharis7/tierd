import { useEffect, useState } from "react";

export function useDelayedPending(pending: boolean, delayMs = 150) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timeout);
  }, [pending, delayMs]);

  return visible;
}
