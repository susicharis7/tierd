drop policy if exists "Anyone can read likes" on public.post_likes;
create policy "Anyone can read likes"
  on public.post_likes for select
  using (true);

drop policy if exists "Authenticated users can like" on public.post_likes;
create policy "Authenticated users can like"
  on public.post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can unlike own likes" on public.post_likes;
create policy "Users can unlike own likes"
  on public.post_likes for delete
  to authenticated
  using (auth.uid() = user_id);
