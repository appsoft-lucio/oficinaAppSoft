create table public.mecanico_servicos (
  mecanico_id uuid not null references public.mecanicos(id) on delete cascade,
  ordem_id uuid not null references public.ordens_servico(id) on delete cascade,
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  vinculado boolean not null default true,
  vinculado_em timestamptz,
  desvinculado_em timestamptz,
  atualizado_em timestamptz not null default clock_timestamp(),
  autor jsonb,
  titulo text,
  descricao text,
  status text,
  cliente_nome text,
  veiculo_id uuid,
  veiculo_nome text,
  placa text,
  entrada_em timestamptz,
  ordem_created_at timestamptz not null,
  valor_servico numeric,
  comissao_percentual integer,
  mecanico_ids uuid[],
  mecanico_divisao jsonb,
  primary key (mecanico_id,ordem_id)
);
create index on public.mecanico_servicos(oficina_id,mecanico_id,ordem_created_at desc);
alter table public.mecanico_servicos enable row level security;
revoke all on public.mecanico_servicos from anon,authenticated;
grant select on public.mecanico_servicos to authenticated;
grant all on public.mecanico_servicos to service_role;
create policy "equipe consulta servicos do mecanico" on public.mecanico_servicos for select to authenticated
using (public.acessa_oficina(oficina_id));

-- Snapshot current assignments; the date of the original assignment is unknown.
insert into public.mecanico_servicos
  (mecanico_id,ordem_id,oficina_id,titulo,descricao,status,cliente_nome,veiculo_id,veiculo_nome,placa,
   entrada_em,ordem_created_at,valor_servico,comissao_percentual,mecanico_ids,mecanico_divisao)
select m.id,o.id,o.oficina_id,o.titulo,o.descricao,o.status,c.nome,v.id,
  concat_ws(' ',v.marca,v.modelo),v.placa,o.entrada_em,o.created_at,o.valor_servico,o.comissao_percentual,o.mecanico_ids,o.mecanico_divisao
from public.ordens_servico o join public.mecanicos m on m.id=any(o.mecanico_ids) and m.oficina_id=o.oficina_id
left join public.clientes c on c.id=o.cliente_id left join public.veiculos v on v.id=o.veiculo_id;

-- Recover known former assignments from the existing OS timeline without inventing service snapshots.
insert into public.mecanico_servicos(mecanico_id,ordem_id,oficina_id,vinculado,desvinculado_em,ordem_created_at)
select distinct on (m.id,e.ordem_id) m.id,e.ordem_id,e.oficina_id,false,e.created_at,o.created_at
from public.ordem_eventos e
cross join lateral jsonb_array_elements_text(coalesce(e.alteracoes->'mecanico_ids'->'antes','[]')) a(id)
join public.mecanicos m on m.id::text=a.id and m.oficina_id=e.oficina_id
join public.ordens_servico o on o.id=e.ordem_id
where not coalesce(e.alteracoes->'mecanico_ids'->'depois','[]') @> jsonb_build_array(a.id)
order by m.id,e.ordem_id,e.id desc
on conflict do nothing;

create function public.atualizar_servicos_mecanico() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r public.ordens_servico; ids uuid[]; m uuid; current_assignment boolean;
begin
  if tg_op='UPDATE' then
    if (to_jsonb(new)-array['criado_por','alterado_por','alterado_em','pagamento_status','valor_pago','nota_status','nota_numero','nota_emitida_em'])
      is not distinct from (to_jsonb(old)-array['criado_por','alterado_por','alterado_em','pagamento_status','valor_pago','nota_status','nota_numero','nota_emitida_em']) then return null; end if;
    ids:=array(select distinct unnest(new.mecanico_ids || old.mecanico_ids));
  else ids:=new.mecanico_ids;
  end if;
  foreach m in array ids loop
    if not exists(select 1 from public.mecanicos where id=m and oficina_id=new.oficina_id) then continue; end if;
    current_assignment:=m=any(new.mecanico_ids);
    if current_assignment then r:=new; else r:=old; end if;
    insert into public.mecanico_servicos as s
      (mecanico_id,ordem_id,oficina_id,vinculado,vinculado_em,desvinculado_em,autor,titulo,descricao,status,
       cliente_nome,veiculo_id,veiculo_nome,placa,entrada_em,ordem_created_at,valor_servico,comissao_percentual,mecanico_ids,mecanico_divisao)
    select m,r.id,r.oficina_id,current_assignment,case when current_assignment then clock_timestamp() else null end,
      case when current_assignment then null else clock_timestamp() end,public.autor_oficina(r.oficina_id),r.titulo,r.descricao,r.status,
      c.nome,v.id,concat_ws(' ',v.marca,v.modelo),v.placa,r.entrada_em,r.created_at,r.valor_servico,r.comissao_percentual,r.mecanico_ids,r.mecanico_divisao
    from (select 1) x left join public.clientes c on c.id=r.cliente_id left join public.veiculos v on v.id=r.veiculo_id
    on conflict (mecanico_id,ordem_id) do update set
      vinculado=excluded.vinculado,desvinculado_em=excluded.desvinculado_em,atualizado_em=clock_timestamp(),
      autor=excluded.autor,titulo=excluded.titulo,descricao=excluded.descricao,status=excluded.status,
      cliente_nome=coalesce(excluded.cliente_nome,s.cliente_nome),veiculo_id=coalesce(excluded.veiculo_id,s.veiculo_id),
      veiculo_nome=coalesce(nullif(excluded.veiculo_nome,''),s.veiculo_nome),placa=coalesce(excluded.placa,s.placa),
      entrada_em=excluded.entrada_em,valor_servico=excluded.valor_servico,comissao_percentual=excluded.comissao_percentual,
      mecanico_ids=excluded.mecanico_ids,mecanico_divisao=excluded.mecanico_divisao;
  end loop;
  return null;
end;
$$;
revoke all on function public.atualizar_servicos_mecanico() from public;
create trigger atualizar_servicos_mecanico after insert or update on public.ordens_servico
for each row execute function public.atualizar_servicos_mecanico();
