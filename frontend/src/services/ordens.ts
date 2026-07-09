import { supabase } from '../lib/supabase'

export type OrdemServico = {
  id: string
  cliente_id: string | null
  veiculo_id: string | null
  titulo: string
  descricao: string | null
  status: string
  valor: number
  created_at: string
}

type CreateOrdemParams = {
  oficinaId: string
  clienteId: string
  veiculoId: string
  titulo: string
  descricao?: string
  status: string
  valor?: string
}

export async function listOrdens(oficinaId: string) {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('id, cliente_id, veiculo_id, titulo, descricao, status, valor, created_at')
    .eq('oficina_id', oficinaId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createOrdem({
  clienteId,
  descricao,
  oficinaId,
  status,
  titulo,
  valor,
  veiculoId,
}: CreateOrdemParams) {
  const parsedValor = valor ? Number(valor.replace(',', '.')) : 0

  const { data, error } = await supabase
    .from('ordens_servico')
    .insert({
      cliente_id: clienteId,
      descricao: descricao || null,
      oficina_id: oficinaId,
      status,
      titulo,
      valor: Number.isNaN(parsedValor) ? 0 : parsedValor,
      veiculo_id: veiculoId,
    })
    .select('id, cliente_id, veiculo_id, titulo, descricao, status, valor, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}
