begin;
do $$
declare
  dono uuid := gen_random_uuid(); gerente uuid := gen_random_uuid(); estranho uuid := gen_random_uuid();
  oficina uuid := gen_random_uuid(); externa uuid := gen_random_uuid();
  mecanico uuid := gen_random_uuid(); mecanico_externo uuid := gen_random_uuid();
  ordem uuid := gen_random_uuid(); lancamento uuid := gen_random_uuid(); rejeitado boolean;
  saldo numeric;
begin
  insert into auth.users (id,email,raw_user_meta_data) values
    (dono,'cash-owner@example.com','{"full_name":"Dono caixa"}'),
    (gerente,'cash-manager@example.com','{}'), (estranho,'cash-other@example.com','{}');
  insert into public.oficinas(id,dono_id,nome,status,trial_ends_at) values
    (oficina,dono,'Caixa teste','ativo',null), (externa,estranho,'Externa','ativo',null);
  insert into public.oficina_usuarios(user_id,oficina_id,nome,email) values (gerente,oficina,'Gerente caixa','cash-manager@example.com');
  insert into public.mecanicos(id,oficina_id,nome) values (mecanico,oficina,'Mecânico'), (mecanico_externo,externa,'Externo');
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  execute 'set local role authenticated';
  insert into public.ordens_servico(id,oficina_id,titulo,valor,valor_servico,pagamento_status,valor_pago,comissao_percentual)
    values (ordem,oficina,'Serviço',1000,1000,'em_aberto',0,50);
  if exists (select 1 from public.lancamentos_financeiros where ordem_id=ordem) then raise exception 'FAIL: unpaid order recognized as cash'; end if;
  update public.ordens_servico set pagamento_status='parcial',valor_pago=300 where id=ordem;
  update public.ordens_servico set pagamento_status='parcial',valor_pago=300 where id=ordem;
  if (select count(*) from public.lancamentos_financeiros where ordem_id=ordem) <> 1 then raise exception 'FAIL: duplicate receipt'; end if;
  update public.ordens_servico set pagamento_status='pago',valor_pago=1000 where id=ordem;
  if (select sum(valor) from public.lancamentos_financeiros where ordem_id=ordem) <> 1000 then raise exception 'FAIL: partial plus final double counted'; end if;
  update public.ordens_servico set pagamento_status='parcial',valor_pago=800 where id=ordem;
  if not exists(select 1 from public.lancamentos_financeiros where ordem_id=ordem and categoria='estorno_recebimento' and valor=200) then raise exception 'FAIL: adjustment missing'; end if;
  insert into public.lancamentos_financeiros(id,oficina_id,tipo,categoria,descricao,valor) values (lancamento,oficina,'despesa','aluguel','Aluguel',100);
  insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor,mecanico_id)
    values (oficina,'despesa','repasse_mecanico','Repasse pago',300,mecanico);
  insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor)
    values (oficina,'receita','outras_receitas','Receita extra',50);
  select sum(case when tipo='receita' then valor else -valor end) into saldo
    from public.lancamentos_financeiros where oficina_id=oficina and not cancelado;
  if saldo <> 450 then raise exception 'FAIL: expected 450 after expenses and repasses, got %',saldo; end if;
  if not exists(select 1 from public.lancamentos_financeiros where id=lancamento and criado_por->>'perfil'='gerente') then raise exception 'FAIL: author not recorded'; end if;
  update public.lancamentos_financeiros set cancelado=true where id=lancamento;
  select sum(case when tipo='receita' then valor else -valor end) into saldo from public.lancamentos_financeiros where oficina_id=oficina and not cancelado;
  if saldo <> 550 then raise exception 'FAIL: canceled expense still deducted'; end if;
  rejeitado:=false;
  begin insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor,origem,ordem_id)
    values(oficina,'receita','recebimento_ordem','Forjado',100,'ordem',ordem);
  exception when insufficient_privilege then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: auto receipt forged'; end if;
  update public.lancamentos_financeiros set valor=1 where origem='ordem';
  if found then raise exception 'FAIL: automatic receipt edited'; end if;
  rejeitado:=false;
  begin insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor,mecanico_id)
    values(oficina,'despesa','repasse_mecanico','Externo',100,mecanico_externo);
  exception when others then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: mechanic from another workshop accepted'; end if;
  rejeitado:=false;
  begin insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor) values(externa,'receita','outras_receitas','Intruso',100);
  exception when insufficient_privilege then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: other workshop accessible'; end if;
  rejeitado:=false;
  begin insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor) values(oficina,'despesa','aluguel','Negativo',-10);
  exception when check_violation then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: negative amount accepted'; end if;
  rejeitado:=false;
  begin delete from public.lancamentos_financeiros where id=lancamento;
  exception when insufficient_privilege then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: history deleted'; end if;
  perform set_config('request.jwt.claim.sub',dono::text,true);
  update public.oficina_usuarios set ativo=false where user_id=gerente;
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  if exists(select 1 from public.lancamentos_financeiros) then raise exception 'FAIL: revoked manager reads cash'; end if;
  execute 'reset role';
end;
$$;
rollback;
