create table if not exists public.mc_study_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  banks jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mc_study_data enable row level security;

drop policy if exists "Users can read own MC study data" on public.mc_study_data;
create policy "Users can read own MC study data"
on public.mc_study_data for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own MC study data" on public.mc_study_data;
create policy "Users can insert own MC study data"
on public.mc_study_data for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own MC study data" on public.mc_study_data;
create policy "Users can update own MC study data"
on public.mc_study_data for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.mc_study_data to authenticated;
