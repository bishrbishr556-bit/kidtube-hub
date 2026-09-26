create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

alter table public.videos add column if not exists description text;

drop policy if exists "Anyone can add videos" on public.videos;
drop policy if exists "Anyone can edit videos" on public.videos;
drop policy if exists "Anyone can remove videos" on public.videos;
drop policy if exists "Anyone can view videos" on public.videos;
grant select on public.videos to anon, authenticated;
grant insert, update, delete on public.videos to authenticated;
grant all on public.videos to service_role;
create policy "Public sees published videos" on public.videos for select using (published = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins add videos" on public.videos for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins edit videos" on public.videos for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins remove videos" on public.videos for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='storage' and tablename='objects' loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;
create policy "Anyone reads video files" on storage.objects for select using (bucket_id = 'videos');
create policy "Admins upload video files" on storage.objects for insert to authenticated with check (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update video files" on storage.objects for update to authenticated using (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete video files" on storage.objects for delete to authenticated using (bucket_id = 'videos' and public.has_role(auth.uid(), 'admin'));