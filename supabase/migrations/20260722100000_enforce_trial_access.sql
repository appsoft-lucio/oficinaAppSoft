drop policy if exists "usuarios gerenciam suas oficinas" on public.oficinas;

create policy "usuarios consultam a propria oficina"
on public.oficinas
for select
to authenticated
using (dono_id = auth.uid());

create policy "usuarios iniciam oficina em avaliacao"
on public.oficinas
for insert
to authenticated
with check (
  dono_id = auth.uid()
  and status = 'ativo'
  and trial_ends_at is not null
  and trial_ends_at <= now() + interval '7 days 5 minutes'
);

drop policy if exists "usuarios gerenciam clientes da propria oficina" on public.clientes;
create policy "usuarios gerenciam clientes com acesso ativo"
on public.clientes
for all
to authenticated
using (
  exists (
    select 1 from public.oficinas
    where oficinas.id = clientes.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
)
with check (
  exists (
    select 1 from public.oficinas
    where oficinas.id = clientes.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
);

drop policy if exists "usuarios gerenciam veiculos da propria oficina" on public.veiculos;
create policy "usuarios gerenciam veiculos com acesso ativo"
on public.veiculos
for all
to authenticated
using (
  exists (
    select 1 from public.oficinas
    where oficinas.id = veiculos.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
)
with check (
  exists (
    select 1 from public.oficinas
    where oficinas.id = veiculos.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
);

drop policy if exists "usuarios gerenciam ordens da propria oficina" on public.ordens_servico;
create policy "usuarios gerenciam ordens com acesso ativo"
on public.ordens_servico
for all
to authenticated
using (
  exists (
    select 1 from public.oficinas
    where oficinas.id = ordens_servico.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
)
with check (
  exists (
    select 1 from public.oficinas
    where oficinas.id = ordens_servico.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
);

drop policy if exists "usuarios gerenciam pecas da propria oficina" on public.ordem_pecas;
create policy "usuarios gerenciam pecas com acesso ativo"
on public.ordem_pecas
for all
to authenticated
using (
  exists (
    select 1 from public.oficinas
    where oficinas.id = ordem_pecas.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
)
with check (
  exists (
    select 1 from public.oficinas
    where oficinas.id = ordem_pecas.oficina_id
      and oficinas.dono_id = auth.uid()
      and oficinas.status = 'ativo'
      and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
  )
);
