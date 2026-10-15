import RegistroAutoria from '../../components/dashboard/RegistroAutoria'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { databaseErrorMessage } from '../../services/databaseErrors'
import { ensureUserOficina } from '../../services/oficinas'
import { listOrdens, listOrdemPecas, type OrdemPeca, type OrdemServico } from '../../services/ordens'
import { listVeiculos, type Veiculo } from '../../services/veiculos'
import { listProprietarios, type ProprietarioEvento } from '../../services/vehicleHistory'

const currency = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const date = (value: string) => new Date(value).toLocaleString('pt-BR')
const label = (value: string) => ({ aberta: 'Aberta', em_andamento: 'Em andamento', aguardando_peca: 'Aguardando peça', concluida: 'Concluída', cancelada: 'Cancelada', pago: 'Pago', em_aberto: 'Em aberto', parcial: 'Parcial' }[value] ?? value)

type HistoryData = {
  clientes: Cliente[]
  veiculos: Veiculo[]
  ordens: OrdemServico[]
  eventos: ProprietarioEvento[]
  pecas: OrdemPeca[]
}

export default function HistoricoPage() {
  const { tipo, id } = useParams()
  const [data, setData] = useState<HistoryData | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [oficinaName, setOficinaName] = useState('Minha Oficina')
  const isVeiculo = tipo === 'veiculos'

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true); setError(''); setData(null)
      try {
        if (!id || (tipo !== 'clientes' && tipo !== 'veiculos')) throw new Error('Histórico inválido.')
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError || !auth.user) throw new Error('Entre com sua conta para consultar o histórico.')
        const oficina = await ensureUserOficina({ userId: auth.user.id })
        const [clientes, veiculos, todasOrdens, todosEventos] = await Promise.all([
          listClientes(oficina.id), listVeiculos(oficina.id), listOrdens(oficina.id), listProprietarios(oficina.id),
        ])
        if (isVeiculo ? !veiculos.some((item) => item.id === id) : !clientes.some((item) => item.id === id)) {
          throw new Error('Cadastro não encontrado nesta oficina.')
        }
        const ordens = todasOrdens.filter((ordem) => isVeiculo ? ordem.veiculo_id === id : ordem.cliente_id === id)
        const eventos = todosEventos.filter((evento) => isVeiculo ? evento.veiculo_id === id
          : evento.cliente_anterior_id === id || evento.cliente_novo_id === id)
        const pecas = (await Promise.all(ordens.map((ordem) => listOrdemPecas(ordem.id)))).flat()
        if (active) { setOficinaName(oficina.nome); setData({ clientes, veiculos, ordens, eventos, pecas }) }
      } catch (err) {
        if (active) setError(databaseErrorMessage(err, err instanceof Error ? err.message : 'Não foi possível carregar o histórico.'))
      } finally { if (active) setIsLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [id, tipo, isVeiculo])

  const veiculo = data?.veiculos.find((item) => item.id === id)
  const cliente = data?.clientes.find((item) => item.id === id)
  const clienteNome = (clienteId: string | null) => data?.clientes.find((item) => item.id === clienteId)?.nome ?? 'Não informado'
  const veiculoNome = (veiculoId: string | null) => {
    const item = data?.veiculos.find((value) => value.id === veiculoId)
    return item ? `${item.modelo} — ${item.placa || 'Sem placa'}` : 'Veículo não informado'
  }
  const veiculosCliente = data?.veiculos.filter((item) => item.cliente_id === id
    || data.eventos.some((evento) => evento.veiculo_id === item.id)
    || data.ordens.some((ordem) => ordem.veiculo_id === item.id)) ?? []

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      {isMenuOpen ? <div className="fixed inset-0 z-50 lg:hidden">
        <button aria-label="Fechar menu" className="absolute inset-0 bg-slate-950/60" onClick={() => setIsMenuOpen(false)} type="button" />
        <div className="relative h-full w-[min(82vw,320px)] overflow-y-auto shadow-2xl"><DashboardSidebar oficinaName={oficinaName} /></div>
      </div> : null}
      <div className="hidden lg:block"><DashboardSidebar oficinaName={oficinaName} /></div>
      <section className="min-w-0">
        <DashboardTopbar eyebrow="Histórico" title={isVeiculo ? 'Histórico do veículo' : 'Histórico do cliente'} onOpenMenu={() => setIsMenuOpen(true)}>
          <Link className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold" to={isVeiculo ? '/veiculos' : '/clientes'}>Voltar</Link>
        </DashboardTopbar>
        <div className="space-y-6 px-5 py-6 sm:px-8">
          {isLoading ? <p role="status">Carregando histórico...</p> : error ? <p role="alert" className="rounded-xl bg-orange-50 p-4 font-bold text-orange-700">{error}</p> : data ? <>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black">{isVeiculo ? veiculoNome(id ?? null) : cliente?.nome}</h2>
              {isVeiculo && veiculo ? <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>Proprietário atual: <strong>{clienteNome(veiculo.cliente_id)}</strong></p>
                <p>{veiculo.marca || 'Marca não informada'} · {veiculo.ano || 'Ano não informado'}</p>
                <p>Quilometragem cadastrada: {veiculo.quilometragem == null ? 'Não informada' : `${veiculo.quilometragem.toLocaleString('pt-BR')} km`}</p>
              </div> : <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>{cliente?.telefone || 'Telefone não informado'} · {cliente?.email || 'E-mail não informado'}</p>
                <h3 className="font-black">Veículos atuais e anteriores</h3>
                {veiculosCliente.map((item) => <p key={item.id}>
                  <Link className="font-bold text-orange-700 underline" to={`/historico/veiculos/${item.id}`}>{veiculoNome(item.id)}</Link>
                  {' '}({item.cliente_id === id ? 'Proprietário atual' : 'Vínculo anterior'})
                </p>)}
                {veiculosCliente.length === 0 ? <p>Nenhum veículo vinculado.</p> : null}
              </div>}
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black">{isVeiculo ? 'Proprietários e transferências' : 'Histórico de propriedade'}</h2>
              <p className="mt-1 text-sm text-slate-500">A propriedade dos veículos já existentes foi registrada na ativação deste recurso. Transferências anteriores não registradas não são presumidas.</p>
              <div className="mt-4 space-y-3">
                {data.eventos.map((evento) => <article key={evento.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <p className="font-bold">{evento.tipo === 'cadastro' ? 'Proprietário registrado' : 'Transferência de proprietário'}</p>
                  {!isVeiculo ? <Link className="text-orange-700 underline" to={`/historico/veiculos/${evento.veiculo_id}`}>{veiculoNome(evento.veiculo_id)}</Link> : null}
                  <p className="mt-1">{evento.tipo === 'transferencia' ? `${evento.nome_anterior || 'Não informado'} → ` : ''}{evento.nome_novo || 'Não informado'}</p>
                  <time className="mt-1 block text-slate-500" dateTime={evento.created_at}>{date(evento.created_at)}</time>
                  <RegistroAutoria registro={evento} />
                </article>)}
                {data.eventos.length === 0 ? <p className="text-sm text-slate-500">Nenhum registro de propriedade.</p> : null}
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black">Manutenções e ordens de serviço</h2>
              <p className="mt-1 text-sm text-slate-500">{isVeiculo ? 'Todas as ordens deste veículo, incluindo as dos proprietários anteriores.' : 'Ordens vinculadas a este cliente, inclusive de veículos já transferidos.'}</p>
              <div className="mt-4 space-y-3">
                {data.ordens.map((ordem) => <article key={ordem.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <h3 className="text-base font-black">{ordem.titulo}</h3>
                    <RegistroAutoria registro={ordem} />
                  <time className="mt-1 block text-slate-500" dateTime={ordem.created_at}>{date(ordem.created_at)}</time>
                  <p className="mt-2">Cliente da ordem: <strong>{clienteNome(ordem.cliente_id)}</strong></p>
                  <p>Veículo: <Link className="text-orange-700 underline" to={`/historico/veiculos/${ordem.veiculo_id}`}>{veiculoNome(ordem.veiculo_id)}</Link></p>
                  <p>Serviço: {label(ordem.status)} · Pagamento: {label(ordem.pagamento_status)}</p>
                  {ordem.descricao ? <p className="mt-2 whitespace-pre-wrap text-slate-600">{ordem.descricao}</p> : null}
                  <p className="mt-2">Mão de obra: {currency(ordem.valor_servico)} · Total: {currency(ordem.valor)} · Recebido: {currency(ordem.valor_pago)}</p>
                  {data.pecas.filter((peca) => peca.ordem_id === ordem.id).map((peca) => <p className="mt-1 text-slate-600" key={peca.id}>{peca.descricao} — {peca.quantidade} × {currency(peca.valor_unitario)}</p>)}
                  <Link className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 font-bold" to={`/documentos/${ordem.id}/orcamento`}>Ver documento da ordem</Link>
                </article>)}
                {data.ordens.length === 0 ? <p className="text-sm text-slate-500">Nenhuma manutenção registrada.</p> : null}
              </div>
            </section>
          </> : null}
        </div>
      </section>
    </main>
  )
}
