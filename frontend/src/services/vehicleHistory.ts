import { supabase } from '../lib/supabase'
import { listOrdens, type OrdemServico } from './ordens'
import { listVeiculos, type Veiculo } from './veiculos'

export function normalizarPlaca(placa: string) {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function ordensPendentes(ordens: OrdemServico[], veiculoId: string) {
  return ordens.filter((ordem) => ordem.veiculo_id === veiculoId && ordem.status !== 'cancelada'
    && (ordem.status !== 'concluida' || ordem.pagamento_status !== 'pago'))
}

export type ProprietarioEvento = {
  id: string
  veiculo_id: string
  cliente_anterior_id: string | null
  cliente_novo_id: string | null
  nome_anterior: string | null
  nome_novo: string | null
  tipo: string
  created_at: string
}

export async function prepararTransferencia(oficinaId: string, veiculo: Veiculo) {
  const ordens = await listOrdens(oficinaId)
  return ordensPendentes(ordens, veiculo.id)
}

export async function buscarVeiculoDuplicado(oficinaId: string, placa: string) {
  const normalizada = normalizarPlaca(placa)
  if (!normalizada) return null
  const veiculos = await listVeiculos(oficinaId)
  const matches = veiculos.filter((veiculo) => normalizarPlaca(veiculo.placa ?? '') === normalizada)
  if (matches.length > 1) throw new Error('Já existem vários cadastros com esta placa. É necessário revisar os registros antes de transferir para preservar os históricos.')
  return matches[0] ?? null
}

export async function transferirVeiculo(veiculo: Veiculo, clienteId: string, pendentes: OrdemServico[]) {
  const { data, error } = await supabase.rpc('transferir_veiculo', {
    p_veiculo_id: veiculo.id,
    p_cliente_id: clienteId,
    p_cliente_anterior_id: veiculo.cliente_id,
    p_ordens_pendentes: pendentes.map((ordem) => ordem.id).sort(),
    p_confirmado: true,
  }).single()
  if (error) throw error
  return data as Veiculo
}

export async function listProprietarios(oficinaId: string) {
  const { data, error } = await supabase.from('veiculo_proprietarios')
    .select('id, veiculo_id, cliente_anterior_id, cliente_novo_id, nome_anterior, nome_novo, tipo, created_at')
    .eq('oficina_id', oficinaId).order('created_at', { ascending: false })
  if (error) throw error
  return data as ProprietarioEvento[]
}

export function transferErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  return 'Não foi possível concluir a operação. Tente novamente.'
}
