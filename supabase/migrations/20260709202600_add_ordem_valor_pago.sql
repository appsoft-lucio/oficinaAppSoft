alter table public.ordens_servico
add column if not exists valor_pago numeric(10,2) not null default 0;
