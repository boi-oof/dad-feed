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

-- Storage bucket for photos (public read, no public write policy needed
-- since uploads go through the server with the service role key).
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');
