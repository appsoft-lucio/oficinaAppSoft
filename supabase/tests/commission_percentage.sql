begin;
do $$
declare
  usuario uuid;
  oficina uuid := gen_random_uuid();
  ordem uuid := gen_random_uuid();
  percentual integer;
  rejeitado boolean;
begin
  select id into usuario from auth.users limit 1;
  if usuario is null then raise exception 'This test requires an existing auth user'; end if;
  insert into public.oficinas (id, dono_id, nome, status)
    values (oficina, usuario, 'Teste transacional de comissão', 'ativo');
  foreach percentual in array array[1, 30, 100] loop
    insert into public.ordens_servico (oficina_id, titulo, comissao_percentual)
      values (oficina, 'Comissão válida', percentual);
  end loop;
  foreach percentual in array array[0, -1, 101] loop
    rejeitado := false;
    begin
      insert into public.ordens_servico (oficina_id, titulo, comissao_percentual)
        values (oficina, 'Comissão inválida', percentual);
    exception when check_violation then rejeitado := true; end;
    if not rejeitado then raise exception 'FAIL: invalid commission accepted'; end if;
  end loop;
  rejeitado := false;
  begin
    insert into public.ordens_servico (oficina_id, titulo) values (oficina, 'Sem comissão');
  exception when not_null_violation then rejeitado := true; end;
  if not rejeitado then raise exception 'FAIL: explicit commission not required'; end if;
  insert into public.ordens_servico (id, oficina_id, titulo, comissao_percentual)
    values (ordem, oficina, 'Comissão preservada', 30);
  update public.ordens_servico set status = 'concluida' where id = ordem;
  if (select comissao_percentual from public.ordens_servico where id = ordem) <> 30 then
    raise exception 'FAIL: status update changed commission'; end if;
end;
$$;
rollback;
select 'commission percentage transaction tests passed' as result;
