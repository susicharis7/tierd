import { useCallback, useState } from "react";
import {
  githubSyncRepository,
  GithubSyncError,
  type GithubSyncErrorCode,
  type GithubSyncSuccess,
} from "../../repositories/githubSyncRepository";

export type UseGithubSyncResult = {
  /** Trigger a sync. Resolves on success; throws GithubSyncError on failure. */
  sync: () => Promise<GithubSyncSuccess>;
  /** True while a sync is in flight. */
  syncing: boolean;
  /** The last successful sync result, if any. */
  lastResult: GithubSyncSuccess | null;
  /** The last error code, if the most recent attempt failed. */
  lastErrorCode: GithubSyncErrorCode | null;
};

/**
 * Triggers the backend's GitHub contributions sync. Keeps a small slice of
 * state for the calling component: in-flight flag, last success, last error
 * code. The hook itself never toasts — leave UI side-effects to the caller.
 */
export function useGithubSync(): UseGithubSyncResult {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<GithubSyncSuccess | null>(null);
  const [lastErrorCode, setLastErrorCode] = useState<GithubSyncErrorCode | null>(null);

  const sync = useCallback(async () => {
    setSyncing(true);
    setLastErrorCode(null);
    try {
      const result = await githubSyncRepository.syncMe();
      setLastResult(result);
      return result;
    } catch (err) {
      const code = err instanceof GithubSyncError ? err.code : "unknown";
      setLastErrorCode(code);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing, lastResult, lastErrorCode };
}
