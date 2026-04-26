/**
 * Hints for Supabase Explore issues (storage, RLS). See docs/EXPLORE_SETUP.md.
 */

const SETUP_DOC = "See docs/EXPLORE_SETUP.md";

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return err instanceof Error ? err.message : String(err);
}

/** Postgres / PostgREST-style code when present on Supabase errors */
function errorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err && typeof (err as { code: unknown }).code === "string") {
    return (err as { code: string }).code;
  }
  return undefined;
}

/** Dev-only structured log with fix hints (console). */
export function logExploreDevError(context: string, err: unknown): void {
  if (!import.meta.env.DEV) return;
  const message = errorMessage(err);
  const code = errorCode(err);
  const hint = hintForMessage(message, code);
  console.error(`[Explore:dev] ${context}`, { message, code, hint, doc: SETUP_DOC });
}

function hintForMessage(message: string, code?: string): string {
  const m = message.toLowerCase();
  if (m.includes("bucket not found")) {
    return `Create a public Storage bucket named exactly "feed-images" in this Supabase project. ${SETUP_DOC}`;
  }
  if (m.includes("row-level security") || m.includes("rls") || m.includes("violates row-level") || code === "42501") {
    return `RLS blocked this operation. Check policies on the table or storage.objects. ${SETUP_DOC}`;
  }
  if (m.includes("jwt") || m.includes("permission denied") || code === "PGRST301") {
    return `Auth or permission issue. Confirm anon/authenticated policies. ${SETUP_DOC}`;
  }
  if (m.includes("relation") && m.includes("does not exist")) {
    return `Table or view missing — run supabase/migration.sql (or create the missing object). ${SETUP_DOC}`;
  }
  return `Inspect Network tab for the failing REST request body. ${SETUP_DOC}`;
}

/**
 * User-facing sentence for known failures (composer, likes, comments).
 * Returns null if we only have a generic message.
 */
export function getExploreActionableMessage(err: unknown): string | null {
  const message = errorMessage(err);
  const m = message.toLowerCase();
  if (m.includes("bucket not found")) {
    return 'Storage bucket "feed-images" is missing. Create a public bucket with that exact name in Supabase (see docs/EXPLORE_SETUP.md).';
  }
  if (m.includes("row-level security") || m.includes("violates row-level")) {
    return `Upload or write was blocked by Row Level Security. Check Storage policies for feed-images and table policies. ${SETUP_DOC}`;
  }
  return null;
}

/** When posts exist but the follow-up profiles query returned zero rows with no error — typical anon RLS on profiles. */
export function warnExploreProfilesMissingForAuthors(postCount: number, authorIdCount: number, profileRowCount: number): void {
  if (!import.meta.env.DEV) return;
  if (postCount === 0 || authorIdCount === 0) return;
  if (profileRowCount > 0) return;
  console.warn(
    "[Explore:dev] Loaded posts but no profile rows for authors. Logged-out users likely cannot SELECT public.profiles (RLS). " +
      SETUP_DOC,
  );
}

