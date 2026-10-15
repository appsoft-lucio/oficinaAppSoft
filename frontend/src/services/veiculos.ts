import type { AutoriaRegistro } from './equipe'
import { supabase } from '../lib/supabase'

export type Veiculo = AutoriaRegistro & {
  id: string
  cliente_id: string | null
  placa: string | null
  marca: string | null
  modelo: string
  ano: number | null
  quilometragem: number | null
  created_at: string
}

type CreateVeiculoParams = {
  oficinaId: string
  clienteId: string
  placa?: string
  marca?: string
  modelo: string
  ano?: string
  quilometragem: number
}

export async function listVeiculos(oficinaId: string) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, cliente_id, placa, marca, modelo, ano, quilometragem, created_at, criado_por, alterado_por, alterado_em')
    .eq('oficina_id', oficinaId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function updateVeiculo({ id, oficinaId, modelo, marca, placa, ano, quilometragem }: Omit<CreateVeiculoParams, 'clienteId'> & { id: string }) {
  if (!modelo.trim()) throw new Error('Informe o modelo do veículo.')
  if (!Number.isSafeInteger(quilometragem) || quilometragem < 0 || quilometragem > 2147483647) {
    throw new Error('Informe uma quilometragem inteira maior ou igual a zero.')
  }
  const parsedAno = ano?.trim() ? Number(ano) : null
  if (parsedAno !== null && (!Number.isInteger(parsedAno) || parsedAno < 1886 || parsedAno > 9999)) {
    throw new Error('Informe um ano válido.')
  }
  const { data, error } = await supabase.from('veiculos').update({
    modelo: modelo.trim(), marca: marca?.trim() || null, placa: placa?.trim() || null,
    ano: parsedAno, quilometragem,
  }).eq('id', id).eq('oficina_id', oficinaId)
    .select('id, cliente_id, placa, marca, modelo, ano, quilometragem, created_at, criado_por, alterado_por, alterado_em').single()
  if (error) throw error
  return data
}

export async function createVeiculo({
  ano,
  clienteId,
  marca,
  modelo,
  oficinaId,
  placa,
  quilometragem,
}: CreateVeiculoParams) {
  if (!Number.isSafeInteger(quilometragem) || quilometragem < 0 || quilometragem > 2147483647) {
    throw new Error('Informe uma quilometragem inteira válida, maior ou igual a zero.')
  }

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
      quilometragem,
    })
    .select('id, cliente_id, placa, marca, modelo, ano, quilometragem, created_at, criado_por, alterado_por, alterado_em')
    .single()

  if (error) {
    throw error
  }

  return data
}
