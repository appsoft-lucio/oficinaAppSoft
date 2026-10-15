-- Keep the original 50% agreement for existing orders.
alter table public.ordens_servico
  add column comissao_percentual integer not null default 50
  check (comissao_percentual between 1 and 100);

-- New orders must explicitly specify the percentage chosen by the manager.
alter table public.ordens_servico alter column comissao_percentual drop default;
