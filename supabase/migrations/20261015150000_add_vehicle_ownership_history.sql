create table public.veiculo_proprietarios (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  cliente_anterior_id uuid references public.clientes(id) on delete set null,
  cliente_novo_id uuid references public.clientes(id) on delete set null,
  nome_anterior text,
  nome_novo text,
  tipo text not null check (tipo in ('cadastro', 'transferencia')),
  created_at timestamptz not null default now()
);
create index on public.veiculo_proprietarios (veiculo_id, created_at);
alter table public.veiculo_proprietarios enable row level security;
create policy "consultar historico da propria oficina" on public.veiculo_proprietarios
for select to authenticated using (exists (
  select 1 from public.oficinas o where o.id = oficina_id and o.dono_id = auth.uid()
    and o.status = 'ativo' and (o.trial_ends_at is null or o.trial_ends_at > now())
));

insert into public.veiculo_proprietarios
  (oficina_id, veiculo_id, cliente_novo_id, nome_novo, tipo, created_at)
select v.oficina_id, v.id, v.cliente_id, c.nome, 'cadastro', now()
from public.veiculos v left join public.clientes c on c.id = v.cliente_id;

create function public.normalizar_placa(p_placa text) returns text
language sql immutable set search_path = public as $$
  select nullif(regexp_replace(upper(coalesce(p_placa, '')), '[^A-Z0-9]', '', 'g'), '');
$$;

create function public.validar_identidade_veiculo() returns trigger
language plpgsql set search_path = public as $$
begin
  new.placa := public.normalizar_placa(new.placa);
  if new.placa is not null then
    perform pg_advisory_xact_lock(hashtextextended(new.oficina_id::text || new.placa, 0));
    if exists (select 1 from public.veiculos v where v.oficina_id = new.oficina_id
      and public.normalizar_placa(v.placa) = new.placa and v.id <> new.id) then
      raise exception using errcode = '23505', message = 'Veículo já cadastrado com esta placa. Confirme a transferência do cadastro existente.';
    end if;
  end if;
  if new.cliente_id is not null and not exists (
    select 1 from public.clientes c where c.id = new.cliente_id and c.oficina_id = new.oficina_id
  ) then raise exception 'Cliente inválido para esta oficina'; end if;
  if tg_op = 'UPDATE' and new.cliente_id is distinct from old.cliente_id
    and current_setting('app.transferencia_veiculo', true) is distinct from new.id::text then
    raise exception 'Confirme a transferência de proprietário antes de alterar o cliente';
  end if;
  return new;
end;
$$;
create trigger validar_identidade_veiculo before insert or update of placa, cliente_id, oficina_id
on public.veiculos for each row execute function public.validar_identidade_veiculo();

create function public.registrar_proprietario_veiculo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.veiculo_proprietarios (oficina_id, veiculo_id, cliente_novo_id, nome_novo, tipo)
    values (new.oficina_id, new.id, new.cliente_id, (select nome from public.clientes where id = new.cliente_id), 'cadastro');
  elsif new.cliente_id is distinct from old.cliente_id then
    insert into public.veiculo_proprietarios
      (oficina_id, veiculo_id, cliente_anterior_id, cliente_novo_id, nome_anterior, nome_novo, tipo)
    values (new.oficina_id, new.id, old.cliente_id, new.cliente_id,
      (select nome from public.clientes where id = old.cliente_id),
      (select nome from public.clientes where id = new.cliente_id), 'transferencia');
  end if;
  return new;
end;
$$;
create trigger registrar_proprietario_veiculo after insert or update of cliente_id on public.veiculos
for each row execute function public.registrar_proprietario_veiculo();

-- Serialize changes to orders against ownership transfers for the same vehicle.
create function public.bloquear_veiculo_ordem() returns trigger
language plpgsql set search_path = public as $$
declare
  proprietario uuid;
begin
  select cliente_id into proprietario from public.veiculos where id = new.veiculo_id for update;
  if new.veiculo_id is not null and (
    tg_op = 'INSERT' or new.cliente_id is distinct from old.cliente_id
    or new.veiculo_id is distinct from old.veiculo_id
  ) and new.cliente_id is distinct from proprietario then
    raise exception 'O proprietário do veículo mudou. Recarregue a página antes de abrir a ordem.';
  end if;
  return new;
end;
$$;
create trigger bloquear_veiculo_ordem before insert or update on public.ordens_servico
for each row execute function public.bloquear_veiculo_ordem();

create function public.transferir_veiculo(
  p_veiculo_id uuid, p_cliente_id uuid, p_cliente_anterior_id uuid,
  p_ordens_pendentes uuid[], p_confirmado boolean
) returns public.veiculos
language plpgsql security definer set search_path = public as $$
declare
  v public.veiculos;
  pendentes uuid[];
begin
  select * into v from public.veiculos where id = p_veiculo_id for update;
  if not found or not exists (select 1 from public.oficinas o
    where o.id = v.oficina_id and o.dono_id = auth.uid() and o.status = 'ativo'
      and (o.trial_ends_at is null or o.trial_ends_at > now())) then
    raise exception using errcode = '42501', message = 'Veículo indisponível para esta conta';
  end if;
  if p_confirmado is distinct from true then raise exception 'Confirme a transferência'; end if;
  if v.cliente_id is distinct from p_cliente_anterior_id then
    raise exception using errcode = 'P0001', message = 'O proprietário mudou. Reabra a confirmação de transferência.';
  end if;
  if p_cliente_id is null or not exists (select 1 from public.clientes
    where id = p_cliente_id and oficina_id = v.oficina_id) then raise exception 'Cliente inválido'; end if;
  select coalesce(array_agg(id order by id), '{}') into pendentes
    from public.ordens_servico where veiculo_id = v.id and status <> 'cancelada'
      and (status <> 'concluida' or pagamento_status <> 'pago');
  if pendentes is distinct from array(select distinct unnest(coalesce(p_ordens_pendentes, '{}')) order by 1) then
    raise exception 'As ordens pendentes mudaram. Reabra a confirmação de transferência.';
  end if;
  perform set_config('app.transferencia_veiculo', v.id::text, true);
  update public.veiculos set cliente_id = p_cliente_id where id = v.id returning * into v;
  perform set_config('app.transferencia_veiculo', '', true);
  return v;
end;
$$;
revoke all on function public.transferir_veiculo(uuid, uuid, uuid, uuid[], boolean) from public;
grant execute on function public.transferir_veiculo(uuid, uuid, uuid, uuid[], boolean) to authenticated;
