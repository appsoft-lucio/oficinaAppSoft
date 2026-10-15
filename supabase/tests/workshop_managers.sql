begin;
do $$
declare
  dono uuid := gen_random_uuid(); gerente uuid := gen_random_uuid(); outro uuid := gen_random_uuid();
  oficina uuid := gen_random_uuid(); externa uuid := gen_random_uuid();
  cliente uuid := gen_random_uuid(); veiculo uuid := gen_random_uuid(); ordem uuid := gen_random_uuid();
  resultado public.ordens_servico; autor jsonb; rejeitado boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (dono, 'owner-test@example.com', '{"full_name":"Dono teste"}'),
    (gerente, 'manager-test@example.com', '{"full_name":"Nome alterável"}'),
    (outro, 'other-test@example.com', '{}');
  insert into public.oficinas (id, dono_id, nome, status, trial_ends_at) values
    (oficina, dono, 'Oficina teste equipe', 'ativo', null), (externa, outro, 'Outra oficina', 'ativo', null);
  insert into public.oficina_usuarios (user_id, oficina_id, nome, email) values
    (gerente, oficina, 'Gerente teste', 'manager-test@example.com');
  perform set_config('request.jwt.claim.sub', dono::text, true);
  insert into public.clientes (id, oficina_id, nome) values (cliente, oficina, 'Cliente do dono');
  select criado_por into autor from public.clientes where id = cliente;
  if autor->>'perfil' <> 'dono' or autor->>'id' <> dono::text then raise exception 'FAIL: owner attribution'; end if;

  perform set_config('request.jwt.claim.sub', gerente::text, true);
  execute 'set local role authenticated';
  if (select count(*) from public.oficinas) <> 1 then raise exception 'FAIL: workshop isolation or recursive RLS'; end if;
  update public.clientes set nome = 'Editado pelo gerente', criado_por = '{"nome":"Falso"}', alterado_por = '{"nome":"Falso"}' where id = cliente;
  select alterado_por into autor from public.clientes where id = cliente;
  if autor->>'perfil' <> 'gerente' or autor->>'nome' <> 'Gerente teste' then raise exception 'FAIL: manager attribution'; end if;
  if (select criado_por->>'id' from public.clientes where id = cliente) <> dono::text then raise exception 'FAIL: creator spoofed'; end if;
  insert into public.veiculos (id, oficina_id, cliente_id, placa, modelo, quilometragem)
    values (veiculo, oficina, cliente, 'GRT1234', 'Teste', 0);
  insert into public.ordens_servico (id, oficina_id, cliente_id, veiculo_id, titulo, comissao_percentual)
    values (ordem, oficina, cliente, veiculo, 'Ordem gerente', 50);
  select * into resultado from public.editar_ordem(ordem, 'Editada gerente', '', 'aberta', 100, '[]', '{}', '{}', 50);
  if resultado.valor <> 100 or resultado.alterado_por->>'perfil' <> 'gerente' then raise exception 'FAIL: manager cannot edit order'; end if;
  perform public.transferir_veiculo(veiculo, cliente, cliente, array[ordem], true);
  rejeitado := false;
  begin insert into public.clientes (oficina_id, nome) values (externa, 'Intruso');
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: manager can insert in other workshop'; end if;
  rejeitado := false;
  begin update public.oficina_usuarios set nome = 'Falso' where user_id = gerente;
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: manager can edit membership'; end if;
  rejeitado := false;
  begin insert into public.registro_atividades (oficina_id, tabela, registro_id, acao) values (oficina, 'clientes', cliente, 'INSERT');
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: audit log can be forged'; end if;
  if not exists (select 1 from public.registro_atividades a where a.registro_id = cliente and a.autor->>'perfil' = 'gerente') then raise exception 'FAIL: manager activity missing'; end if;

  perform set_config('request.jwt.claim.sub', dono::text, true);
  update public.oficina_usuarios set ativo = false where user_id = gerente;
  if not found then raise exception 'FAIL: owner cannot revoke'; end if;
  perform set_config('request.jwt.claim.sub', gerente::text, true);
  if exists (select 1 from public.clientes) then raise exception 'FAIL: revoked manager still reads'; end if;
  rejeitado := false;
  begin insert into public.oficinas (dono_id, nome, status, trial_ends_at) values (gerente, 'Nova oficina indevida', 'ativo', now() + interval '7 days');
  exception when insufficient_privilege then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: manager created own workshop'; end if;
  perform set_config('request.jwt.claim.sub', dono::text, true);
  update public.oficina_usuarios set ativo = true where user_id = gerente;
  execute 'reset role';
  update public.oficinas set status = 'suspenso' where id = oficina;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub', gerente::text, true);
  if public.acessa_oficina(oficina) then raise exception 'FAIL: suspended workshop accessible'; end if;
  execute 'reset role';
end;
$$;
rollback;
