import { GitHubAuthStrategy } from "./GitHubAuthStrategy";
import { LinkedInAuthStrategy } from "./LinkedInAuthStrategy";
import type { AuthProviderStrategy } from "./AuthProviderStrategy";

export { GitHubAuthStrategy, LinkedInAuthStrategy };
export type {
  AuthProviderStrategy,
  OAuthIdentity,
  ExternalAccountProvider,
  SupabaseOAuthProvider,
} from "./AuthProviderStrategy";

export const authProviderStrategies: ReadonlyArray<AuthProviderStrategy> = [
  GitHubAuthStrategy,
  LinkedInAuthStrategy,
];

export function findStrategyBySupabaseProvider(
  provider: string | null | undefined,
): AuthProviderStrategy | undefined {
  if (!provider) return undefined;
  return authProviderStrategies.find((s) => s.supabaseProvider === provider);
}
