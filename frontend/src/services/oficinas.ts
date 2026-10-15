import { supabase } from '../lib/supabase'

type EnsureUserOficinaParams = {
  userId: string
  fallbackName?: string
}

export type Oficina = {
  id: string
  dono_id?: string
  nome: string
  status: 'ativo' | 'suspenso'
  trial_ends_at: string | null
}

export async function ensureUserOficina({
  fallbackName = 'Minha Oficina',
  userId,
}: EnsureUserOficinaParams) {
  const { data: oficina, error: selectError } = await supabase
    .from('oficinas')
    .select('id, nome, dono_id, status, trial_ends_at')
    .eq('dono_id', userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (oficina) {
    return oficina
  }

  const { data: membership, error: membershipError } = await supabase.from('oficina_usuarios')
    .select('oficina_id, ativo').eq('user_id', userId).maybeSingle()
  if (membershipError) throw membershipError
  if (membership) {
    if (!membership.ativo) throw new Error('Seu acesso à oficina foi desativado pelo dono.')
    const { data: sharedOficina, error } = await supabase.from('oficinas')
      .select('id, nome, dono_id, status, trial_ends_at').eq('id', membership.oficina_id).single()
    if (error) throw error
    return sharedOficina
  }
  const { data: auth } = await supabase.auth.getUser()
  if (auth.user?.app_metadata.workshop_manager) throw new Error('Seu acesso de gerente não está vinculado a uma oficina ativa.')

  const { data: createdOficina, error: insertError } = await supabase
    .from('oficinas')
    .insert({
      dono_id: userId,
      nome: fallbackName,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('id, nome, dono_id, status, trial_ends_at')
    .single()

  if (insertError) {
    throw insertError
  }

  return createdOficina
}
