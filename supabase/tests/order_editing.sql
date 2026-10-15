begin;
do $$
declare
  usuario uuid;
  oficina uuid := gen_random_uuid();
  cliente uuid := gen_random_uuid();
  novo_cliente uuid := gen_random_uuid();
  mecanico uuid := gen_random_uuid();
  veiculo uuid := gen_random_uuid();
  ordem uuid := gen_random_uuid();
  resultado public.ordens_servico;
  rejeitado boolean;
begin
  select id into usuario from auth.users limit 1;
  if usuario is null then raise exception 'This test requires an auth user'; end if;
  perform set_config('request.jwt.claim.sub', usuario::text, true);
  insert into public.oficinas (id, dono_id, nome, status) values (oficina, usuario, 'Teste de edição', 'ativo');
  insert into public.clientes (id, oficina_id, nome) values (cliente, oficina, 'Cliente original');
  insert into public.clientes (id, oficina_id, nome) values (novo_cliente, oficina, 'Novo proprietário');
  insert into public.mecanicos (id, oficina_id, nome) values (mecanico, oficina, 'Mecânico original');
  insert into public.veiculos (id, oficina_id, cliente_id, placa, modelo, quilometragem)
    values (veiculo, oficina, cliente, 'EDT1234', 'Modelo original', 50000);
  insert into public.ordens_servico
    (id, oficina_id, cliente_id, veiculo_id, titulo, valor, valor_servico, valor_pago, pagamento_status, comissao_percentual)
    values (ordem, oficina, cliente, veiculo, 'Serviço original', 200, 150, 100, 'parcial', 50);
  insert into public.ordem_pecas (oficina_id, ordem_id, descricao, quantidade, valor_unitario)
    values (oficina, ordem, 'Peça original', 1, 50);
  execute 'set local role authenticated';
  update public.clientes set nome = 'Cliente editado', telefone = '31999999999' where id = cliente;
  update public.mecanicos set nome = 'Mecânico editado', email = 'mecanico@example.com' where id = mecanico;
  update public.veiculos set modelo = 'Modelo editado', quilometragem = 60000 where id = veiculo;
  if not exists (select 1 from public.veiculos where id = veiculo and cliente_id = cliente and modelo = 'Modelo editado') then
    raise exception 'FAIL: editing vehicle changed its owner or failed'; end if;
  perform public.transferir_veiculo(veiculo, novo_cliente, cliente, array[ordem], true);
  select * into resultado from public.editar_ordem(ordem, 'Serviço editado', 'Descrição editada', 'em_andamento',
    200, '[{"descricao":"Peça editada","quantidade":2,"valor_unitario":50}]',
    array[mecanico], jsonb_build_object(mecanico::text, 100), 30);
  if resultado.id <> ordem or resultado.cliente_id <> cliente or resultado.veiculo_id <> veiculo
    or resultado.valor <> 300 or resultado.valor_pago <> 100 or resultado.pagamento_status <> 'parcial'
    or resultado.comissao_percentual <> 30 then raise exception 'FAIL: edited order fields are wrong'; end if;
  if (select cliente_id from public.veiculos where id = veiculo) <> novo_cliente then
    raise exception 'FAIL: editing historical order changed current ownership'; end if;
  if (select count(*) from public.ordem_pecas where ordem_id = ordem and descricao = 'Peça editada') <> 1 then
    raise exception 'FAIL: parts not replaced'; end if;
  rejeitado := false;
  begin perform public.editar_ordem(ordem, 'Não deve salvar', '', 'aberta', 10, '[]',
    array[mecanico], jsonb_build_object(mecanico::text, 100), 30);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: total below received amount accepted'; end if;
  if not exists (select 1 from public.ordem_pecas where ordem_id = ordem and descricao = 'Peça editada')
    or (select titulo from public.ordens_servico where id = ordem) <> 'Serviço editado' then
    raise exception 'FAIL: failed edit partially persisted'; end if;
  rejeitado := false;
  begin perform public.editar_ordem(ordem, 'Comissão inválida', '', 'aberta', 400, '[]',
    array[mecanico], jsonb_build_object(mecanico::text, 100), 101);
  exception when check_violation then rejeitado := true; end;
  if not rejeitado or (select valor from public.ordens_servico where id = ordem) <> 300 then
    raise exception 'FAIL: invalid commission did not roll back'; end if;
  select * into resultado from public.editar_ordem(ordem, 'Total ajustado', '', 'concluida', 100, '[]',
    array[mecanico], jsonb_build_object(mecanico::text, 100), 100);
  if resultado.pagamento_status <> 'pago' or resultado.valor_pago <> 100 then
    raise exception 'FAIL: payment state not recalculated'; end if;
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  rejeitado := false;
  begin perform public.editar_ordem(ordem, 'Outra conta', '', 'aberta', 100, '[]',
    array[mecanico], jsonb_build_object(mecanico::text, 100), 30);
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: unauthorized edit allowed'; end if;
  execute 'reset role';
end;
$$;
rollback;
select 'order and registration editing transaction tests passed' as result;
