-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Row Level Security: anyone can read the feed, nobody can write directly.
-- Writes only happen via the server's service-role key (in the /api/posts route).
alter table posts enable row level security;

create policy "Public can read posts"
  on posts for select
  using (true);

-- Storage bucket for photos (public read, 25MB per file — plenty for
-- full-size phone photos). Uploads go through a signed URL your server
-- issues after checking Dad is logged in, so no public write policy
-- is needed.
insert into storage.buckets (id, name, public, file_size_limit)
values ('photos', 'photos', true, 26214400)
on conflict (id) do update set file_size_limit = 26214400;

create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');
