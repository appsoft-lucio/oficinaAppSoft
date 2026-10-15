import type { AutoriaRegistro } from './equipe'
import { supabase } from '../lib/supabase'

export type Cliente = AutoriaRegistro & {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  created_at: string
}

type CreateClienteParams = {
  oficinaId: string
  nome: string
  telefone?: string
  email?: string
}

export async function listClientes(oficinaId: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone, email, created_at, criado_por, alterado_por, alterado_em')
    .eq('oficina_id', oficinaId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createCliente({
  email,
  nome,
  oficinaId,
  telefone,
}: CreateClienteParams) {
  const { data, error } = await supabase
    .from('clientes')
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

export async function updateCliente({ id, oficinaId, nome, telefone, email }: CreateClienteParams & { id: string }) {
  if (!nome.trim()) throw new Error('Informe o nome do cliente.')
  const { data, error } = await supabase.from('clientes')
    .update({ nome: nome.trim(), telefone: telefone?.trim() || null, email: email?.trim() || null })
    .eq('id', id).eq('oficina_id', oficinaId)
    .select('id, nome, telefone, email, created_at, criado_por, alterado_por, alterado_em').single()
  if (error) throw error
  return data
}
