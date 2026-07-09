alter table public.oficinas enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.ordens_servico enable row level security;

create policy "usuarios gerenciam suas oficinas"
on public.oficinas
for all
to authenticated
using (dono_id = auth.uid())
with check (dono_id = auth.uid());

create policy "usuarios gerenciam clientes da propria oficina"
on public.clientes
for all
to authenticated
using (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = clientes.oficina_id
      and oficinas.dono_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = clientes.oficina_id
      and oficinas.dono_id = auth.uid()
  )
);

create policy "usuarios gerenciam veiculos da propria oficina"
on public.veiculos
for all
to authenticated
using (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = veiculos.oficina_id
      and oficinas.dono_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = veiculos.oficina_id
      and oficinas.dono_id = auth.uid()
  )
);

create policy "usuarios gerenciam ordens da propria oficina"
on public.ordens_servico
for all
to authenticated
using (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = ordens_servico.oficina_id
      and oficinas.dono_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.oficinas
    where oficinas.id = ordens_servico.oficina_id
      and oficinas.dono_id = auth.uid()
  )
);
