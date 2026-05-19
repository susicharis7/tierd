import { supabase } from "../lib/supabase";
import type { ExternalAccountProvider, OAuthIdentity } from "../strategies/auth";

export type ExternalAccountRow = {
  profile_id: string;
  provider: ExternalAccountProvider;
  account_handle: string | null;
  account_url: string | null;
  external_user_id: string | null;
  is_primary: boolean;
  is_verified: boolean;
  verified_at: string | null;
  last_synced_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export const externalAccountRepository = {
  async upsertFromOAuth(profileId: string, identity: OAuthIdentity): Promise<void> {
    const { error } = await supabase
      .from("profile_external_accounts")
      .upsert(
        {
          profile_id: profileId,
          provider: identity.provider,
          account_handle: identity.accountHandle,
          account_url: identity.accountUrl,
          external_user_id: identity.externalUserId,
          is_verified: true,
          verified_at: new Date().toISOString(),
          metadata: identity.metadata,
        },
        { onConflict: "profile_id,provider" },
      );

    if (error) throw error;
  },

  async listByProfile(profileId: string): Promise<ExternalAccountRow[]> {
    const { data, error } = await supabase
      .from("profile_external_accounts")
      .select(
        "profile_id, provider, account_handle, account_url, external_user_id, is_primary, is_verified, verified_at, last_synced_at, metadata, created_at, updated_at",
      )
      .eq("profile_id", profileId);

    if (error) throw error;
    return (data ?? []) as ExternalAccountRow[];
  },

  async removeByProvider(
    profileId: string,
    provider: ExternalAccountProvider,
  ): Promise<void> {
    const { error } = await supabase
      .from("profile_external_accounts")
      .delete()
      .eq("profile_id", profileId)
      .eq("provider", provider);

    if (error) throw error;
  },
};
