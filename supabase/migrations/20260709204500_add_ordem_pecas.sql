alter table public.ordens_servico
add column if not exists valor_servico numeric(10,2) not null default 0;

update public.ordens_servico
set valor_servico = valor
where valor_servico = 0;

create table if not exists public.ordem_pecas (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  ordem_id uuid not null references public.ordens_servico(id) on delete cascade,
  descricao text not null,
  quantidade numeric(10,2) not null default 1,
  valor_unitario numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ordem_pecas enable row level security;

create policy "usuarios gerenciam pecas da propria oficina"
on public.ordem_pecas
for all
to authenticated
using (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = ordem_pecas.oficina_id
      and oficinas.dono_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = ordem_pecas.oficina_id
      and oficinas.dono_id = auth.uid()
  )
);
