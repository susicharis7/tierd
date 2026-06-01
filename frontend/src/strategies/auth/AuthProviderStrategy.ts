import type { Session } from "@supabase/supabase-js";
import type { ComponentType } from "react";

export type SupabaseOAuthProvider = "github" | "linkedin_oidc";
export type ExternalAccountProvider = "github" | "linkedin";

export type OAuthIdentity = {
  provider: ExternalAccountProvider;
  accountHandle: string | null;
  accountUrl: string | null;
  externalUserId: string | null;
  metadata: Record<string, unknown>;
};

export interface AuthProviderStrategy {
  readonly id: ExternalAccountProvider;
  readonly supabaseProvider: SupabaseOAuthProvider;
  readonly label: string;
  readonly Icon: ComponentType;
  readonly scopes: string;
  extractIdentity(session: Session): OAuthIdentity | null;
}
