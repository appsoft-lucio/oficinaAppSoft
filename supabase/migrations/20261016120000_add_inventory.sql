create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  nome text not null check(length(trim(nome)) between 1 and 140),
  descricao text check(length(descricao)<=1000),
  codigo_serie text check(length(codigo_serie) between 1 and 80),
  preco numeric(12,2) not null default 0 check(preco>=0 and preco::text not in ('NaN','Infinity','-Infinity')),
  quantidade numeric(12,3) not null default 0 check(quantidade>=0 and quantidade::text not in ('NaN','Infinity','-Infinity')),
  estoque_minimo numeric(12,3) not null default 0 check(estoque_minimo>=0 and estoque_minimo::text not in ('NaN','Infinity','-Infinity')),
  foto_path text,
  criado_por jsonb,alterado_por jsonb,alterado_em timestamptz,
  created_at timestamptz not null default now()
);
create unique index produtos_codigo_unico on public.produtos(oficina_id,upper(trim(codigo_serie))) where codigo_serie is not null;
create index on public.produtos(oficina_id,nome,id);
alter table public.produtos enable row level security;
revoke all on public.produtos from anon,authenticated;
grant select on public.produtos to authenticated;
grant update(nome,descricao,codigo_serie,preco,estoque_minimo,foto_path) on public.produtos to authenticated;
grant all on public.produtos to service_role;
create policy "equipe consulta produtos" on public.produtos for select to authenticated using(public.acessa_oficina(oficina_id));
create policy "equipe edita produtos" on public.produtos for update to authenticated
using(public.acessa_oficina(oficina_id)) with check(public.acessa_oficina(oficina_id));

