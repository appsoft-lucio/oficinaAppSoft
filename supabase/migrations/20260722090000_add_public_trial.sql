alter table public.oficinas
add column trial_ends_at timestamptz default (now() + interval '7 days');

comment on column public.oficinas.trial_ends_at is
  'Fim do período gratuito. NULL representa uma conta sem prazo de avaliação.';
