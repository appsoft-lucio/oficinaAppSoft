create table public.lancamentos_financeiros (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  tipo text not null check (tipo in ('receita','despesa')),
  categoria text not null,
  descricao text not null check (length(trim(descricao)) between 1 and 300),
  valor numeric(12,2) not null check (valor > 0 and valor::text not in ('NaN','Infinity','-Infinity')),
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  origem text not null default 'manual' check (origem in ('manual','ordem')),
  ordem_id uuid references public.ordens_servico(id) deferrable initially deferred,
  mecanico_id uuid references public.mecanicos(id) deferrable initially deferred,
  cancelado boolean not null default false,
  data_estimada boolean not null default false,
  criado_por jsonb, alterado_por jsonb, alterado_em timestamptz,
  created_at timestamptz not null default now(),
  check ((origem = 'ordem' and ordem_id is not null and not cancelado and
      ((tipo = 'receita' and categoria = 'recebimento_ordem') or (tipo = 'despesa' and categoria = 'estorno_recebimento')))
    or (origem = 'manual' and ordem_id is null and not data_estimada and
      ((tipo = 'receita' and categoria = 'outras_receitas' and mecanico_id is null) or
       (tipo = 'despesa' and categoria in ('repasse_mecanico','pecas','aluguel','contas','impostos','outras_despesas'))))),
  check ((categoria = 'repasse_mecanico' and mecanico_id is not null) or (categoria <> 'repasse_mecanico' and mecanico_id is null))
);
create index on public.lancamentos_financeiros (oficina_id, data desc, id);
alter table public.lancamentos_financeiros enable row level security;
revoke all on public.lancamentos_financeiros from anon, authenticated;
grant select, insert, update on public.lancamentos_financeiros to authenticated;
grant all on public.lancamentos_financeiros to service_role;
create policy "equipe consulta caixa" on public.lancamentos_financeiros for select to authenticated
using (public.acessa_oficina(oficina_id));
create policy "equipe lanca caixa" on public.lancamentos_financeiros for insert to authenticated
with check (public.acessa_oficina(oficina_id) and origem = 'manual');
create policy "equipe corrige lancamentos manuais" on public.lancamentos_financeiros for update to authenticated
using (public.acessa_oficina(oficina_id) and origem = 'manual')
with check (public.acessa_oficina(oficina_id) and origem = 'manual');

create function public.recebido_ordem(p_status text, p_total numeric, p_pago numeric) returns numeric
language sql immutable set search_path = '' as $$
  select case when p_status = 'pago' then greatest(p_total, 0)
    when p_status = 'parcial' then greatest(least(p_pago, p_total), 0) else 0 end;
$$;
revoke all on function public.recebido_ordem(text,numeric,numeric) from public;

-- Preserve existing receipts without inventing a payment date: explicitly mark estimates.
insert into public.lancamentos_financeiros
  (oficina_id,tipo,categoria,descricao,valor,data,origem,ordem_id,data_estimada,criado_por,alterado_por)
select oficina_id, 'receita', 'recebimento_ordem', 'Recebimento anterior: ' || left(titulo, 270),
  public.recebido_ordem(pagamento_status,valor,valor_pago),
  (created_at at time zone 'America/Sao_Paulo')::date, 'ordem', id, true, criado_por, alterado_por
from public.ordens_servico where public.recebido_ordem(pagamento_status,valor,valor_pago) > 0;

create function public.validar_lancamento() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.origem = 'manual' and new.data > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Registre somente receitas recebidas e despesas pagas, com data até hoje';
  end if;
  if tg_op = 'UPDATE' and (new.id is distinct from old.id or new.origem is distinct from old.origem) then
    raise exception 'Identidade do lançamento não pode ser alterada';
  end if;
  if new.mecanico_id is not null and not exists (select 1 from public.mecanicos m
    where m.id = new.mecanico_id and m.oficina_id = new.oficina_id) then
    raise exception 'Mecânico inválido para esta oficina';
  end if;
  return new;
end;
$$;
revoke all on function public.validar_lancamento() from public;
create trigger validar_lancamento before insert or update on public.lancamentos_financeiros
for each row execute function public.validar_lancamento();
create trigger preencher_autoria before insert or update on public.lancamentos_financeiros
for each row execute function public.preencher_autoria();
create trigger registrar_atividade after insert or update on public.lancamentos_financeiros
for each row execute function public.registrar_atividade();

create function public.registrar_recebimento_ordem() returns trigger
language plpgsql security definer set search_path = '' as $$
declare anterior numeric := 0; diferenca numeric;
begin
  if tg_op = 'UPDATE' then anterior := public.recebido_ordem(old.pagamento_status,old.valor,old.valor_pago); end if;
  diferenca := public.recebido_ordem(new.pagamento_status,new.valor,new.valor_pago) - anterior;
  if diferenca <> 0 then
    insert into public.lancamentos_financeiros (oficina_id,tipo,categoria,descricao,valor,origem,ordem_id)
    values (new.oficina_id, case when diferenca > 0 then 'receita' else 'despesa' end,
      case when diferenca > 0 then 'recebimento_ordem' else 'estorno_recebimento' end,
      case when diferenca > 0 then 'Recebimento: ' else 'Estorno de recebimento: ' end || left(new.titulo, 270),
      abs(diferenca), 'ordem', new.id);
  end if;
  return null;
end;
$$;
revoke all on function public.registrar_recebimento_ordem() from public;
create trigger registrar_recebimento_ordem after insert or update of pagamento_status,valor_pago,valor on public.ordens_servico
for each row execute function public.registrar_recebimento_ordem();
