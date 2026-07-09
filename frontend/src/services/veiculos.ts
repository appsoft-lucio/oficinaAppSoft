import { supabase } from '../lib/supabase'

export type Veiculo = {
  id: string
  cliente_id: string | null
  placa: string | null
  marca: string | null
  modelo: string
  ano: number | null
  created_at: string
}

type CreateVeiculoParams = {
  oficinaId: string
  clienteId: string
  placa?: string
  marca?: string
  modelo: string
  ano?: string
}

export async function listVeiculos(oficinaId: string) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, cliente_id, placa, marca, modelo, ano, created_at')
    .eq('oficina_id', oficinaId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createVeiculo({
  ano,
  clienteId,
  marca,
  modelo,
  oficinaId,
  placa,
}: CreateVeiculoParams) {
  const parsedAno = ano ? Number(ano) : null

  const { data, error } = await supabase
    .from('veiculos')
    .insert({
      ano: Number.isNaN(parsedAno) ? null : parsedAno,
      cliente_id: clienteId,
      marca: marca || null,
      modelo,
      oficina_id: oficinaId,
      placa: placa || null,
    })
    .select('id, cliente_id, placa, marca, modelo, ano, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}
