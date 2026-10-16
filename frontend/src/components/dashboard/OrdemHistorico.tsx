import { useEffect, useRef, useState } from 'react'
import type { OrdemServico } from '../../services/ordens'
import { formatOrdemDate, listOrdemEventos, statusOrdemLabels, type OrdemEvento } from '../../services/ordemHistorico'

const campos: Record<string,string> = {
  entrada_em: 'Entrada do veículo', titulo: 'Serviço', descricao: 'Descrição', status: 'Status',
  valor: 'Valor total', valor_servico: 'Mão de obra', valor_pago: 'Valor recebido',
  pagamento_status: 'Pagamento', comissao_percentual: 'Comissão dos mecânicos',
  mecanico_ids: 'Mecânicos responsáveis', mecanico_divisao: 'Divisão do repasse',
  nota_status: 'Situação da nota', nota_numero: 'Número da nota', nota_emitida_em: 'Data da nota',
}
const estados: Record<string,string> = { em_aberto: 'Em aberto', parcial: 'Parcial', pago: 'Pago', pendente: 'Pendente', emitida: 'Emitida' }

function valorCampo(campo: string, value: unknown, mecanicos: Record<string,string>) {
  if (value === null || value === undefined || value === '') return 'Não informado'
  if (['entrada_em','nota_emitida_em'].includes(campo)) return formatOrdemDate(String(value))
  if (['valor','valor_servico','valor_pago'].includes(campo)) return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (campo === 'comissao_percentual') return `${value}%`
  if (campo === 'status') return statusOrdemLabels[String(value)] ?? String(value)
  if (['pagamento_status','nota_status'].includes(campo)) return estados[String(value)] ?? String(value)
  if (campo === 'mecanico_ids' && Array.isArray(value)) return value.map((id) => mecanicos[String(id)] ?? 'Mecânico não disponível').join(', ') || 'Nenhum'
  if (campo === 'mecanico_divisao' && typeof value === 'object') return Object.entries(value).map(([id, percent]) => `${mecanicos[id] ?? 'Mecânico não disponível'}: ${percent}%`).join(', ') || 'Não informada'
  return String(value)
}

export default function OrdemHistorico({ ordem, mecanicos = {} }: { ordem: OrdemServico; mecanicos?: Record<string,string> }) {
  const [open,setOpen] = useState(false)
  const [events,setEvents] = useState<OrdemEvento[]>([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [hasMore,setHasMore] = useState(false)
  const [retry,setRetry] = useState(0)
  const generation = useRef(0)
  useEffect(() => {
    generation.current += 1
    if (!open) return
    let cancelled = false
    setLoading(true); setError(''); setEvents([])
    listOrdemEventos(ordem.id).then((items) => {
      if (!cancelled) { setEvents(items); setHasMore(items.length === 50) }
    }).catch(() => { if (!cancelled) setError('Não foi possível carregar o histórico. Tente novamente.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true; generation.current += 1 }
  }, [open,ordem.id,ordem.alterado_em,retry])

  async function loadMore() {
    if (loading) return
    const requestGeneration = generation.current
    setLoading(true); setError('')
    try {
      const items = await listOrdemEventos(ordem.id,events.at(-1)?.id)
      if (requestGeneration !== generation.current) return
      setEvents((current) => [...current,...items]); setHasMore(items.length === 50)
    } catch { if (requestGeneration === generation.current) setError('Não foi possível carregar mais alterações.') }
    finally { if (requestGeneration === generation.current) setLoading(false) }
  }
  const id = `historico-os-${ordem.id}`
  return (
    <section className="mt-4 border-t border-slate-200 pt-3">
      <p className="text-sm font-bold text-slate-700">Entrada do veículo: {formatOrdemDate(ordem.entrada_em)}</p>
      <p className="mt-1 text-xs text-slate-500">OS cadastrada em {formatOrdemDate(ordem.created_at)}</p>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((current) => !current)} className="mt-3 min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700">{open ? 'Ocultar histórico da OS' : 'Ver histórico da OS'}</button>
      {open ? <div id={id} className="mt-4 space-y-3">
        <p className="text-xs text-slate-500">Da alteração mais recente à mais antiga. Horários exibidos no fuso deste dispositivo.</p>
        {error ? <p role="alert" className="text-sm text-red-700">{error} <button type="button" onClick={() => setRetry((current) => current+1)} className="underline">Recarregar histórico</button></p> : null}
        {events.map((event) => {
          const changedStatus = event.status_anterior !== event.status_novo && event.tipo === 'alteracao'
          const title = event.tipo === 'marco_inicial' ? `Histórico iniciado · ${statusOrdemLabels[event.status_novo] ?? event.status_novo}`
            : event.tipo === 'criacao' ? `OS cadastrada · ${statusOrdemLabels[event.status_novo] ?? event.status_novo}`
            : changedStatus ? `${statusOrdemLabels[event.status_anterior ?? ''] ?? event.status_anterior} → ${statusOrdemLabels[event.status_novo] ?? event.status_novo}` : 'Dados da OS atualizados'
          return <article key={event.id} className="rounded-lg border-l-4 border-orange-500 bg-slate-50 p-4">
            <h4 className="text-sm font-black text-slate-950">{title}</h4>
            <time dateTime={event.created_at} className="mt-1 block text-xs font-bold text-slate-600">{formatOrdemDate(event.created_at)}</time>
            <p className="mt-1 text-sm text-slate-600">{event.autor ? `${event.autor.nome} (${event.autor.perfil === 'dono' ? 'Dono' : 'Gerente'})` : event.tipo === 'marco_inicial' ? 'Situação existente na ativação do histórico. Alterações anteriores não estão disponíveis.' : 'Operação do sistema'}</p>
            {Object.entries(event.alteracoes).filter(([key]) => key !== 'status').map(([key,change]) => <p className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-600" key={key}><strong>{campos[key] ?? 'Dados da ordem'}:</strong> {valorCampo(key,change.antes,mecanicos)} → {valorCampo(key,change.depois,mecanicos)}</p>)}
          </article>
        })}
        {loading ? <p role="status" className="text-sm text-slate-500">Carregando histórico...</p> : !events.length && !error ? <p className="text-sm text-slate-500">Nenhuma alteração registrada.</p> : null}
        {hasMore && !error ? <button type="button" disabled={loading} onClick={loadMore} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold disabled:opacity-50">Carregar alterações anteriores</button> : null}
      </div> : null}
    </section>
  )
}
