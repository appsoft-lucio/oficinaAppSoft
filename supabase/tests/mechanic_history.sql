begin;
do $$
declare
  dono uuid:=gen_random_uuid();gerente uuid:=gen_random_uuid();outro uuid:=gen_random_uuid();
  oficina uuid:=gen_random_uuid();externa uuid:=gen_random_uuid();
  mecanico uuid:=gen_random_uuid();segundo uuid:=gen_random_uuid();
  cliente uuid:=gen_random_uuid();veiculo uuid:=gen_random_uuid();ordem uuid:=gen_random_uuid();
  s public.mecanico_servicos;rejeitado boolean;
begin
  insert into auth.users(id,email,raw_user_meta_data) values(dono,'mh-owner@example.com','{"full_name":"Dono"}'),
    (gerente,'mh-manager@example.com','{}'),(outro,'mh-other@example.com','{}');
  insert into public.oficinas(id,dono_id,nome,status,trial_ends_at) values(oficina,dono,'Histórico mecânico','ativo',null),(externa,outro,'Outra','ativo',null);
  insert into public.oficina_usuarios(user_id,oficina_id,nome,email) values(gerente,oficina,'Gerente','mh-manager@example.com');
  insert into public.mecanicos(id,oficina_id,nome) values(mecanico,oficina,'Primeiro'),(segundo,oficina,'Segundo');
  insert into public.clientes(id,oficina_id,nome) values(cliente,oficina,'Cliente');
  insert into public.veiculos(id,oficina_id,cliente_id,modelo,placa,quilometragem) values(veiculo,oficina,cliente,'Civic','MCH1234',100);
  perform set_config('request.jwt.claim.sub',dono::text,true);
  execute 'set local role authenticated';
  insert into public.ordens_servico(id,oficina_id,cliente_id,veiculo_id,titulo,valor,valor_servico,comissao_percentual,mecanico_ids,mecanico_divisao)
    values(ordem,oficina,cliente,veiculo,'Troca de óleo',200,200,50,array[mecanico,segundo],jsonb_build_object(mecanico::text,60,segundo::text,40));
  select * into s from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem;
  if not found or not s.vinculado or s.titulo<>'Troca de óleo' or s.placa<>'MCH1234' or s.autor->>'perfil'<>'dono' or s.vinculado_em is null then raise exception 'FAIL: initial mechanic snapshot missing';end if;
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  update public.ordens_servico set status='concluida' where id=ordem;
  select * into s from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem;
  if s.status<>'concluida' or s.autor->>'perfil'<>'gerente' then raise exception 'FAIL: completed service not reflected';end if;
  update public.ordens_servico set mecanico_ids=array[segundo],mecanico_divisao=jsonb_build_object(segundo::text,100),titulo='Serviço posterior',valor_servico=400,valor=400 where id=ordem;
  select * into s from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem;
  if s.vinculado or s.desvinculado_em is null or s.titulo<>'Troca de óleo' or s.valor_servico<>200 or s.veiculo_id<>veiculo then raise exception 'FAIL: past service lost on removal';end if;
  update public.ordens_servico set titulo='Ainda outro serviço',valor_servico=600,valor=600 where id=ordem;
  if (select titulo from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem)<>'Troca de óleo' then raise exception 'FAIL: later work attributed to removed mechanic';end if;
  if (select titulo from public.mecanico_servicos where mecanico_id=segundo and ordem_id=ordem)<>'Ainda outro serviço' then raise exception 'FAIL: active snapshot stale';end if;
  insert into public.lancamentos_financeiros(oficina_id,tipo,categoria,descricao,valor,mecanico_id) values(oficina,'despesa','repasse_mecanico','Repasse',60,mecanico);
  if not exists(select 1 from public.lancamentos_financeiros where mecanico_id=mecanico and valor=60) then raise exception 'FAIL: removed mechanic payment missing';end if;
  rejeitado:=false;
  begin update public.mecanico_servicos set vinculado=true where mecanico_id=mecanico;exception when insufficient_privilege then rejeitado:=true;end;
  if not rejeitado then raise exception 'FAIL: snapshot can be forged';end if;
  update public.ordens_servico set mecanico_ids=array[mecanico,segundo],mecanico_divisao=jsonb_build_object(mecanico::text,50,segundo::text,50) where id=ordem;
  if (select count(*) from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem)<>1 or not (select vinculado from public.mecanico_servicos where mecanico_id=mecanico and ordem_id=ordem) then raise exception 'FAIL: reassignment duplicated or lost service';end if;
  perform set_config('request.jwt.claim.sub',outro::text,true);
  if exists(select 1 from public.mecanico_servicos where oficina_id=oficina) then raise exception 'FAIL: foreign workshop reads mechanic history';end if;
  perform set_config('request.jwt.claim.sub',dono::text,true);
  update public.oficina_usuarios set ativo=false where user_id=gerente;
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  if exists(select 1 from public.mecanico_servicos) then raise exception 'FAIL: revoked manager reads mechanic history';end if;
  execute 'reset role';
end;
$$;
rollback;
