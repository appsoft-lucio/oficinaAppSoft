alter table public.ordens_servico add column entrada_em timestamptz;
-- Do not infer old arrival dates from the order creation date.
alter table public.ordens_servico alter column entrada_em set default now();
alter table public.ordens_servico add constraint ordem_status_valido
  check (status in ('aberta','em_andamento','aguardando_peca','concluida','cancelada')) not valid;

create table public.ordem_eventos (
  id bigint generated always as identity primary key,
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  ordem_id uuid not null references public.ordens_servico(id) on delete cascade,
  tipo text not null check (tipo in ('marco_inicial','criacao','alteracao')),
  status_anterior text,
  status_novo text not null,
  alteracoes jsonb not null default '{}',
  autor jsonb,
  created_at timestamptz not null default clock_timestamp()
);
create index on public.ordem_eventos (ordem_id,id desc);
alter table public.ordem_eventos enable row level security;
revoke all on public.ordem_eventos from anon,authenticated;
grant select on public.ordem_eventos to authenticated;
grant all on public.ordem_eventos to service_role;
grant all on sequence public.ordem_eventos_id_seq to service_role;
create policy "equipe consulta historico da OS" on public.ordem_eventos for select to authenticated
using (public.acessa_oficina(oficina_id));

-- Baseline: old changes and their actors cannot be reconstructed.
insert into public.ordem_eventos (oficina_id,ordem_id,tipo,status_novo)
select oficina_id,id,'marco_inicial',status from public.ordens_servico;

create function public.validar_entrada_ordem() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.entrada_em is not null and (not isfinite(new.entrada_em) or new.entrada_em > clock_timestamp() + interval '5 minutes') then
    raise exception 'Informe uma data e hora de entrada válida, até o horário atual';
  end if;
  if tg_op = 'INSERT' and new.entrada_em is null then raise exception 'Informe a data e hora de entrada do veículo'; end if;
  if tg_op = 'UPDATE' and old.entrada_em is not null and new.entrada_em is null then
    raise exception 'A data de entrada informada não pode ser apagada; corrija o horário se necessário';
  end if;
  return new;
end;
$$;
revoke all on function public.validar_entrada_ordem() from public;
create trigger validar_entrada_ordem before insert or update on public.ordens_servico
for each row execute function public.validar_entrada_ordem();

create function public.registrar_evento_ordem() returns trigger
language plpgsql security definer set search_path = '' as $$
declare changes jsonb := '{}'; previous jsonb;
begin
  if tg_op = 'UPDATE' then
    previous := to_jsonb(old);
    select coalesce(jsonb_object_agg(k.key,jsonb_build_object('antes',previous->k.key,'depois',k.value)),'{}')
      into changes from jsonb_each(to_jsonb(new)) k
      where k.key not in ('id','oficina_id','created_at','criado_por','alterado_por','alterado_em')
        and k.value is distinct from previous->k.key;
    if changes = '{}' then return null; end if;
  end if;
  insert into public.ordem_eventos (oficina_id,ordem_id,tipo,status_anterior,status_novo,alteracoes,autor)
  values (new.oficina_id,new.id,case when tg_op='INSERT' then 'criacao' else 'alteracao' end,
    case when tg_op='UPDATE' then old.status else null end,new.status,changes,public.autor_oficina(new.oficina_id));
  return null;
end;
$$;
revoke all on function public.registrar_evento_ordem() from public;
create trigger registrar_evento_ordem after insert or update on public.ordens_servico
for each row execute function public.registrar_evento_ordem();

create function public.editar_ordem_com_entrada(
  p_ordem_id uuid,p_titulo text,p_descricao text,p_status text,p_valor_servico numeric,
  p_pecas jsonb,p_mecanico_ids uuid[],p_mecanico_divisao jsonb,p_comissao_percentual integer,p_entrada_em timestamptz
) returns public.ordens_servico
language plpgsql set search_path = '' as $$
declare v public.ordens_servico;
begin
  select * into v from public.editar_ordem(p_ordem_id,p_titulo,p_descricao,p_status,p_valor_servico,
    p_pecas,p_mecanico_ids,p_mecanico_divisao,p_comissao_percentual);
  if p_entrada_em is distinct from v.entrada_em then
    update public.ordens_servico set entrada_em=p_entrada_em where id=v.id returning * into v;
  end if;
  return v;
end;
$$;
revoke all on function public.editar_ordem_com_entrada(uuid,text,text,text,numeric,jsonb,uuid[],jsonb,integer,timestamptz) from public;
grant execute on function public.editar_ordem_com_entrada(uuid,text,text,text,numeric,jsonb,uuid[],jsonb,integer,timestamptz) to authenticated;
