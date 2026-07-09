import { supabase } from '../lib/supabase'

type EnsureUserOficinaParams = {
  userId: string
  fallbackName?: string
}

export async function ensureUserOficina({
  fallbackName = 'Oficina Demonstracao',
  userId,
}: EnsureUserOficinaParams) {
  const { data: oficina, error: selectError } = await supabase
    .from('oficinas')
    .select('id')
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
    })
    .select('id')
    .single()

  if (insertError) {
    throw insertError
  }

  return createdOficina
}
