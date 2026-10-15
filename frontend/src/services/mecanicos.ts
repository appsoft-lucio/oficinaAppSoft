import type { AutoriaRegistro } from './equipe'
import { supabase } from '../lib/supabase'

export type Mecanico = AutoriaRegistro & {
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
    .select('id, nome, telefone, email, created_at, criado_por, alterado_por, alterado_em')
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
    .select('id, nome, telefone, email, created_at, criado_por, alterado_por, alterado_em')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateMecanico({ id, oficinaId, nome, telefone, email }: CreateMecanicoParams & { id: string }) {
  if (!nome.trim()) throw new Error('Informe o nome do mecânico.')
  const { data, error } = await supabase.from('mecanicos')
    .update({ nome: nome.trim(), telefone: telefone?.trim() || null, email: email?.trim() || null })
    .eq('id', id).eq('oficina_id', oficinaId)
    .select('id, nome, telefone, email, created_at, criado_por, alterado_por, alterado_em').single()
  if (error) throw error
  return data
}
