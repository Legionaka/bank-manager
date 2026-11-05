-- Bank Statement Manager schema for Supabase
-- 1) Enable Row Level Security (RLS) on all tables.
-- 2) Create a user profile row when a user signs up.

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null,
  date text not null,
  time text not null default '',
  description text not null default '',
  original_description text not null default '',
  parent_category text not null default '',
  category text not null default '',
  amount numeric not null default 0,
  fee numeric not null default 0,
  balance numeric not null default 0,
  account_last4 text not null default '',
  person_id uuid null,
  statement_name text not null default '',
  created_at timestamptz not null default now(),
  constraint fk_people foreign key (person_id) references public.people(id) on delete set null
);

create table if not exists public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  keyword text not null,
  category text null,
  person_id uuid null,
  created_at timestamptz not null default now(),
  constraint fk_rule_person foreign key (person_id) references public.people(id) on delete set null
);

alter table public.people enable row level security;
alter table public.transactions enable row level security;
alter table public.rules enable row level security;

create policy "Users can view their own people"
on public.people
for select
using (auth.uid() = user_id);

create policy "Users can insert their own people"
on public.people
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own people"
on public.people
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own people"
on public.people
for delete
using (auth.uid() = user_id);

create policy "Users can view their own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);

create policy "Users can view their own rules"
on public.rules
for select
using (auth.uid() = user_id);

create policy "Users can insert their own rules"
on public.rules
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own rules"
on public.rules
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own rules"
on public.rules
for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.people (user_id, name)
  values (new.id, 'Unsorted');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
