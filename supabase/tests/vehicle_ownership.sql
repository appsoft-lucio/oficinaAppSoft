-- Run after the ownership migration. All fixtures are rolled back.
begin;
do $$
declare
  usuario uuid;
  oficina uuid := gen_random_uuid();
  outra_oficina uuid := gen_random_uuid();
  anterior uuid := gen_random_uuid();
  novo uuid := gen_random_uuid();
  estrangeiro uuid := gen_random_uuid();
  veiculo uuid := gen_random_uuid();
  ordem uuid := gen_random_uuid();
  resultado public.veiculos;
  rejeitado boolean;
begin
  select id into usuario from auth.users limit 1;
  if usuario is null then raise exception 'This test requires an existing auth user'; end if;
  perform set_config('request.jwt.claim.sub', usuario::text, true);
  insert into public.oficinas (id, dono_id, nome, status) values
    (oficina, usuario, 'Teste transacional de propriedade', 'ativo'),
    (outra_oficina, usuario, 'Outra oficina de teste', 'ativo');
  insert into public.clientes (id, oficina_id, nome) values
    (anterior, oficina, 'Proprietário anterior'), (novo, oficina, 'Novo proprietário'),
    (estrangeiro, outra_oficina, 'Cliente de outra oficina');
  insert into public.veiculos (id, oficina_id, cliente_id, placa, modelo, quilometragem)
    values (veiculo, oficina, anterior, ' tst-1234 ', 'Veículo de teste', 50000);
  if not exists (select 1 from public.veiculo_proprietarios where veiculo_id = veiculo and cliente_novo_id = anterior and tipo = 'cadastro') then
    raise exception 'FAIL: initial ownership not recorded'; end if;
  rejeitado := false;
  begin
    insert into public.veiculos (oficina_id, cliente_id, placa, modelo)
      values (oficina, novo, 'TST 1234', 'Duplicado');
  exception when unique_violation then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: normalized duplicate accepted'; end if;
  rejeitado := false;
  begin perform public.transferir_veiculo(veiculo, novo, anterior, '{}', false);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: transferred without confirmation'; end if;
  rejeitado := false;
  begin perform public.transferir_veiculo(veiculo, estrangeiro, anterior, '{}', true);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: cross-workshop owner accepted'; end if;
  rejeitado := false;
  begin update public.veiculos set cliente_id = novo where id = veiculo;
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: direct owner change accepted'; end if;
  insert into public.ordens_servico
    (id, oficina_id, cliente_id, veiculo_id, titulo, status, valor, valor_servico, pagamento_status, comissao_percentual)
    values (ordem, oficina, anterior, veiculo, 'Manutenção em aberto', 'aberta', 100, 100, 'em_aberto', 50);
  rejeitado := false;
  begin perform public.transferir_veiculo(veiculo, novo, anterior, '{}', true);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: undisclosed pending order accepted'; end if;
  select * into resultado from public.transferir_veiculo(veiculo, novo, anterior, array[ordem], true);
  if resultado.id <> veiculo or resultado.cliente_id <> novo or resultado.quilometragem <> 50000 then
    raise exception 'FAIL: vehicle identity or data changed'; end if;
  if not exists (select 1 from public.ordens_servico where id = ordem and cliente_id = anterior and veiculo_id = veiculo) then
    raise exception 'FAIL: historical order was changed'; end if;
  rejeitado := false;
  begin
    insert into public.ordens_servico (oficina_id, cliente_id, veiculo_id, titulo, comissao_percentual)
      values (oficina, anterior, veiculo, 'Ordem com proprietário desatualizado', 50);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: stale owner allowed on new order'; end if;
  if not exists (select 1 from public.veiculo_proprietarios where veiculo_id = veiculo
    and cliente_anterior_id = anterior and cliente_novo_id = novo and tipo = 'transferencia'
    and nome_anterior = 'Proprietário anterior' and nome_novo = 'Novo proprietário') then
    raise exception 'FAIL: transfer history missing'; end if;
  rejeitado := false;
  begin perform public.transferir_veiculo(veiculo, anterior, anterior, array[ordem], true);
  exception when others then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: stale owner confirmation accepted'; end if;
  update public.ordens_servico set status = 'concluida', pagamento_status = 'pago' where id = ordem;
  perform public.transferir_veiculo(veiculo, anterior, novo, '{}', true);
  if (select count(*) from public.veiculo_proprietarios where veiculo_id = veiculo) <> 3 then
    raise exception 'FAIL: ownership timeline incomplete'; end if;
  execute 'set local role authenticated';
  if (select count(*) from public.veiculo_proprietarios where veiculo_id = veiculo) <> 3 then
    raise exception 'FAIL: authorized history access denied'; end if;
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  if exists (select 1 from public.veiculo_proprietarios where veiculo_id = veiculo) then
    raise exception 'FAIL: other account can read history'; end if;
  rejeitado := false;
  begin perform public.transferir_veiculo(veiculo, novo, anterior, '{}', true);
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: other account can transfer'; end if;
  execute 'reset role';
end;
$$;
rollback;
select 'vehicle ownership transaction tests passed' as result;
