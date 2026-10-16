import { supabase } from '../lib/supabase'
import type { AutorRegistro } from './equipe'

export const statusOrdemLabels: Record<string, string> = {
  aberta: 'Aberta', em_andamento: 'Em andamento', aguardando_peca: 'Aguardando peça', concluida: 'Concluída', cancelada: 'Cancelada',
}
export type OrdemEvento = {
  id: number; tipo: 'marco_inicial' | 'criacao' | 'alteracao'
  status_anterior: string | null; status_novo: string
  alteracoes: Record<string, { antes: unknown; depois: unknown }>
  autor: AutorRegistro | null; created_at: string
}
export async function listOrdemEventos(ordemId: string, beforeId?: number) {
  let query = supabase.from('ordem_eventos')
    .select('id, tipo, status_anterior, status_novo, alteracoes, autor, created_at')
    .eq('ordem_id', ordemId).order('id', { ascending: false }).limit(50)
  if (beforeId !== undefined) query = query.lt('id', beforeId)
  const { data, error } = await query
  if (error) throw error
  return data as OrdemEvento[]
}

export function toDateTimeInput(value: string | Date = new Date()) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (!Number.isFinite(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatOrdemDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }) : 'Não informada'
}
