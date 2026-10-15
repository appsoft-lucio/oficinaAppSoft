create function public.editar_ordem(
  p_ordem_id uuid, p_titulo text, p_descricao text, p_status text,
  p_valor_servico numeric, p_pecas jsonb, p_mecanico_ids uuid[],
  p_mecanico_divisao jsonb, p_comissao_percentual integer
) returns public.ordens_servico
language plpgsql set search_path = public as $$
declare
  v public.ordens_servico;
  total numeric(10,2);
begin
  select * into v from public.ordens_servico where id = p_ordem_id for update;
  if not found or not exists (select 1 from public.oficinas o
    where o.id = v.oficina_id and o.dono_id = auth.uid() and o.status = 'ativo'
      and (o.trial_ends_at is null or o.trial_ends_at > now())) then
    raise exception using errcode = '42501', message = 'Ordem indisponível para esta conta';
  end if;
  if coalesce(trim(p_titulo), '') = '' then raise exception 'Informe o serviço'; end if;
  if p_status is null or p_status not in ('aberta', 'em_andamento', 'aguardando_peca', 'concluida', 'cancelada') then
    raise exception 'Status inválido'; end if;
  if p_valor_servico is null or p_valor_servico < 0 or p_valor_servico::text in ('NaN', 'Infinity', '-Infinity') then
    raise exception 'Valor de mão de obra inválido'; end if;
  if p_pecas is null or jsonb_typeof(p_pecas) <> 'array' then raise exception 'Lista de peças inválida'; end if;
  if exists (select 1 from jsonb_to_recordset(p_pecas) as p(descricao text, quantidade numeric, valor_unitario numeric)
    where coalesce(trim(p.descricao), '') = '' or p.quantidade is null or round(p.quantidade, 2) <= 0
      or p.valor_unitario is null or p.valor_unitario < 0
      or p.quantidade::text in ('NaN', 'Infinity', '-Infinity')
      or p.valor_unitario::text in ('NaN', 'Infinity', '-Infinity')) then
    raise exception 'Informe peças com descrição, quantidade positiva e valor válido'; end if;
  delete from public.ordem_pecas where ordem_id = v.id;
  insert into public.ordem_pecas (oficina_id, ordem_id, descricao, quantidade, valor_unitario)
    select v.oficina_id, v.id, trim(p.descricao), p.quantidade, p.valor_unitario
    from jsonb_to_recordset(p_pecas) as p(descricao text, quantidade numeric, valor_unitario numeric);
  select round(p_valor_servico, 2) + coalesce(sum(quantidade * valor_unitario), 0)
    into total from public.ordem_pecas where ordem_id = v.id;
  if total < v.valor_pago then
    raise exception 'O novo total é menor que o valor já recebido. Ajuste o recebimento no financeiro antes de editar os valores.';
  end if;
  update public.ordens_servico set
    titulo = trim(p_titulo), descricao = nullif(trim(p_descricao), ''), status = p_status,
    valor_servico = round(p_valor_servico, 2), valor = total,
    mecanico_ids = p_mecanico_ids, mecanico_divisao = p_mecanico_divisao,
    comissao_percentual = p_comissao_percentual,
    pagamento_status = case when v.valor_pago > 0 then case when v.valor_pago >= total then 'pago' else 'parcial' end
      when total = 0 and v.pagamento_status = 'pago' then 'pago' else 'em_aberto' end
    where id = v.id returning * into v;
  return v;
end;
$$;
revoke all on function public.editar_ordem(uuid, text, text, text, numeric, jsonb, uuid[], jsonb, integer) from public;
grant execute on function public.editar_ordem(uuid, text, text, text, numeric, jsonb, uuid[], jsonb, integer) to authenticated;
