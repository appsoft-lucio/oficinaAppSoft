alter table public.ordens_servico
add column if not exists pagamento_status text not null default 'em_aberto';
