import { supabase } from "../lib/supabase";
import type { ExternalAccountProvider } from "../strategies/auth";

export type OAuthTokenUpsert = {
  profileId: string;
  provider: ExternalAccountProvider;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
  scopes?: string | null;
};

export const oauthTokenRepository = {
  async upsert(input: OAuthTokenUpsert): Promise<void> {
    const { error } = await supabase
      .from("oauth_provider_tokens")
      .upsert(
        {
          profile_id: input.profileId,
          provider: input.provider,
          access_token: input.accessToken,
          refresh_token: input.refreshToken ?? null,
          expires_at: input.expiresAt ?? null,
          scopes: input.scopes ?? null,
        },
        { onConflict: "profile_id,provider" },
      );

    if (error) throw error;
  },
};
