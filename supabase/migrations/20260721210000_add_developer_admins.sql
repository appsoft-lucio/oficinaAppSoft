create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create policy "administradores consultam o proprio acesso"
on public.app_admins
for select
to authenticated
using (user_id = auth.uid());

alter table public.oficinas
  add column status text not null default 'ativo'
  check (status in ('ativo', 'suspenso'));

comment on table public.app_admins is
  'Usuários autorizados a acessar o painel do desenvolvedor e provisionar clientes.';
