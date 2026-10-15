import { supabase } from '../lib/supabase'

export type Mecanico = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  created_at: string
}

type CreateMecanicoParams = {
  oficinaId: string
  nome: string
  telefone?: string
  email?: string
}

export async function listMecanicos(oficinaId: string) {
  const { data, error } = await supabase
    .from('mecanicos')
    .select('id, nome, telefone, email, created_at')
    .eq('oficina_id', oficinaId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createMecanico({
  email,
  nome,
  oficinaId,
  telefone,
}: CreateMecanicoParams) {
  const { data, error } = await supabase
    .from('mecanicos')
    .insert({
      email: email || null,
      nome,
      oficina_id: oficinaId,
      telefone: telefone || null,
    })
    .select('id, nome, telefone, email, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}
