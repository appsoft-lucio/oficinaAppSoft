import { useEffect, useMemo, useRef, useState } from 'react'
import { cancelarLancamento, listLancamentos, resumirCaixa, saveLancamento, type Lancamento } from '../../services/caixa'
import type { Mecanico } from '../../services/mecanicos'
import RegistroAutoria from './RegistroAutoria'
import SummaryCard from './SummaryCard'

const categorias: Record<string, string> = {
  outras_receitas: 'Receita extra', repasse_mecanico: 'Repasse ao mecânico', pecas: 'Compra de peças',
  aluguel: 'Aluguel', contas: 'Contas e serviços', impostos: 'Impostos', outras_despesas: 'Outras despesas',
  recebimento_ordem: 'Recebimento de ordem', estorno_recebimento: 'Estorno de recebimento',
}
const dinheiro = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
function hoje() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

type Props = { oficinaId: string; mecanicos: Mecanico[]; start: string | null; end: string | null; revision: unknown; invalidPeriod: boolean }

export default function CaixaPanel({ oficinaId, mecanicos, start, end, revision, invalidPeriod }: Props) {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<string | undefined>()
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')
  const [categoria, setCategoria] = useState('outras_despesas')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(hoje)
  const [mecanicoId, setMecanicoId] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listLancamentos(oficinaId).then((items) => {
      if (!cancelled) { setLancamentos(items); setLoadError(false) }
    }).catch(() => { if (!cancelled) setLoadError(true) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [oficinaId, revision])

  const filtered = useMemo(() => lancamentos.filter((item) => (!start || item.data >= start) && (!end || item.data <= end)), [lancamentos, start, end])
  const resumo = resumirCaixa(filtered)
  const acumulado = resumirCaixa(lancamentos)
  const visible = filtered.filter((item) => showCancelled || !item.cancelado)
  const estimated = lancamentos.some((item) => item.data_estimada && !item.cancelado)

  function resetForm() {
    setEditing(undefined); setDescricao(''); setValor(''); setMecanicoId(''); setData(hoje())
  }
  async function refresh() {
    try { setLancamentos(await listLancamentos(oficinaId)); setLoadError(false) }
    catch { setLoadError(true); throw new Error('Operação salva, mas não foi possível atualizar o saldo. Recarregue a página.') }
  }
  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    try {
      await saveLancamento(oficinaId, { tipo, categoria, descricao, valor: Number(valor.replace(',', '.')), data, mecanico_id: categoria === 'repasse_mecanico' ? mecanicoId : null }, editing)
      resetForm()
      await refresh()
      setMessage('Lançamento salvo. O resultado da oficina foi atualizado.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar o lançamento.') }
    finally { setBusy(false) }
  }
  async function handleCancel(item: Lancamento) {
    if (busy) return
    setBusy(true)
    try {
      await cancelarLancamento(oficinaId, item.id, !item.cancelado)
      if (editing === item.id) resetForm()
      await refresh()
      setMessage(item.cancelado ? 'Lançamento reativado.' : 'Lançamento cancelado. O histórico foi preservado.')
    } catch { setMessage('Não foi possível atualizar a listagem. Recarregue a página para conferir a operação.') }
    finally { setBusy(false) }
  }
  function edit(item: Lancamento) {
    setEditing(item.id); setTipo(item.tipo); setCategoria(item.categoria); setDescricao(item.descricao)
    setValor(Number(item.valor).toFixed(2).replace('.', ',')); setData(item.data); setMecanicoId(item.mecanico_id ?? '')
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
  const input = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3'
  return (
    <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-black">Receitas, despesas e resultado da oficina</h2>
      <p className="mt-2 text-sm text-slate-600">Receitas recebidas − despesas pagas − repasses pagos = resultado do período. O filtro de período acima considera a data de cada movimentação. Cliente, carro e pagamento filtram somente as ordens abaixo.</p>
      <p className="mt-2 text-sm text-slate-600">Recebimentos das ordens entram automaticamente. Cadastre receitas extras e despesas quando o dinheiro entrar ou sair, incluindo os repasses aos mecânicos e os custos das peças.</p>
      {message ? <p role="status" className="mt-4 rounded-lg bg-orange-50 p-4 text-sm font-bold text-orange-800">{message}</p> : null}
      {loading ? <p className="mt-4">Carregando movimentações...</p> : loadError ? <p role="alert" className="mt-4 text-red-700">Não foi possível carregar o caixa. Recarregue a página antes de consultar o resultado.</p> : invalidPeriod ? <p role="alert" className="mt-4 text-red-700">Informe um período válido, com início anterior ou igual ao fim.</p> : <>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Receitas recebidas" value={dinheiro(resumo.receitas)} detail="Ordens + extras − estornos" />
          <SummaryCard label="Despesas pagas" value={dinheiro(resumo.despesas)} detail="Peças, contas e outras despesas" />
          <SummaryCard label="Repasses pagos" value={dinheiro(resumo.repasses)} detail="Pagamentos registrados aos mecânicos" />
          <SummaryCard label="Resultado do período" value={dinheiro(resumo.saldo)} detail={resumo.saldo < 0 ? 'Saídas maiores que entradas' : 'Após despesas e repasses pagos'} />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-700">Acumulado de todas as movimentações registradas: {dinheiro(acumulado.saldo)}</p>
        {estimated ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Os recebimentos anteriores à ativação do caixa usam a data de abertura da ordem como estimativa. Os novos recebimentos usam a data da atualização do pagamento.</p> : null}
      </>}
      <form ref={formRef} className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 xl:grid-cols-3" onSubmit={handleSave}>
        <h3 className="font-black sm:col-span-2 xl:col-span-3">{editing ? 'Editar lançamento' : 'Novo lançamento'}</h3>
        <label className="text-sm font-bold">Tipo<select className={input} value={tipo} disabled={busy} onChange={(event) => { const next = event.target.value as 'receita' | 'despesa'; setTipo(next); setCategoria(next === 'receita' ? 'outras_receitas' : 'outras_despesas'); setMecanicoId('') }}><option value="receita">Receita extra recebida</option><option value="despesa">Despesa paga</option></select></label>
        <label className="text-sm font-bold">Categoria<select className={input} value={categoria} disabled={busy} onChange={(event) => setCategoria(event.target.value)}>{Object.entries(categorias).filter(([key]) => tipo === 'receita' ? key === 'outras_receitas' : ['repasse_mecanico','pecas','aluguel','contas','impostos','outras_despesas'].includes(key)).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        <label className="text-sm font-bold">Data do recebimento ou pagamento<input type="date" required className={input} disabled={busy} value={data} max={hoje()} onChange={(event) => setData(event.target.value)} /></label>
        <label className="text-sm font-bold">Descrição<input required maxLength={300} className={input} disabled={busy} value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Ex.: aluguel ou repasse da semana" /></label>
        <label className="text-sm font-bold">Valor (R$)<input required inputMode="decimal" className={input} disabled={busy} value={valor} onChange={(event) => setValor(event.target.value)} placeholder="0,00" /></label>
        {categoria === 'repasse_mecanico' ? <label className="text-sm font-bold">Mecânico<select required className={input} disabled={busy} value={mecanicoId} onChange={(event) => setMecanicoId(event.target.value)}><option value="">Selecione o mecânico</option>{mecanicos.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label> : null}
        <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-3"><button disabled={busy || loading || loadError} type="submit" className="rounded-lg bg-orange-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar lançamento'}</button>{editing ? <button type="button" disabled={busy} onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-3 font-bold">Cancelar edição</button> : null}</div>
      </form>
      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex flex-wrap justify-between gap-3"><h3 className="font-black">Movimentações do período</h3><label className="text-sm"><input type="checkbox" checked={showCancelled} onChange={(event) => setShowCancelled(event.target.checked)} /> Mostrar cancelados</label></div>
        {!loading && !loadError && !invalidPeriod ? <div className="mt-4 grid gap-3">{visible.length ? visible.map((item) => <article key={item.id} className={`rounded-xl border border-slate-200 p-4 ${item.cancelado ? 'opacity-60' : ''}`}>
          <div className="flex flex-wrap justify-between gap-2"><strong>{item.descricao}</strong><strong className={item.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'}>{item.tipo === 'receita' ? '+' : '−'} {dinheiro(Number(item.valor))}{item.cancelado ? ' (cancelado)' : ''}</strong></div>
          <p className="mt-1 text-sm text-slate-600">{new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')} · {categorias[item.categoria]}{item.mecanico_id ? ` · ${mecanicos.find((m) => m.id === item.mecanico_id)?.nome ?? 'Mecânico'}` : ''}{item.data_estimada ? ' · Data estimada' : ''}</p>
          <RegistroAutoria registro={item} />
          {item.origem === 'manual' ? <div className="mt-3 flex gap-3">{!item.cancelado ? <button type="button" disabled={busy} onClick={() => edit(item)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">Editar</button> : null}<button type="button" disabled={busy} onClick={() => handleCancel(item)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">{item.cancelado ? 'Reativar lançamento' : 'Cancelar lançamento'}</button></div> : <p className="mt-2 text-xs text-slate-500">Gerado automaticamente. Para corrigir, atualize o pagamento na ordem de serviço.</p>}
        </article>) : <p className="text-sm text-slate-500">Nenhuma movimentação neste período.</p>}</div> : null}
      </div>
    </section>
  )
}
