import { supabase } from '../lib/supabase'

type EnsureUserOficinaParams = {
  userId: string
  fallbackName?: string
}

export type Oficina = {
  id: string
  nome: string
  status: 'ativo' | 'suspenso'
  trial_ends_at: string | null
}

export async function ensureUserOficina({
  fallbackName = 'Oficina Demonstração',
  userId,
}: EnsureUserOficinaParams) {
  const { data: oficina, error: selectError } = await supabase
    .from('oficinas')
    .select('id, nome, status, trial_ends_at')
    .eq('dono_id', userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (oficina) {
    return oficina
  }

  const { data: createdOficina, error: insertError } = await supabase
    .from('oficinas')
    .insert({
      dono_id: userId,
      nome: fallbackName,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, nome, status, trial_ends_at')
    .single()

  if (insertError) {
    throw insertError
  }

  return createdOficina
}
