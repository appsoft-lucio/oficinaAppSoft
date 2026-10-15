import { supabase } from '../lib/supabase'
import type { AutoriaRegistro } from './equipe'

export type Lancamento = AutoriaRegistro & {
  id: string; tipo: 'receita' | 'despesa'; categoria: string; descricao: string; valor: number
  data: string; origem: 'manual' | 'ordem'; ordem_id: string | null; mecanico_id: string | null
  cancelado: boolean; data_estimada: boolean
}
export type LancamentoInput = {
  tipo: Lancamento['tipo']; categoria: string; descricao: string; valor: number; data: string; mecanico_id: string | null
}
const select = 'id, tipo, categoria, descricao, valor, data, origem, ordem_id, mecanico_id, cancelado, data_estimada, criado_por, alterado_por, alterado_em'

export async function listLancamentos(oficinaId: string) {
  const all: Lancamento[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('lancamentos_financeiros').select(select)
      .eq('oficina_id', oficinaId).order('data', { ascending: false }).order('id').range(offset, offset + 999)
    if (error) throw error
    all.push(...data as Lancamento[])
    if (data.length < 1000) return all
  }
}

export async function saveLancamento(oficinaId: string, input: LancamentoInput, id?: string) {
  if (!input.descricao.trim() || !Number.isFinite(input.valor) || input.valor <= 0) throw new Error('Informe descrição e valor maior que zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.data)) throw new Error('Informe a data do lançamento.')
  const payload = { ...input, descricao: input.descricao.trim(), valor: Math.round(input.valor * 100) / 100 }
  const query = id
    ? supabase.from('lancamentos_financeiros').update(payload).eq('id', id).eq('oficina_id', oficinaId).eq('origem', 'manual')
    : supabase.from('lancamentos_financeiros').insert({ ...payload, oficina_id: oficinaId })
  const { error } = await query.select('id').single()
  if (error) throw error
}

export async function cancelarLancamento(oficinaId: string, id: string, cancelado: boolean) {
  const { error } = await supabase.from('lancamentos_financeiros').update({ cancelado })
    .eq('oficina_id', oficinaId).eq('id', id).eq('origem', 'manual').select('id').single()
  if (error) throw error
}

export function resumirCaixa(lancamentos: Lancamento[]) {
  let receitas = 0, despesas = 0, repasses = 0
  for (const item of lancamentos) {
    if (item.cancelado) continue
    const cents = Math.round(Number(item.valor) * 100)
    if (item.categoria === 'estorno_recebimento') receitas -= cents
    else if (item.tipo === 'receita') receitas += cents
    else if (item.categoria === 'repasse_mecanico') repasses += cents
    else despesas += cents
  }
  return { receitas: receitas / 100, despesas: despesas / 100, repasses: repasses / 100, saldo: (receitas - despesas - repasses) / 100 }
}
