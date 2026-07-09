create table public.oficinas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  dono_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  created_at timestamptz not null default now()
);

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  placa text,
  marca text,
  modelo text not null,
  ano integer,
  created_at timestamptz not null default now()
);

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null references public.oficinas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  titulo text not null,
  descricao text,
  status text not null default 'aberta',
  valor numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
