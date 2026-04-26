# Explore page: Supabase checklist

The Explore feed uses **Storage** for post images and **`public.profiles`** for author names, search, and “New on Tierd”. If either is misconfigured, the UI may look empty or show “Anonymous Builder” while posts still load.

## 1. Storage bucket `feed-images`

The app uploads to bucket **`feed-images`** (name is exact and case-sensitive).

1. In the Supabase Dashboard: **Storage** → **New bucket**.
2. Name: **`feed-images`**
3. **Public bucket**: ON (so `getPublicUrl` works for feed images without signed URLs).

### Policies (recommended: Storage UI)

If SQL on `storage.objects` fails with *must be owner of table objects*, use the bucket **Policies** UI instead:

- **SELECT**: allow read for `anon` and `authenticated` (or “public”) for objects in `feed-images`.
- **INSERT**: allow `authenticated` only, scoped to bucket `feed-images`.

See comments at the bottom of [`migration.sql`](../supabase/migration.sql) for the intended rules.

### Verify (browser)

With DevTools → **Network**, post with an image and inspect the storage request.  
`Bucket not found` → bucket name or project URL is wrong.  
RLS violations mention **row-level security** on `storage.objects`.

### Debugging Storage RLS: check request headers (do this before adding policies)

The app uses **one** Supabase client for auth and Storage (`src/lib/supabase.ts`); uploads should include a user JWT when you are signed in.

On the **failing** upload request (URL like `.../storage/v1/object/feed-images/...`), open **Headers** → **Request headers**:

| Header | What to check |
|--------|----------------|
| **`Authorization`** | Must be `Bearer <long-jwt>`. Policies scoped to **`authenticated`** require this. If **`Authorization` is missing**, Storage evaluates the role as **`anon`** and an authenticated-only INSERT policy will not match → RLS-style errors. |
| **`apikey`** | Present on normal `supabase-js` calls; should match your project’s anon / publishable key. |

**Response:** Status **400** with a body mentioning **row-level security** on **`storage.objects`** means the request reached Storage but **`WITH CHECK`** on `INSERT` failed (wrong role, wrong bucket, or path/policy mismatch).

| What you see | Likely cause |
|--------------|----------------|
| **`Authorization` missing** | No session in the JS client at upload time (signed out, expired session, cleared site data, or rare timing). Not a “second client” issue in this repo. |
| **`Authorization` present**, still RLS | Policy expression, `bucket_id`, or path rules (e.g. first folder must equal `auth.uid()`). |

**React `session` vs HTTP:** [`AuthProvider`](../frontend/src/features/authFeatures/AuthProvider.tsx) may skip updating React state on `TOKEN_REFRESHED` / `USER_UPDATED`, but **`supabase-js` still refreshes the internal session** used for requests. Trust the **Network** tab on the upload, not only React DevTools.

**If Bearer is missing but the UI still looks logged in**

- **Same project:** `VITE_SUPABASE_URL` and key in the `.env` file Vite loads (see root `vite.config.ts` `envDir`) must match the Supabase project where the bucket and policies live.
- **Session persistence:** Application → Local Storage (or session storage) for Supabase auth keys; extensions or privacy settings can block them.
- **Timing:** Unlikely if you post after the page has settled; in **development**, the client logs `[Explore:dev] uploadFeedImage` session state right before upload (see below).

### Session present but upload still fails: `new row violates row-level security policy`

If the console shows **`client session present: true`** (and usually `userIdParamMatchesSession: true`) but you still get **`StorageApiError: new row violates row-level security policy`**, the request **is authenticated**. The problem is **not** a missing `Authorization` header — it is **`storage.objects` INSERT** RLS: no policy allows the new row, or every applicable **`WITH CHECK`** fails.

**1. Inspect what Postgres has today** (SQL Editor, as project owner):

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
```

Look for at least one policy with **`cmd` = `INSERT`** (or `ALL`) whose **`roles`** include **`authenticated`** (or **`public`** if you intentionally allow that). If there is **no** INSERT policy, inserts are denied.

**2. Fix via Dashboard (recommended if SQL on `storage.objects` errors)**

1. **Storage** → bucket **`feed-images`** → **Policies** (or **Configuration** → **Policies** for that bucket).
2. Add policy: operation **INSERT** (upload), target **authenticated** users.
3. **Policy definition** should allow uploads into this bucket. A minimal rule that matches this app is: only objects in bucket `feed-images` (the UI often sets this for you when the policy is scoped to the bucket).

**3. Fix via SQL** (if the editor accepts it): run [`storage_feed_images_rls.sql`](../supabase/storage_feed_images_rls.sql). That creates:

- **SELECT** `using (bucket_id = 'feed-images')` — public read of objects in this bucket.
- **INSERT** `to authenticated` `with check (bucket_id = 'feed-images')` — any signed-in user can upload into this bucket (same as the tail of [`migration.sql`](../supabase/migration.sql)).

**4. If you added a stricter rule** (e.g. first path segment must equal `auth.uid()`), it must match the app path `{auth_user_uuid}/{timestamp}.{ext}`. If it still fails, temporarily replace it with the **minimal** `bucket_id = 'feed-images'` INSERT policy above to confirm; then re-tighten.

**5. Conflicting or duplicate policies** — Rare, but remove obsolete **INSERT** policies that are too narrow so a permissive one can apply (Postgres combines multiple permissive policies with **OR** for the same command).

---

## 2. `profiles` RLS (anonymous read for Explore)

Logged-out users use the **anon** key. They must be allowed to **`SELECT`** rows from `public.profiles` used for discovery (the app only reads `id`, `username`, `full_name`, `avatar_url`, `created_at`).

### Inspect existing policies (SQL Editor)

Run as a project owner (bypasses RLS):

```sql
select schemaname, tablename, policyname, roles, cmd, qual
from pg_policies
where tablename = 'profiles'
order by policyname;
```

You should see at least one **`SELECT`** policy whose **`roles`** include **`anon`** or **`public`**.  
If every `SELECT` policy is restricted to `authenticated` or `auth.uid() = id` only, Explore will show **no builders**, broken **search**, and **Anonymous Builder** on posts while post bodies still load.

### Fix

Apply section **0** in [`migration.sql`](../supabase/migration.sql) (“Profiles are publicly readable”), or add an equivalent policy in the SQL Editor.

### Verify (browser)

While **logged out**, reload Explore and find `/rest/v1/profiles` in the Network tab:

- **200** with a JSON array of profiles → OK.
- **401 / 403** or error body → policy still blocks anon.
- **200** with `[]` and you know users exist in Table Editor → often still RLS filtering all rows; re-check policies.

---

## 3. Same Supabase project as the app

Confirm `.env` has **`VITE_SUPABASE_URL`** (and publishable/anon key) for the **same** project where the bucket and policies were created.

---

## 4. Local dev: clearer errors

In development, the client logs extra hints when Supabase returns known errors (see `frontend/src/features/exploreFeatures/exploreErrors.ts`). Composer failures also show short actionable copy when the bucket is missing or RLS blocks an operation.

Immediately **before** each feed image upload, **`uploadFeedImage`** logs whether the shared Supabase client has a session and whether the param `userId` matches `session.user.id` — use this together with the Network headers check above.

