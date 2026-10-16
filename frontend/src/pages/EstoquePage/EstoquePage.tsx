import { useEffect,useMemo,useRef,useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import SummaryCard from '../../components/dashboard/SummaryCard'
import RegistroAutoria from '../../components/dashboard/RegistroAutoria'
import ProdutoFoto from '../../components/dashboard/ProdutoFoto'
import EstoqueMovimentoDialog from '../../components/dashboard/EstoqueMovimentoDialog'
import { supabase } from '../../lib/supabase'
import { ensureUserOficina,type Oficina } from '../../services/oficinas'
import { erroEstoque,listProdutos,numeroEstoque,removeFotoProduto,saveProduto,uploadFotoProduto,validarFotoProduto,type Produto } from '../../services/estoque'

const moeda=(value:number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const qty=(value:number)=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:3})
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

export default function EstoquePage(){
  const [oficina,setOficina]=useState<Oficina|null>(null)
  const [produtos,setProdutos]=useState<Produto[]>([])
  const [loading,setLoading]=useState(true)
  const [loadError,setLoadError]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const [isMenuOpen,setIsMenuOpen]=useState(false)
  const [editing,setEditing]=useState<Produto|null>(null)
  const [selected,setSelected]=useState<Produto|null>(null)
  const [draftId,setDraftId]=useState(()=>crypto.randomUUID())
  const [nome,setNome]=useState('')
  const [descricao,setDescricao]=useState('')
  const [codigo,setCodigo]=useState('')
  const [preco,setPreco]=useState('0,00')
  const [quantidade,setQuantidade]=useState('0')
  const [minimo,setMinimo]=useState('0')
  const [photo,setPhoto]=useState<File|null>(null)
  const [preview,setPreview]=useState('')
  const [removePhoto,setRemovePhoto]=useState(false)
  const [search,setSearch]=useState('')
  const [stockFilter,setStockFilter]=useState('todos')
  const [limit,setLimit]=useState(24)
  const formRef=useRef<HTMLFormElement>(null)
  const fileRef=useRef<HTMLInputElement>(null)
  useEffect(()=>{
    let active=true
    async function load(){
      const {data:auth,error}=await supabase.auth.getUser()
      if(error||!auth.user)throw new Error('Entre na sua conta para acessar o estoque.')
      const workshop=await ensureUserOficina({userId:auth.user.id})
      const items=await listProdutos(workshop.id)
      if(active){setOficina(workshop);setProdutos(items)}
    }
    load().catch(()=>{if(active)setLoadError('Não foi possível carregar o estoque. Recarregue a página para tentar novamente.')}).finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[])
  useEffect(()=>{
    if(!photo){setPreview('');return}
    const url=URL.createObjectURL(photo);setPreview(url)
    return ()=>URL.revokeObjectURL(url)
  },[photo])
  const filtered=useMemo(()=>produtos.filter((item)=>{
    const matches=normalize(`${item.nome} ${item.codigo_serie??''} ${item.descricao??''}`).includes(normalize(search.trim()))
    return matches&&(stockFilter==='todos'||(stockFilter==='zerado'?Number(item.quantidade)===0:Number(item.quantidade)<=Number(item.estoque_minimo)))
  }).sort((a,b)=>a.nome.localeCompare(b.nome)),[produtos,search,stockFilter])
  function resetForm(){
    setEditing(null);setDraftId(crypto.randomUUID());setNome('');setDescricao('');setCodigo('');setPreco('0,00');setQuantidade('0');setMinimo('0');setPhoto(null);setRemovePhoto(false)
    if(fileRef.current)fileRef.current.value=''
  }
  function edit(item:Produto){
    setEditing(item);setNome(item.nome);setDescricao(item.descricao??'');setCodigo(item.codigo_serie??'');setPreco(Number(item.preco).toFixed(2).replace('.',','))
    setMinimo(String(item.estoque_minimo).replace('.',','));setPhoto(null);setRemovePhoto(false);setMessage('')
    if(fileRef.current)fileRef.current.value=''
    formRef.current?.scrollIntoView({block:'start'});formRef.current?.querySelector<HTMLInputElement>('input')?.focus({preventScroll:true})
  }
  function updateProduto(item:Produto){
    setProdutos((current)=>current.some((old)=>old.id===item.id)?current.map((old)=>old.id===item.id?item:old):[item,...current])
    setSelected((current)=>current?.id===item.id?item:current)
    setEditing((current)=>current?.id===item.id?item:current)
  }
  async function handleSubmit(event:React.FormEvent){
    event.preventDefault()
    if(!oficina||busy)return
    setBusy(true);setMessage('')
    try{
      const price=numeroEstoque(preco,2),minimum=numeroEstoque(minimo),initial=editing?undefined:numeroEstoque(quantidade)
      const id=editing?.id??draftId
      let path=removePhoto?null:editing?.foto_path??null
      if(photo)path=await uploadFotoProduto(oficina.id,id,photo)
      const result=await saveProduto(oficina.id,id,{nome,descricao,codigo_serie:codigo,preco:price,estoque_minimo:minimum,foto_path:path},initial)
      updateProduto(result)
      const oldPath=editing?.foto_path
      resetForm();setMessage(editing?'Produto atualizado.':'Produto cadastrado com saldo inicial registrado.')
      if(oldPath&&oldPath!==path)void removeFotoProduto(oldPath).catch(()=>undefined)
    }catch(error){setMessage(erroEstoque(error))}finally{setBusy(false)}
  }
  const input='mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
  const disabled=busy||loading||Boolean(loadError)
  return <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
    <div className="hidden lg:block"><DashboardSidebar oficinaName={oficina?.nome??'Minha Oficina'}/></div>
    {isMenuOpen?<div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/60" onClick={()=>setIsMenuOpen(false)}/><div className="relative h-full w-[min(82vw,320px)] overflow-y-auto"><button type="button" className="absolute right-3 top-3 rounded bg-white/10 px-3 py-2 text-white" onClick={()=>setIsMenuOpen(false)}>Fechar</button><DashboardSidebar oficinaName={oficina?.nome??'Minha Oficina'}/></div></div>:null}
    {selected?<EstoqueMovimentoDialog key={selected.id} produto={selected} onClose={()=>setSelected(null)} onUpdated={updateProduto}/>:null}
    <section className="min-w-0">
      <DashboardTopbar eyebrow="Produtos e peças" title="Controle de estoque" onOpenMenu={()=>setIsMenuOpen(true)}/>
      <div className="space-y-6 px-5 py-6 sm:px-8">
        {loading?<p role="status">Carregando estoque...</p>:loadError?<p role="alert" className="rounded-xl bg-orange-50 p-4 font-bold text-orange-800">{loadError}</p>:<section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Produtos cadastrados" value={String(produtos.length)} detail="Cadastro da oficina"/>
          <SummaryCard label="Com estoque" value={String(produtos.filter((item)=>Number(item.quantidade)>0).length)} detail="Produtos com saldo disponível"/>
          <SummaryCard label="Estoque baixo" value={String(produtos.filter((item)=>Number(item.quantidade)<=Number(item.estoque_minimo)).length)} detail="Saldo no mínimo ou abaixo"/>
        </section>}
        {message?<p role="status" className="rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-800">{message}</p>:null}
        <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">{editing?'Editar produto':'Cadastrar produto'}</h2>
            <label className="block text-sm font-bold">Nome do produto<input required maxLength={140} value={nome} disabled={disabled} onChange={(event)=>setNome(event.target.value)} className={input} placeholder="Ex.: filtro de óleo"/></label>
            <label className="block text-sm font-bold">Código / número de série<input maxLength={80} value={codigo} disabled={disabled} onChange={(event)=>setCodigo(event.target.value)} className={input} placeholder="Opcional · único na oficina"/></label>
            <p className="text-xs text-slate-500">Para unidades com números de série diferentes, faça um cadastro para cada uma. Para itens vendidos por quantidade, use o código do produto.</p>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold">Preço de venda (R$)<input required inputMode="decimal" value={preco} disabled={disabled} onChange={(event)=>setPreco(event.target.value)} className={input}/></label><label className="block text-sm font-bold">Estoque mínimo<input required inputMode="decimal" value={minimo} disabled={disabled} onChange={(event)=>setMinimo(event.target.value)} className={input}/></label></div>
            {editing?<p className="rounded-lg bg-slate-50 p-3 text-sm">Saldo atual: <strong>{qty(editing.quantidade)}</strong>. Use “Movimentar / histórico” para registrar entradas, saídas ou ajustes.</p>:<label className="block text-sm font-bold">Quantidade inicial<input required inputMode="decimal" value={quantidade} disabled={disabled} onChange={(event)=>setQuantidade(event.target.value)} className={input}/><span className="mt-1 block text-xs font-normal text-slate-500">Aceita até 3 casas decimais. Ex.: 10 ou 1,5.</span></label>}
            <label className="block text-sm font-bold">Descrição<textarea maxLength={1000} value={descricao} disabled={disabled} onChange={(event)=>setDescricao(event.target.value)} className={`${input} min-h-24`} placeholder="Aplicação, marca ou observações"/></label>
            <label className="block text-sm font-bold">Foto do produto<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="mt-2 block w-full text-xs" onChange={(event)=>{
              const file=event.target.files?.[0]
              if(!file){setPhoto(null);return}
              try{validarFotoProduto(file,false);setPhoto(file);setRemovePhoto(false);setMessage('')}catch(error){setMessage(erroEstoque(error));event.target.value='';setPhoto(null)}
            }}/><span className="mt-2 block text-xs font-normal text-slate-500">JPG, PNG ou WebP. Fotos maiores que 5 MB são reduzidas automaticamente ao salvar.</span></label>
            {preview?<img src={preview} alt="Prévia da foto selecionada" className="h-40 w-full rounded-lg bg-slate-50 object-contain"/>:editing?.foto_path&&!removePhoto?<ProdutoFoto path={editing.foto_path} nome={editing.nome}/>:null}
            {editing?.foto_path?<label className="block text-sm"><input type="checkbox" checked={removePhoto} disabled={disabled} onChange={(event)=>{setRemovePhoto(event.target.checked);if(event.target.checked){setPhoto(null);if(fileRef.current)fileRef.current.value=''}}}/> Remover a foto atual ao salvar</label>:null}
            <button disabled={disabled} type="submit" className="min-h-12 w-full rounded-lg bg-orange-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy?'Salvando...':editing?'Salvar alterações':'Cadastrar produto'}</button>
            {editing?<button type="button" disabled={busy} onClick={resetForm} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Cancelar edição</button>:null}
          </form>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Produtos em estoque</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]"><input aria-label="Buscar por nome, código ou série" value={search} onChange={(event)=>{setSearch(event.target.value);setLimit(24)}} className={input} placeholder="Buscar por nome, código ou série"/><select aria-label="Filtrar saldo de estoque" value={stockFilter} onChange={(event)=>{setStockFilter(event.target.value);setLimit(24)}} className={input}><option value="todos">Todos os saldos</option><option value="baixo">Estoque baixo</option><option value="zerado">Sem estoque</option></select></div>
            <p className="mt-3 text-xs text-slate-500">{filtered.length} produto(s) encontrado(s). Registre as saídas de peças utilizadas para manter o saldo atualizado.</p>
            {!loading&&!loadError?<div className="mt-5 grid gap-4 sm:grid-cols-2">{filtered.slice(0,limit).map((item)=><article key={item.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
              <ProdutoFoto path={item.foto_path} nome={item.nome}/><h3 className="mt-3 break-words font-black">{item.nome}</h3><p className="mt-1 break-all text-xs text-slate-500">Código / série: {item.codigo_serie??'Não informado'}</p>
              <div className="mt-3 flex flex-wrap justify-between gap-2"><strong>{moeda(item.preco)}</strong><strong className={Number(item.quantidade)<=Number(item.estoque_minimo)?'text-red-700':'text-emerald-700'}>Saldo: {qty(item.quantidade)}</strong></div>
              <p className="mt-1 text-xs text-slate-500">Mínimo: {qty(item.estoque_minimo)}{Number(item.quantidade)===0?' · Sem estoque':Number(item.quantidade)<=Number(item.estoque_minimo)?' · Estoque baixo':''}</p>
              {item.descricao?<p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600">{item.descricao}</p>:null}<RegistroAutoria registro={item}/>
              <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>edit(item)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold">Editar</button><button type="button" disabled={busy} onClick={()=>setSelected(item)} className="min-h-10 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white">Movimentar / histórico</button></div>
            </article>)}</div>:null}
            {!loading&&!loadError&&!filtered.length?<p className="mt-5 text-sm text-slate-500">Nenhum produto encontrado. Cadastre o primeiro produto ou ajuste a busca.</p>:null}
            {filtered.length>limit?<button type="button" onClick={()=>setLimit((value)=>value+24)} className="mt-5 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Mostrar mais produtos</button>:null}
          </section>
        </div>
      </div>
    </section>
  </main>
}
