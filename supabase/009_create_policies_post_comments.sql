drop policy if exists "Anyone can read comments" on public.post_comments;
create policy "Anyone can read comments"
  on public.post_comments for select
  using (true);

drop policy if exists "Authenticated users can create own comments" on public.post_comments;
create policy "Authenticated users can create own comments"
  on public.post_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.post_comments;
create policy "Users can delete own comments"
  on public.post_comments for delete
  to authenticated
  using (auth.uid() = user_id);
