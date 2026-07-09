import { supabase } from '../lib/supabase'

export type Cliente = {
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
    .select('id, nome, telefone, email, created_at')
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
    .select('id, nome, telefone, email, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}
