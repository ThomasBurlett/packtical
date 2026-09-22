create table if not exists public.checklist_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_slug text not null,
  state jsonb not null default '{"checkedIds":[],"collapsedSections":[],"customItems":{}}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, checklist_slug)
);

alter table public.checklist_progress enable row level security;

create policy "Users can read their own checklist progress"
  on public.checklist_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own checklist progress"
  on public.checklist_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own checklist progress"
  on public.checklist_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own checklist progress"
  on public.checklist_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
