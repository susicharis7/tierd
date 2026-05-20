import { useCallback, useState } from "react";
import {
  githubSyncRepository,
  type GithubSyncSuccess,
} from "../../repositories/githubSyncRepository";

export type UseGithubSyncResult = {
  /** Trigger a sync. Resolves on success; throws GithubSyncError on failure. */
  sync: () => Promise<GithubSyncSuccess>;
  /** True while a sync is in flight. */
  syncing: boolean;
};

/**
 * Triggers the backend's GitHub contributions sync. Tracks only the in-flight
 * flag — callers handle results/errors via the returned promise. The hook
 * itself never toasts; leave UI side-effects to the caller.
 */
export function useGithubSync(): UseGithubSyncResult {
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      return await githubSyncRepository.syncMe();
    } finally {
      setSyncing(false);
    }
  }, []);

  return { sync, syncing };
}
