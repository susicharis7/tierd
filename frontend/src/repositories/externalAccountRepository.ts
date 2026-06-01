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
    // Manual upsert: the table's unique index on (profile_id, provider) is partial
    // (WHERE provider IN ('github','linkedin',...)), which PostgREST can't infer
    // for ON CONFLICT. We do SELECT-then-INSERT-or-UPDATE; if a concurrent caller
    // wins the race between our SELECT and INSERT, the 23505 fallback below turns
    // it into an UPDATE so the operation stays effectively idempotent.
    //
    // The race is real here because AuthProvider triggers this on SIGNED_IN,
    // USER_UPDATED, and INITIAL_SESSION — all three commonly fire back-to-back
    // right after an OAuth redirect.
    const payload = {
      profile_id: profileId,
      provider: identity.provider,
      account_handle: identity.accountHandle,
      account_url: identity.accountUrl,
      external_user_id: identity.externalUserId,
      is_verified: true,
      verified_at: new Date().toISOString(),
      metadata: identity.metadata,
    };

    const { data: existing, error: selectError } = await supabase
      .from("profile_external_accounts")
      .select("id")
      .eq("profile_id", profileId)
      .eq("provider", identity.provider)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      const { error } = await supabase
        .from("profile_external_accounts")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
      return;
    }

    const { error: insertError } = await supabase
      .from("profile_external_accounts")
      .insert(payload);
    if (!insertError) return;

    // 23505 = unique_violation. A concurrent call inserted the row between our
    // SELECT and INSERT — retry as UPDATE so the second caller still writes
    // whatever fresh metadata it had.
    if (insertError.code !== "23505") throw insertError;
    const { error: updateError } = await supabase
      .from("profile_external_accounts")
      .update(payload)
      .eq("profile_id", profileId)
      .eq("provider", identity.provider);
    if (updateError) throw updateError;
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
