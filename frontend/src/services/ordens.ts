import type { AutoriaRegistro } from './equipe'
import { supabase } from '../lib/supabase'

export type OrdemServico = AutoriaRegistro & {
  id: string
  cliente_id: string | null
  veiculo_id: string | null
  titulo: string
  descricao: string | null
  status: string
  pagamento_status: string
  nota_status: string
  nota_numero: string | null
  nota_emitida_em: string | null
  valor: number
  valor_servico: number
  valor_pago: number
  mecanico_ids: string[]
  mecanico_divisao: Record<string, number>
  comissao_percentual: number
  created_at: string
  entrada_em?: string | null
}

export type OrdemPeca = AutoriaRegistro & {
  id: string
  ordem_id: string
  descricao: string
  quantidade: number
  valor_unitario: number
  created_at: string
}

type CreateOrdemPecaParams = {
  descricao: string
  quantidade?: string
  valorUnitario?: string
}

type CreateOrdemParams = {
  oficinaId: string
  clienteId: string
  veiculoId: string
  titulo: string
  descricao?: string
  pecas?: CreateOrdemPecaParams[]
  status: string
  valor?: string
  mecanicoIds?: string[]
  mecanicoDivisao?: Record<string, number>
  comissaoPercentual: number
  entradaEm?: string
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

type UpdateOrdemNotaParams = {
  ordemId: string
  notaNumero?: string
  notaStatus: string
}

const ordemSelect =
  'id, cliente_id, veiculo_id, titulo, descricao, status, pagamento_status, nota_status, nota_numero, nota_emitida_em, valor, valor_servico, valor_pago, mecanico_ids, mecanico_divisao, comissao_percentual, created_at, entrada_em, criado_por, alterado_por, alterado_em'

function parseMoney(value?: string) {
  if (!value) {
    return 0
  }

  const parsedValue = Number(value.replace(',', '.'))
  return Number.isNaN(parsedValue) ? 0 : parsedValue
}

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

export async function getOrdem(ordemId: string) {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select(ordemSelect)
    .eq('id', ordemId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function listOrdemPecas(ordemId: string) {
  const { data, error } = await supabase
    .from('ordem_pecas')
    .select('id, ordem_id, descricao, quantidade, valor_unitario, created_at, criado_por, alterado_por, alterado_em')
    .eq('ordem_id', ordemId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function createOrdem({
  clienteId,
  descricao,
  oficinaId,
  pecas = [],
  status,
  titulo,
  valor,
  veiculoId,
  mecanicoIds = [],
  mecanicoDivisao = {},
  comissaoPercentual,
  entradaEm,
}: CreateOrdemParams) {
  if (entradaEm !== undefined && !Number.isFinite(Date.parse(entradaEm))) throw new Error('Informe a data e hora de entrada do veículo.')
  if (!Number.isInteger(comissaoPercentual) || comissaoPercentual < 1 || comissaoPercentual > 100) {
    throw new Error('Informe a comissão entre 1% e 100%.')
  }
  const valorServico = parseMoney(valor)
  const parsedPecas = pecas
    .filter((peca) => peca.descricao.trim())
    .map((peca) => ({
      descricao: peca.descricao.trim(),
      quantidade: parseMoney(peca.quantidade) || 1,
      valor_unitario: parseMoney(peca.valorUnitario),
    }))
  const valorPecas = parsedPecas.reduce(
    (total, peca) => total + peca.quantidade * peca.valor_unitario,
    0,
  )
  const valorTotal = valorServico + valorPecas

  const { data, error } = await supabase
    .from('ordens_servico')
    .insert({
      cliente_id: clienteId,
      descricao: descricao || null,
      oficina_id: oficinaId,
      pagamento_status: 'em_aberto',
      nota_status: 'pendente',
      status,
      titulo,
      valor: valorTotal,
      valor_servico: valorServico,
      valor_pago: 0,
      veiculo_id: veiculoId,
      mecanico_ids: [...new Set(mecanicoIds)].sort(),
      mecanico_divisao: mecanicoDivisao,
      comissao_percentual: comissaoPercentual,
      ...(entradaEm !== undefined ? { entrada_em: entradaEm } : {}),
    })
    .select(ordemSelect)
    .single()

  if (error) {
    throw error
  }

  if (parsedPecas.length > 0) {
    const { error: pecasError } = await supabase.from('ordem_pecas').insert(
      parsedPecas.map((peca) => ({
        ...peca,
        oficina_id: oficinaId,
        ordem_id: data.id,
      })),
    )

    if (pecasError) {
      throw pecasError
    }
  }

  return data
}

export async function updateOrdem({ ordemId, titulo, descricao, status, valor, pecas = [], mecanicoIds = [], mecanicoDivisao = {}, comissaoPercentual, entradaEm }: Omit<CreateOrdemParams, 'clienteId' | 'veiculoId' | 'oficinaId'> & { ordemId: string }) {
  if (entradaEm !== undefined && !Number.isFinite(Date.parse(entradaEm))) throw new Error('Informe a data e hora de entrada do veículo.')
  const valorServico = Number((valor || '0').replace(',', '.'))
  if (!titulo.trim() || !Number.isFinite(valorServico) || valorServico < 0) throw new Error('Informe o serviço e um valor de mão de obra válido.')
  if (!Number.isInteger(comissaoPercentual) || comissaoPercentual < 1 || comissaoPercentual > 100) throw new Error('Informe a comissão entre 1% e 100%.')
  const parsedPecas = pecas.map((peca) => ({
    descricao: peca.descricao.trim(),
    quantidade: Number((peca.quantidade || '1').replace(',', '.')),
    valor_unitario: Number((peca.valorUnitario || '0').replace(',', '.')),
  }))
  if (parsedPecas.some((peca) => !peca.descricao || !Number.isFinite(peca.quantidade) || peca.quantidade <= 0
    || !Number.isFinite(peca.valor_unitario) || peca.valor_unitario < 0)) throw new Error('Confira a descrição, a quantidade e o valor das peças.')
  const { data, error } = await supabase.rpc(entradaEm === undefined ? 'editar_ordem' : 'editar_ordem_com_entrada', {
    p_ordem_id: ordemId, p_titulo: titulo.trim(), p_descricao: descricao || '', p_status: status,
    p_valor_servico: valorServico, p_pecas: parsedPecas, p_mecanico_ids: [...new Set(mecanicoIds)].sort(),
    p_mecanico_divisao: mecanicoDivisao, p_comissao_percentual: comissaoPercentual,
    ...(entradaEm !== undefined ? { p_entrada_em: entradaEm } : {}),
  }).single()
  if (error) throw error
  return data as OrdemServico
}

export async function updateOrdemNota({
  notaNumero,
  notaStatus,
  ordemId,
}: UpdateOrdemNotaParams) {
  const updatePayload = {
    nota_emitida_em: notaStatus === 'emitida' ? new Date().toISOString() : null,
    nota_numero: notaStatus === 'emitida' ? notaNumero || null : null,
    nota_status: notaStatus,
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
