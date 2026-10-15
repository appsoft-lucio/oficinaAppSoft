create table public.mecanicos (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  telefone text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.mecanicos enable row level security;
create policy "usuarios gerenciam mecanicos com acesso ativo"
on public.mecanicos for all to authenticated
using (exists (
  select 1 from public.oficinas
  where oficinas.id = mecanicos.oficina_id and oficinas.dono_id = auth.uid()
    and oficinas.status = 'ativo'
    and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
))
with check (exists (
  select 1 from public.oficinas
  where oficinas.id = mecanicos.oficina_id and oficinas.dono_id = auth.uid()
    and oficinas.status = 'ativo'
    and (oficinas.trial_ends_at is null or oficinas.trial_ends_at > now())
));

alter table public.ordens_servico
  add column mecanico_ids uuid[] not null default '{}',
  add column mecanico_divisao jsonb not null default '{}' check (jsonb_typeof(mecanico_divisao) = 'object');

-- Validate all assignments in the same transaction as the order write.
create function public.validar_mecanicos_ordem() returns trigger
language plpgsql set search_path = public as $$
begin
  if (select count(*) from jsonb_object_keys(new.mecanico_divisao)) <> cardinality(new.mecanico_ids) then
    raise exception 'Informe a divisão de todos os mecânicos';
  end if;
  if cardinality(new.mecanico_ids) > 0 then
    if exists (
      select 1 from unnest(new.mecanico_ids) as selecionado(id)
      where coalesce(new.mecanico_divisao ->> selecionado.id::text, '') !~ '^[0-9]{1,3}$'
    ) then
      raise exception 'Informe percentuais inteiros de 1 a 100';
    end if;
    if exists (select 1 from jsonb_each_text(new.mecanico_divisao) where value::integer < 1 or value::integer > 100)
      or (select sum(value::integer) from jsonb_each_text(new.mecanico_divisao)) <> 100 then
      raise exception 'A divisão do repasse deve somar 100%%';
    end if;
  end if;
  if exists (
    select 1 from unnest(new.mecanico_ids) as selecionado(id)
    where selecionado.id is null or not exists (
      select 1 from public.mecanicos m
      where m.id = selecionado.id and m.oficina_id = new.oficina_id
    )
  ) or cardinality(new.mecanico_ids) <> (
    select count(distinct id) from unnest(new.mecanico_ids) as selecionado(id)
  ) then
    raise exception 'Mecânicos inválidos para esta oficina';
  end if;
  return new;
end;
$$;

create trigger validar_mecanicos_ordem
before insert or update of mecanico_ids, mecanico_divisao, oficina_id on public.ordens_servico
for each row execute function public.validar_mecanicos_ordem();
