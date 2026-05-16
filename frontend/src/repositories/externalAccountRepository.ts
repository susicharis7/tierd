import { supabase } from "../lib/supabase";
import type { OAuthIdentity } from "../strategies/auth";

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
};
