import { supabase } from '../lib/supabase'

export type OrdemServico = {
  id: string
  cliente_id: string | null
  veiculo_id: string | null
  titulo: string
  descricao: string | null
  status: string
  pagamento_status: string
  valor: number
  valor_pago: number
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

type UpdateOrdemStatusParams = {
  ordemId: string
  status: string
}

type UpdateOrdemPagamentoStatusParams = {
  ordemId: string
  pagamentoStatus: string
  valorPago?: number
}

const ordemSelect =
  'id, cliente_id, veiculo_id, titulo, descricao, status, pagamento_status, valor, valor_pago, created_at'

export async function listOrdens(oficinaId: string) {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select(ordemSelect)
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
      pagamento_status: 'em_aberto',
      status,
      titulo,
      valor: Number.isNaN(parsedValor) ? 0 : parsedValor,
      valor_pago: 0,
      veiculo_id: veiculoId,
    })
    .select(ordemSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateOrdemStatus({ ordemId, status }: UpdateOrdemStatusParams) {
  const { data, error } = await supabase
    .from('ordens_servico')
    .update({ status })
    .eq('id', ordemId)
    .select(ordemSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateOrdemPagamentoStatus({
  ordemId,
  pagamentoStatus,
  valorPago,
}: UpdateOrdemPagamentoStatusParams) {
  const updatePayload: {
    pagamento_status: string
    valor_pago?: number
  } = {
    pagamento_status: pagamentoStatus,
  }

  if (valorPago !== undefined) {
    updatePayload.valor_pago = valorPago
  }

  const { data, error } = await supabase
    .from('ordens_servico')
    .update(updatePayload)
    .eq('id', ordemId)
    .select(ordemSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}