create table public.estoque_movimentos (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  tipo text not null check(tipo in ('saldo_inicial','entrada','saida','ajuste')),
  quantidade numeric(12,3) not null check(quantidade>0),
  saldo_antes numeric(12,3) not null check(saldo_antes>=0),
  saldo_depois numeric(12,3) not null check(saldo_depois>=0),
  motivo text not null check(length(trim(motivo)) between 3 and 300),
  criado_por jsonb,
  created_at timestamptz not null default clock_timestamp(),
  check(quantidade=abs(saldo_depois-saldo_antes))
);
create index on public.estoque_movimentos(produto_id,created_at desc,id desc);
alter table public.estoque_movimentos enable row level security;
revoke all on public.estoque_movimentos from anon,authenticated;
grant select on public.estoque_movimentos to authenticated;
grant all on public.estoque_movimentos to service_role;
create policy "equipe consulta movimentos de estoque" on public.estoque_movimentos for select to authenticated using(public.acessa_oficina(oficina_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('estoque-produtos','estoque-produtos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create function public.acessa_foto_estoque(p_path text) returns boolean
language sql stable set search_path='' as $$
  select case when split_part(p_path,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then public.acessa_oficina(split_part(p_path,'/',1)::uuid) else false end;
$$;
revoke all on function public.acessa_foto_estoque(text) from public;
grant execute on function public.acessa_foto_estoque(text) to authenticated;
create policy "equipe consulta fotos do estoque" on storage.objects for select to authenticated
using(bucket_id='estoque-produtos' and public.acessa_foto_estoque(name));
create policy "equipe envia fotos do estoque" on storage.objects for insert to authenticated
with check(bucket_id='estoque-produtos' and public.acessa_foto_estoque(name));
create policy "equipe remove fotos do estoque" on storage.objects for delete to authenticated
using(bucket_id='estoque-produtos' and public.acessa_foto_estoque(name));

create function public.validar_foto_produto() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.foto_path is not null and (
    new.foto_path !~ ('^'||new.oficina_id::text||'/'||new.id::text||'/[a-f0-9-]+\.(jpg|png|webp)$')
    or not exists(select 1 from storage.objects where bucket_id='estoque-produtos' and name=new.foto_path)
  ) then raise exception 'Foto inválida para este produto e oficina';end if;
  return new;
end;
$$;
revoke all on function public.validar_foto_produto() from public;
create trigger validar_foto_produto before insert or update of foto_path on public.produtos for each row execute function public.validar_foto_produto();
create trigger preencher_autoria before insert or update on public.produtos for each row execute function public.preencher_autoria();
create trigger registrar_atividade after insert or update on public.produtos for each row execute function public.registrar_atividade();
create trigger registrar_atividade after insert on public.estoque_movimentos for each row execute function public.registrar_atividade();

create function public.cadastrar_produto(
  p_oficina_id uuid,p_id uuid,p_nome text,p_descricao text,p_codigo_serie text,p_preco numeric,
  p_quantidade numeric,p_estoque_minimo numeric,p_foto_path text
) returns public.produtos language plpgsql security definer set search_path='' as $$
declare r public.produtos;
begin
  if not public.acessa_oficina(p_oficina_id) then raise exception using errcode='42501',message='Oficina indisponível para esta conta';end if;
  if p_quantidade is null or p_quantidade<0 or p_quantidade::text in ('NaN','Infinity','-Infinity') or p_quantidade<>round(p_quantidade,3) then
    raise exception 'Informe uma quantidade maior ou igual a zero, com até 3 casas decimais';end if;
  insert into public.produtos(id,oficina_id,nome,descricao,codigo_serie,preco,quantidade,estoque_minimo,foto_path)
  values(p_id,p_oficina_id,trim(p_nome),nullif(trim(p_descricao),''),nullif(upper(trim(p_codigo_serie)),''),p_preco,p_quantidade,p_estoque_minimo,p_foto_path) returning * into r;
  if r.quantidade>0 then
    insert into public.estoque_movimentos(oficina_id,produto_id,tipo,quantidade,saldo_antes,saldo_depois,motivo,criado_por)
    values(r.oficina_id,r.id,'saldo_inicial',r.quantidade,0,r.quantidade,'Estoque inicial',public.autor_oficina(r.oficina_id));
  end if;
  return r;
end;
$$;
revoke all on function public.cadastrar_produto(uuid,uuid,text,text,text,numeric,numeric,numeric,text) from public;
grant execute on function public.cadastrar_produto(uuid,uuid,text,text,text,numeric,numeric,numeric,text) to authenticated;

create function public.movimentar_estoque(p_produto_id uuid,p_tipo text,p_quantidade numeric,p_motivo text)
returns public.produtos language plpgsql security definer set search_path='' as $$
declare r public.produtos; novo_saldo numeric;anterior numeric;
begin
  select * into r from public.produtos where id=p_produto_id for update;
  if not found or not public.acessa_oficina(r.oficina_id) then raise exception using errcode='42501',message='Produto indisponível para esta conta';end if;
  if p_tipo is null or p_tipo not in ('entrada','saida','ajuste') then raise exception 'Tipo de movimentação inválido';end if;
  if p_quantidade is null or p_quantidade<0 or p_quantidade::text in ('NaN','Infinity','-Infinity') or p_quantidade<>round(p_quantidade,3)
    or (p_tipo<>'ajuste' and p_quantidade=0) then raise exception 'Informe quantidade válida, com até 3 casas decimais';end if;
  if coalesce(length(trim(p_motivo)),0) not between 3 and 300 then raise exception 'Informe o motivo com 3 a 300 caracteres';end if;
  anterior:=r.quantidade;
  novo_saldo:=case p_tipo when 'entrada' then anterior+p_quantidade when 'saida' then anterior-p_quantidade else p_quantidade end;
  if novo_saldo<0 then raise exception 'Estoque insuficiente para esta saída';end if;
  if novo_saldo=anterior then raise exception 'O saldo informado já corresponde ao estoque atual';end if;
  update public.produtos set quantidade=novo_saldo where id=r.id returning * into r;
  insert into public.estoque_movimentos(oficina_id,produto_id,tipo,quantidade,saldo_antes,saldo_depois,motivo,criado_por)
  values(r.oficina_id,r.id,p_tipo,abs(novo_saldo-anterior),anterior,novo_saldo,trim(p_motivo),public.autor_oficina(r.oficina_id));
  return r;
end;
$$;
revoke all on function public.movimentar_estoque(uuid,text,numeric,text) from public;
grant execute on function public.movimentar_estoque(uuid,text,numeric,text) to authenticated;
