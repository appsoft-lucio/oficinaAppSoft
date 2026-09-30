create table public.login_usernames (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$')
);
alter table public.login_usernames enable row level security;
revoke all on public.login_usernames from anon, authenticated;
grant select on public.login_usernames to service_role;

create function public.sync_login_username() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  requested text := lower(trim(new.raw_user_meta_data ->> 'username'));
begin
  if requested is not null and requested <> '' then
    insert into public.login_usernames (user_id, username)
    values (new.id, requested)
    on conflict (user_id) do update set username = excluded.username;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_login_username() from public;
create trigger sync_login_username
after insert or update of raw_user_meta_data on auth.users
for each row execute function public.sync_login_username();

create table public.username_login_attempts (
  username text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.username_login_attempts enable row level security;
revoke all on public.username_login_attempts from anon, authenticated;

create function public.allow_username_login(login_name text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare count_attempts integer;
begin
  delete from public.username_login_attempts where window_start < now() - interval '1 hour';
  insert into public.username_login_attempts as a (username, window_start, attempts)
  values (login_name, now(), 1)
  on conflict (username) do update set
    attempts = case when a.window_start < now() - interval '1 minute' then 1 else a.attempts + 1 end,
    window_start = case when a.window_start < now() - interval '1 minute' then now() else a.window_start end
  returning attempts into count_attempts;
  return count_attempts <= 10;
end;
$$;
revoke all on function public.allow_username_login(text) from public, anon, authenticated;
grant execute on function public.allow_username_login(text) to service_role;
