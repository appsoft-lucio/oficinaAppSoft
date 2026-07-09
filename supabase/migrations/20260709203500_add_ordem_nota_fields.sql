alter table public.ordens_servico
add column if not exists nota_status text not null default 'pendente',
add column if not exists nota_numero text,
add column if not exists nota_emitida_em timestamptz;
