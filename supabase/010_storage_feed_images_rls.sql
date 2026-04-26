alter table storage.objects enable row level security;

drop policy if exists "Public read feed-images" on storage.objects;
create policy "Public read feed-images"
  on storage.objects for select
  using (bucket_id = 'feed-images');

drop policy if exists "Authenticated upload feed-images" on storage.objects;
create policy "Authenticated upload feed-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'feed-images');
