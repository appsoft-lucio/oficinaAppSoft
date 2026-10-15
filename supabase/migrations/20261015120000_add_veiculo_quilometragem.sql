alter table public.veiculos
  add column quilometragem integer
  check (quilometragem >= 0);
