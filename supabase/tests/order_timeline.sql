begin;
do $$
declare
  dono uuid:=gen_random_uuid(); gerente uuid:=gen_random_uuid(); outro uuid:=gen_random_uuid();
  oficina uuid:=gen_random_uuid(); ordem uuid:=gen_random_uuid(); n integer; rejeitado boolean;
  entrada timestamptz:=now()-interval '2 hours'; resultado public.ordens_servico;
begin
  insert into auth.users(id,email,raw_user_meta_data) values
    (dono,'timeline-owner@example.com','{"full_name":"Dono da OS"}'),
    (gerente,'timeline-manager@example.com','{}'),(outro,'timeline-other@example.com','{}');
  insert into public.oficinas(id,dono_id,nome,status,trial_ends_at) values(oficina,dono,'Histórico OS','ativo',null);
  insert into public.oficina_usuarios(user_id,oficina_id,nome,email) values(gerente,oficina,'Gerente da OS','timeline-manager@example.com');
  perform set_config('request.jwt.claim.sub',dono::text,true);
  execute 'set local role authenticated';
  insert into public.ordens_servico(id,oficina_id,titulo,valor,valor_servico,comissao_percentual,entrada_em)
    values(ordem,oficina,'Serviço',100,100,50,entrada);
  if not exists(select 1 from public.ordem_eventos e where e.ordem_id=ordem and e.tipo='criacao'
    and e.status_novo='aberta' and e.autor->>'id'=dono::text and e.autor->>'perfil'='dono') then
    raise exception 'FAIL: creation event or owner identity missing'; end if;
  if (select entrada_em from public.ordens_servico where id=ordem) <> entrada then raise exception 'FAIL: arrival time changed'; end if;
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  update public.ordens_servico set status='em_andamento' where id=ordem;
  if not exists(select 1 from public.ordem_eventos e where e.ordem_id=ordem and e.status_anterior='aberta'
    and e.status_novo='em_andamento' and e.autor->>'nome'='Gerente da OS' and e.autor->>'perfil'='gerente'
    and e.created_at>=now() and e.alteracoes->'status'->>'antes'='aberta'
    and e.alteracoes->'status'->>'depois'='em_andamento') then raise exception 'FAIL: status transition missing'; end if;
  select count(*) into n from public.ordem_eventos where ordem_id=ordem;
  update public.ordens_servico set status='em_andamento' where id=ordem;
  if (select count(*) from public.ordem_eventos where ordem_id=ordem) <> n then raise exception 'FAIL: no-op created a history entry'; end if;
  select * into resultado from public.editar_ordem_com_entrada(ordem,'Serviço corrigido','','aguardando_peca',100,'[]','{}','{}',50,entrada-interval '1 hour');
  if resultado.entrada_em <> entrada-interval '1 hour' or resultado.status<>'aguardando_peca' then raise exception 'FAIL: editing arrival and status failed'; end if;
  if not exists(select 1 from public.ordem_eventos e where e.ordem_id=ordem
    and (e.alteracoes->'entrada_em'->>'antes')::timestamptz=entrada
    and (e.alteracoes->'entrada_em'->>'depois')::timestamptz=entrada-interval '1 hour') then raise exception 'FAIL: arrival correction not audited'; end if;
  select count(*) into n from public.ordem_eventos where ordem_id=ordem;
  rejeitado:=false;
  begin perform public.editar_ordem_com_entrada(ordem,'Não persistir','','concluida',200,'[]','{}','{}',50,now()+interval '1 day');
  exception when others then rejeitado:=true; end;
  if not rejeitado or (select count(*) from public.ordem_eventos where ordem_id=ordem)<>n
    or (select titulo from public.ordens_servico where id=ordem)<>'Serviço corrigido' then raise exception 'FAIL: failed edit partially persisted'; end if;
  rejeitado:=false;
  begin update public.ordens_servico set status='invalido' where id=ordem;
  exception when check_violation then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: invalid status accepted'; end if;
  rejeitado:=false;
  begin update public.ordens_servico set entrada_em=null where id=ordem;
  exception when others then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: arrival erased'; end if;
  rejeitado:=false;
  begin insert into public.ordem_eventos(oficina_id,ordem_id,tipo,status_novo,autor,created_at)
    values(oficina,ordem,'alteracao','concluida','{"nome":"Forjado"}',now()-interval '1 day');
  exception when insufficient_privilege then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: history forged'; end if;
  rejeitado:=false;
  begin delete from public.ordem_eventos where ordem_id=ordem;
  exception when insufficient_privilege then rejeitado:=true; end;
  if not rejeitado then raise exception 'FAIL: history deleted'; end if;
  perform set_config('request.jwt.claim.sub',outro::text,true);
  if exists(select 1 from public.ordem_eventos where ordem_id=ordem) then raise exception 'FAIL: other user can read history'; end if;
  perform set_config('request.jwt.claim.sub',dono::text,true);
  update public.oficina_usuarios set ativo=false where user_id=gerente;
  perform set_config('request.jwt.claim.sub',gerente::text,true);
  if exists(select 1 from public.ordem_eventos where ordem_id=ordem) then raise exception 'FAIL: revoked manager reads history'; end if;
  execute 'reset role';
end;
$$;
rollback;
