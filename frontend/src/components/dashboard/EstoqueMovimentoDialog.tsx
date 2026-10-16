import { useEffect,useRef,useState } from 'react'
import { erroEstoque,listEstoqueMovimentos,movimentarEstoque,numeroEstoque,type MovimentoEstoque,type Produto } from '../../services/estoque'
import RegistroAutoria from './RegistroAutoria'

const qty=(value:number)=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:3})
const labels:Record<string,string>={saldo_inicial:'Saldo inicial',entrada:'Entrada',saida:'Saída',ajuste:'Ajuste'}
export default function EstoqueMovimentoDialog({produto,onClose,onUpdated}:{produto:Produto;onClose:()=>void;onUpdated:(produto:Produto)=>void}) {
  const [tipo,setTipo]=useState<'entrada'|'saida'|'ajuste'>('entrada')
  const [quantidade,setQuantidade]=useState('')
  const [motivo,setMotivo]=useState('')
  const [busy,setBusy]=useState(false)
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [events,setEvents]=useState<MovimentoEstoque[]>([])
  const [hasMore,setHasMore]=useState(false)
  const [revision,setRevision]=useState(0)
  const dialogRef=useRef<HTMLDialogElement>(null)
  const generation=useRef(0)
  useEffect(()=>{
    const dialog=dialogRef.current
    dialog?.showModal()
    return ()=>dialog?.close()
  },[produto.id])
  useEffect(()=>{
    generation.current+=1
    let active=true
    setLoading(true);setError('')
    listEstoqueMovimentos(produto.id).then((items)=>{if(active){setEvents(items);setHasMore(items.length===50)}})
      .catch(()=>{if(active)setError('Não foi possível carregar as movimentações.')}).finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false;generation.current+=1}
  },[produto.id,revision])
  async function handleSubmit(event:React.FormEvent){
    event.preventDefault()
    if(busy)return
    setBusy(true);setMessage('')
    try{
      const result=await movimentarEstoque(produto.id,tipo,numeroEstoque(quantidade),motivo)
      onUpdated(result);setQuantidade('');setMotivo('');setMessage('Movimentação registrada e saldo atualizado.');setRevision((value)=>value+1)
    }catch(failure){setMessage(erroEstoque(failure))}finally{setBusy(false)}
  }
  async function loadMore(){
    if(loading)return
    const requestGeneration=generation.current
    setLoading(true);setError('')
    try{const items=await listEstoqueMovimentos(produto.id,events.at(-1));if(requestGeneration!==generation.current)return;setEvents((current)=>[...current,...items]);setHasMore(items.length===50)}
    catch{if(requestGeneration===generation.current)setError('Não foi possível carregar mais movimentações.')}finally{if(requestGeneration===generation.current)setLoading(false)}
  }
  return <dialog ref={dialogRef} aria-labelledby="movimento-titulo" onCancel={(event)=>{event.preventDefault();if(!busy)onClose()}} className="fixed inset-0 z-50 m-auto max-h-[92vh] w-[95vw] max-w-2xl overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-slate-950/60">
    <section className="p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><h2 id="movimento-titulo" className="text-xl font-black">Estoque · {produto.nome}</h2><p className="mt-2 font-bold text-orange-700">Saldo atual: {qty(produto.quantidade)}</p></div><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">Fechar</button></div>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Operação<select value={tipo} onChange={(event)=>setTipo(event.target.value as typeof tipo)} disabled={busy} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3"><option value="entrada">Entrada de produtos</option><option value="saida">Saída de produtos</option><option value="ajuste">Ajustar saldo após contagem</option></select></label>
        <label className="text-sm font-bold">{tipo==='ajuste'?'Novo saldo contado':'Quantidade'}<input required inputMode="decimal" value={quantidade} onChange={(event)=>setQuantidade(event.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3" placeholder="Ex.: 2 ou 1,5"/></label>
        <label className="text-sm font-bold sm:col-span-2">Motivo<input required minLength={3} maxLength={300} value={motivo} onChange={(event)=>setMotivo(event.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3" placeholder="Ex.: compra de peças, uso na OS ou correção da contagem"/></label>
        <button disabled={busy} type="submit" className="rounded-lg bg-orange-600 px-4 py-3 font-black text-white disabled:opacity-50">{busy?'Registrando...':'Registrar movimentação'}</button>
      </form>
      {message?<p role="status" className="mt-4 rounded-lg bg-orange-50 p-3 text-sm font-bold text-orange-800">{message}</p>:null}
      <h3 className="mt-6 border-t border-slate-200 pt-5 text-lg font-black">Histórico de movimentações</h3>
      {error?<p role="alert" className="mt-3 text-sm text-red-700">{error} <button type="button" className="underline" onClick={()=>setRevision((value)=>value+1)}>Tentar novamente</button></p>:null}
      <div className="mt-4 space-y-3">{events.map((item)=><article key={item.id} className="rounded-lg border border-slate-200 p-4"><div className="flex justify-between gap-2"><strong className="text-sm">{labels[item.tipo]}</strong><strong className="text-sm">{Number(item.saldo_depois)>Number(item.saldo_antes)?'+':'−'} {qty(item.quantidade)}</strong></div><p className="mt-2 text-sm">Saldo: {qty(item.saldo_antes)} → {qty(item.saldo_depois)}</p><p className="mt-1 break-words text-sm text-slate-600">{item.motivo}</p><time className="mt-2 block text-xs text-slate-500" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString('pt-BR')}</time><RegistroAutoria registro={item}/></article>)}</div>
      {loading?<p role="status" className="mt-3 text-sm">Carregando histórico...</p>:!events.length&&!error?<p className="mt-3 text-sm text-slate-500">Nenhuma movimentação registrada. O saldo inicial é zero.</p>:null}
      {hasMore&&!error?<button type="button" disabled={loading||busy} onClick={loadMore} className="mt-4 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Carregar anteriores</button>:null}
    </section>
  </dialog>
}
