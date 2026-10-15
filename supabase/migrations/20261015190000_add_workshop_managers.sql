create table public.oficina_usuarios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  email text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.oficina_usuarios (oficina_id);
alter table public.oficina_usuarios enable row level security;

create function public.acessa_oficina(p_oficina uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.oficinas o where o.id = p_oficina
    and o.status = 'ativo' and (o.trial_ends_at is null or o.trial_ends_at > now())
    and (o.dono_id = auth.uid() or exists (select 1 from public.oficina_usuarios m
      where m.oficina_id = o.id and m.user_id = auth.uid() and m.ativo)));
$$;
revoke all on function public.acessa_oficina(uuid) from public;
grant execute on function public.acessa_oficina(uuid) to authenticated;

create function public.dono_oficina(p_oficina uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.oficinas where id = p_oficina and dono_id = auth.uid());
$$;
revoke all on function public.dono_oficina(uuid) from public;
grant execute on function public.dono_oficina(uuid) to authenticated;

revoke all on public.oficina_usuarios from anon, authenticated;
grant select on public.oficina_usuarios to authenticated;
grant all on public.oficina_usuarios to service_role;
create policy "consultar equipe" on public.oficina_usuarios for select to authenticated
using (user_id = auth.uid() or public.dono_oficina(oficina_id));
-- Only the backend creates memberships. Owners can revoke/re-enable their managers.
grant update (ativo) on public.oficina_usuarios to authenticated;
create policy "dono altera acesso dos gerentes" on public.oficina_usuarios for update to authenticated
using (public.acessa_oficina(oficina_id) and public.dono_oficina(oficina_id))
with check (public.acessa_oficina(oficina_id) and public.dono_oficina(oficina_id));

create policy "gerente consulta oficina vinculada" on public.oficinas for select to authenticated
using (exists (select 1 from public.oficina_usuarios m
  where m.oficina_id = id and m.user_id = auth.uid() and m.ativo));

-- A manager cannot create another workshop, including after access is revoked.
drop policy "usuarios iniciam oficina em avaliacao" on public.oficinas;
create policy "usuarios iniciam oficina em avaliacao" on public.oficinas for insert to authenticated
with check (dono_id = auth.uid() and status = 'ativo' and trial_ends_at is not null
  and trial_ends_at <= now() + interval '7 days 5 minutes'
  and coalesce((auth.jwt()->'app_metadata'->>'workshop_manager')::boolean, false) = false
  and not exists (select 1 from public.oficina_usuarios where user_id = auth.uid()));

do $$
declare t text; p record;
begin
  foreach t in array array['clientes','veiculos','mecanicos','ordens_servico','ordem_pecas','veiculo_proprietarios'] loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    if t = 'veiculo_proprietarios' then
      execute format('create policy equipe_consulta on public.%I for select to authenticated using (public.acessa_oficina(oficina_id))', t);
    else
      execute format('create policy equipe_opera on public.%I for all to authenticated using (public.acessa_oficina(oficina_id)) with check (public.acessa_oficina(oficina_id))', t);
    end if;
  end loop;
end;
$$;

-- Preserve the existing transactional validation in both RPCs, extending membership checks.
do $$
declare signature text; definition text;
begin
  foreach signature in array array[
    'public.editar_ordem(uuid,text,text,text,numeric,jsonb,uuid[],jsonb,integer)',
    'public.transferir_veiculo(uuid,uuid,uuid,uuid[],boolean)'
  ] loop
    definition := pg_get_functiondef(signature::regprocedure);
    if position('o.dono_id = auth.uid()' in definition) = 0 then
      raise exception 'Membership check missing in %', signature;
    end if;
    execute replace(definition, 'o.dono_id = auth.uid()', 'public.acessa_oficina(o.id)');
  end loop;
end;
$$;

create table public.registro_atividades (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  tabela text not null,
  registro_id uuid not null,
  acao text not null check (acao in ('INSERT','UPDATE','DELETE')),
  autor jsonb,
  created_at timestamptz not null default now()
);
create index on public.registro_atividades (oficina_id, created_at desc);
alter table public.registro_atividades enable row level security;
revoke all on public.registro_atividades from anon, authenticated;
grant select on public.registro_atividades to authenticated;
create policy "equipe consulta atividades" on public.registro_atividades for select to authenticated
using (public.acessa_oficina(oficina_id));

create function public.autor_oficina(p_oficina uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when o.dono_id = auth.uid() then
    jsonb_build_object('id', u.id, 'nome', coalesce(nullif(u.raw_user_meta_data->>'full_name',''), u.email, 'Dono'), 'perfil', 'dono')
  else (select jsonb_build_object('id', m.user_id, 'nome', m.nome, 'perfil', 'gerente')
    from public.oficina_usuarios m where m.user_id = auth.uid() and m.oficina_id = o.id and m.ativo) end
  from public.oficinas o join auth.users u on u.id = o.dono_id where o.id = p_oficina;
$$;
revoke all on function public.autor_oficina(uuid) from public;

create function public.preencher_autoria() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.oficina_id is distinct from old.oficina_id then raise exception 'Não é permitido mudar a oficina do registro'; end if;
    new.criado_por := old.criado_por;
  else
    new.criado_por := public.autor_oficina(new.oficina_id);
  end if;
  new.alterado_por := public.autor_oficina(new.oficina_id);
  new.alterado_em := now();
  return new;
end;
$$;
revoke all on function public.preencher_autoria() from public;

create function public.registrar_atividade() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if not exists (select 1 from public.oficinas where id = (r->>'oficina_id')::uuid) then return null; end if;
  insert into public.registro_atividades (oficina_id, tabela, registro_id, acao, autor)
  values ((r->>'oficina_id')::uuid, tg_table_name, (r->>'id')::uuid, tg_op, public.autor_oficina((r->>'oficina_id')::uuid));
  return null;
end;
$$;
revoke all on function public.registrar_atividade() from public;

do $$
declare t text;
begin
  foreach t in array array['clientes','veiculos','mecanicos','ordens_servico','ordem_pecas','veiculo_proprietarios'] loop
    execute format('alter table public.%I add column criado_por jsonb, add column alterado_por jsonb, add column alterado_em timestamptz', t);
    execute format('create trigger preencher_autoria before insert or update on public.%I for each row execute function public.preencher_autoria()', t);
    execute format('create trigger registrar_atividade after insert or update or delete on public.%I for each row execute function public.registrar_atividade()', t);
  end loop;
end;
$$;
