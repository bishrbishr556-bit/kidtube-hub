-- Create channels table
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel_url text not null,
  youtube_channel_id text,
  thumbnail_url text,
  description text,
  created_at timestamp with time zone not null default now()
);

-- Add channel_id foreign key to videos
alter table public.videos
  add column if not exists channel_id uuid references public.channels(id) on delete set null;

-- RLS for channels
alter table public.channels enable row level security;

grant select on public.channels to anon, authenticated;
grant insert, update, delete on public.channels to authenticated;
grant all on public.channels to service_role;

create policy "Public can view channels"
  on public.channels for select using (true);

create policy "Admins add channels"
  on public.channels for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins edit channels"
  on public.channels for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete channels"
  on public.channels for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
