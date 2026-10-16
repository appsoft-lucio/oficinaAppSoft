import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import SummaryCard from '../../components/dashboard/SummaryCard'
import RegistroAutoria from '../../components/dashboard/RegistroAutoria'
import OrdemHistorico from '../../components/dashboard/OrdemHistorico'
import { supabase } from '../../lib/supabase'
import { ensureUserOficina } from '../../services/oficinas'
import { comissaoServicoMecanico, getMecanicoHistorico, resumirHistoricoMecanico, type MecanicoHistoricoData } from '../../services/mecanicoHistorico'
import { formatOrdemDate, statusOrdemLabels } from '../../services/ordemHistorico'

const moeda=(value:number) => value.toLocaleString('pt-BR',{ style:'currency',currency:'BRL' })
const dia=(value:string) => new Date(value).toLocaleDateString('sv-SE')

export default function MecanicoHistoricoPage() {
  const { id }=useParams()
  const [data,setData]=useState<MecanicoHistoricoData|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [oficinaName,setOficinaName]=useState('Minha Oficina')
  const [isMenuOpen,setIsMenuOpen]=useState(false)
  const [start,setStart]=useState('')
  const [end,setEnd]=useState('')
  const [showCancelled,setShowCancelled]=useState(false)
  const [servicesLimit,setServicesLimit]=useState(20)
  const [paymentsLimit,setPaymentsLimit]=useState(20)
  const [revision,setRevision]=useState(0)
  useEffect(() => {
    let active=true
    setLoading(true);setError('');setData(null)
    async function load() {
      if(!id) throw new Error('Mecânico não encontrado.')
      const { data:auth,error:authError }=await supabase.auth.getUser()
      if(authError || !auth.user) throw new Error('Entre na sua conta para consultar o histórico.')
      const oficina=await ensureUserOficina({ userId:auth.user.id })
      const history=await getMecanicoHistorico(oficina.id,id)
      if(active) {setData(history);setOficinaName(oficina.nome)}
    }
    load().catch(() => {if(active) setError('Não foi possível carregar o histórico. Confira se o mecânico pertence à sua oficina e tente novamente.')})
      .finally(() => {if(active) setLoading(false)})
    return () => {active=false}
  },[id,revision])
  const invalid=Boolean(start && end && start>end)
  const filtered=useMemo(() => {
    const inside=(date:string) => (!start||date>=start)&&(!end||date<=end)
    return {
      servicos:(data?.servicos??[]).filter((item) => inside(dia(item.entrada_em??item.ordem_created_at))),
      pagamentos:(data?.pagamentos??[]).filter((item) => inside(item.data)),
    }
  },[data,start,end])
  const summary=resumirHistoricoMecanico(filtered.servicos,filtered.pagamentos)
  const total=data?resumirHistoricoMecanico(data.servicos,data.pagamentos):null
  const payments=filtered.pagamentos.filter((item) => showCancelled||!item.cancelado)
  const months=useMemo(() => {
    const grouped=new Map<string,number>()
    for(const item of filtered.pagamentos) if(!item.cancelado) {
      const month=item.data.slice(0,7)
      grouped.set(month,(grouped.get(month)??0)+Math.round(Number(item.valor)*100))
    }
    return [...grouped].sort(([a],[b]) => b.localeCompare(a))
  },[filtered.pagamentos])
  function changePeriod(nextStart:string,nextEnd:string) {
    setStart(nextStart);setEnd(nextEnd);setServicesLimit(20);setPaymentsLimit(20)
  }
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block"><DashboardSidebar oficinaName={oficinaName}/></div>
      {isMenuOpen?<div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/60" onClick={() => setIsMenuOpen(false)}/><div className="relative h-full w-[min(82vw,320px)] overflow-y-auto"><button type="button" className="absolute right-3 top-3 rounded bg-white/10 px-3 py-2 text-white" onClick={() => setIsMenuOpen(false)}>Fechar</button><DashboardSidebar oficinaName={oficinaName}/></div></div>:null}
      <section className="min-w-0">
        <DashboardTopbar eyebrow="Mecânicos" title="Histórico do mecânico" onOpenMenu={() => setIsMenuOpen(true)}>
          <Link to="/mecanicos" className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Voltar para mecânicos</Link>
          <button type="button" disabled={loading} onClick={() => setRevision((current) => current+1)} className="rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Atualizar histórico</button>
        </DashboardTopbar>
        <div className="space-y-6 px-5 py-6 sm:px-8">
          {loading?<p role="status">Carregando histórico do mecânico...</p>:error?<p role="alert" className="rounded-xl bg-orange-50 p-5 font-bold text-orange-800">{error}</p>:data?<>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-black">{data.mecanico.nome}</h2>
              <p className="mt-2 text-sm text-slate-600">Cadastrado em <strong>{formatOrdemDate(data.mecanico.created_at)}</strong></p>
              <p className="mt-1 text-sm text-slate-600">{data.mecanico.telefone||'Telefone não informado'} · {data.mecanico.email||'E-mail não informado'}</p>
              <RegistroAutoria registro={data.mecanico}/>
              <p className="mt-3 text-sm font-bold text-slate-700">Em todo o histórico: {total?.servicos} OS associada(s), {total?.veiculos} veículo(s) e {moeda(total?.recebido??0)} em repasses pagos.</p>
            </section>
            <section aria-label="Saldo acumulado de comissões" className="space-y-3">
              <h2 className="text-xl font-black">Comissões e recebimentos · todo o histórico</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Comissão total" value={moeda(total?.comissaoTotal??0)} detail="Participações atuais e anteriores; exclui canceladas"/>
                <SummaryCard label="Já recebida" value={moeda(total?.recebido??0)} detail="Repasses pagos; exclui lançamentos cancelados"/>
                <SummaryCard label="A receber" value={moeda(total?.aReceber??0)} detail="Comissão total menos o que já foi pago"/>
              </div>
              <p className="text-sm text-slate-600">Saldo acumulado de todos os registros, incluindo comissões previstas de OS em aberto. O filtro abaixo não altera esses três valores. Os repasses são abatidos do total do mecânico, sem presumir quitação de uma OS específica.</p>
              {(total?.adiantamento??0)>0?<p className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-900">Repasses acima da comissão registrada: {moeda(total?.adiantamento??0)}. O valor a receber fica em zero.</p>:null}
              {(total?.semComissao??0)>0?<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Há {total?.semComissao} participação(ões) antiga(s) sem valor de comissão disponível. O total e o saldo a receber consideram somente as comissões conhecidas e podem estar incompletos.</p>:null}
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-black">Consultar período</h2>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <label className="text-sm font-bold">De<input type="date" value={start} onChange={(event) => changePeriod(event.target.value,end)} className="mt-2 block rounded-lg border border-slate-300 px-3 py-3"/></label>
                <label className="text-sm font-bold">Até<input type="date" value={end} onChange={(event) => changePeriod(start,event.target.value)} className="mt-2 block rounded-lg border border-slate-300 px-3 py-3"/></label>
                <button type="button" onClick={() => changePeriod('','')} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Todo o histórico</button>
              </div>
              <p className="mt-3 text-xs text-slate-500">Serviços: pela entrada do veículo, ou pela criação da OS quando a entrada não foi informada. Repasses: pela data do pagamento. Os totais desses dois períodos não representam uma quitação por OS.</p>
            </section>
            {invalid?<p role="alert" className="text-red-700">A data inicial deve ser anterior ou igual à data final.</p>:<>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="OS no histórico" value={String(summary.servicos)} detail={`${summary.concluidos} concluída(s) na última situação registrada`}/>
                <SummaryCard label="Veículos associados" value={String(summary.veiculos)} detail={`${summary.emAberto} OS atual(is) em aberto`}/>
                <SummaryCard label="Comissão das OS do período" value={moeda(summary.comissaoTotal)} detail="Comissões registradas; exclui canceladas"/>
                <SummaryCard label="Recebido no período" value={moeda(summary.recebido)} detail={`${summary.pagamentos} pagamento(s); exclui cancelados`}/>
              </section>
              <p className="text-sm text-slate-600">A comissão prevista não confirma pagamento. Os serviços e os pagamentos deste período podem corresponder a datas diferentes; consulte o saldo acumulado acima para ver o total a receber.</p>
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-black">Veículos e serviços</h2>
                <p className="mt-2 text-sm text-slate-600">Cada item corresponde a uma OS na qual este mecânico foi incluído. O status diferencia o que ainda está em aberto do que foi concluído ou cancelado.</p>
                <p className="mt-2 text-xs text-slate-500">Vínculos antigos usam os dados disponíveis na ativação deste histórico. Remoções anteriores só aparecem quando já estavam registradas no histórico da OS.</p>
                <div className="mt-5 grid gap-4">{filtered.servicos.slice(0,servicesLimit).map((item) => {
                  const comissao=comissaoServicoMecanico(item)
                  return <article key={item.ordem_id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-black">{item.titulo??'OS com participação anterior registrada'}</h3><span className="text-xs font-black text-orange-700">{item.vinculado?'Vínculo atual':'Participação anterior'}</span></div>
                    <p className="mt-2 text-sm"><strong>Veículo:</strong> {item.veiculo_id?<Link className="text-orange-700 underline" to={`/historico/veiculos/${item.veiculo_id}`}>{item.veiculo_nome||'Veículo'}{item.placa?` · ${item.placa}`:''}</Link>:'Dados do veículo não disponíveis neste registro'}</p>
                    <p className="mt-1 text-sm text-slate-600">Cliente na participação: {item.cliente_nome??'Não disponível'}</p>
                    <p className="mt-1 text-sm text-slate-600">OS cadastrada: {formatOrdemDate(item.ordem_created_at)}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.vinculado?'Status':'Último status durante a participação'}: {item.status?statusOrdemLabels[item.status]??item.status:'Não disponível'}</p>
                    {!item.vinculado&&item.desvinculado_em?<p className="mt-1 text-sm text-slate-600">Retirado dos responsáveis em {formatOrdemDate(item.desvinculado_em)}</p>:null}
                    <p className="mt-1 text-xs text-slate-500">{item.vinculado_em?`Vínculo registrado em ${formatOrdemDate(item.vinculado_em)}`:'Data original de inclusão não disponível (vínculo anterior à ativação).'}</p>
                    {item.descricao?<p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600">{item.descricao}</p>:null}
                    <p className="mt-3 text-sm font-bold">{item.vinculado?'Comissão prevista nesta OS':'Comissão na última participação registrada'}: {comissao===null?'Não disponível':moeda(item.status==='cancelada'?0:comissao)}</p>
                    {item.autor?<p className="mt-2 text-xs text-slate-500">Último registro da participação: {item.autor.nome} ({item.autor.perfil==='dono'?'Dono':'Gerente'}) · {formatOrdemDate(item.atualizado_em)}</p>:null}
                    <Link className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 text-sm font-bold" to={`/documentos/${item.ordem_id}/orcamento`}>Ver documento da OS</Link>
                    {item.ordem?<OrdemHistorico ordem={item.ordem} mecanicos={{ [data.mecanico.id]:data.mecanico.nome }}/>:null}
                  </article>
                })}</div>
                {!filtered.servicos.length?<p className="mt-4 text-sm text-slate-500">Nenhum serviço registrado para este mecânico no período.</p>:null}
                {filtered.servicos.length>servicesLimit?<button type="button" onClick={() => setServicesLimit((current) => current+20)} className="mt-4 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Mostrar mais serviços</button>:null}
              </section>
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-black">Repasses recebidos</h2><Link to="/financeiro" className="text-sm font-bold text-orange-700 underline">Registrar repasse no financeiro</Link></div>
                <p className="mt-2 text-sm text-slate-600">Valores registrados como despesas pagas na categoria Repasse ao mecânico. Não inclui pagamentos que não foram lançados no sistema.</p>
                {months.length?<div className="mt-4 flex flex-wrap gap-3">{months.map(([month,cents]) => <p key={month} className="rounded-lg bg-slate-50 px-4 py-3 text-sm"><strong>{month.slice(5)}/{month.slice(0,4)}</strong>: {moeda(cents/100)}</p>)}</div>:null}
                <label className="mt-4 block text-sm"><input type="checkbox" checked={showCancelled} onChange={(event) => {setShowCancelled(event.target.checked);setPaymentsLimit(20)}}/> Mostrar lançamentos cancelados</label>
                <div className="mt-4 grid gap-3">{payments.slice(0,paymentsLimit).map((item) => <article key={item.id} className={`rounded-xl border border-slate-200 p-4 ${item.cancelado?'opacity-60':''}`}>
                  <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{item.descricao}</h3><strong className="text-emerald-700">{moeda(Number(item.valor))}{item.cancelado?' · Cancelado':''}</strong></div>
                  <p className="mt-2 text-sm text-slate-600">Pago em {new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')} · Lançado em {formatOrdemDate(item.created_at)}</p>
                  <RegistroAutoria registro={item}/>
                </article>)}</div>
                {!payments.length?<p className="mt-4 text-sm text-slate-500">Nenhum repasse registrado neste período.</p>:null}
                {payments.length>paymentsLimit?<button type="button" onClick={() => setPaymentsLimit((current) => current+20)} className="mt-4 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold">Mostrar mais pagamentos</button>:null}
              </section>
            </>}
          </>:null}
        </div>
      </section>
    </main>
  )
}
