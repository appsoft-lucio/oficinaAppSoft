import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import {
  createOrdem,
  listOrdens,
  type OrdemServico,
  updateOrdemStatus,
} from '../../services/ordens'
import { listVeiculos, type Veiculo } from '../../services/veiculos'

const statusOptions = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Aguardando peca', value: 'aguardando_peca' },
  { label: 'Concluida', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' },
]

export default function OrdensPage() {
  const [clienteId, setClienteId] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [descricao, setDescricao] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [status, setStatus] = useState('aberta')
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [veiculoId, setVeiculoId] = useState('')
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  const clientesById = useMemo(() => {
    return clientes.reduce<Record<string, Cliente>>((acc, cliente) => {
      acc[cliente.id] = cliente
      return acc
    }, {})
  }, [clientes])

  const veiculosById = useMemo(() => {
    return veiculos.reduce<Record<string, Veiculo>>((acc, veiculo) => {
      acc[veiculo.id] = veiculo
      return acc
    }, {})
  }, [veiculos])

  const filteredVeiculos = useMemo(() => {
    return veiculos.filter((veiculo) => veiculo.cliente_id === clienteId)
  }, [clienteId, veiculos])

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setRequiresRealLogin(true)
        return
      }

      const preparedOficina = await ensureUserOficina({
        fallbackName: 'Oficina Demonstracao',
        userId: data.user.id,
      })

      setOficina(preparedOficina)

      const [loadedClientes, loadedVeiculos, loadedOrdens] = await Promise.all([
        listClientes(preparedOficina.id),
        listVeiculos(preparedOficina.id),
        listOrdens(preparedOficina.id),
      ])

      setClientes(loadedClientes)
      setVeiculos(loadedVeiculos)
      setOrdens(loadedOrdens)
      setClienteId(loadedClientes[0]?.id ?? '')
    }

    loadData()
  }, [])

  useEffect(() => {
    const firstVeiculo = veiculos.find((veiculo) => veiculo.cliente_id === clienteId)
    setVeiculoId(firstVeiculo?.id ?? '')
  }, [clienteId, veiculos])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!oficina) {
      setMessage('Entre com uma conta real para cadastrar ordens. O acesso demo nao salva dados.')
      return
    }

    if (!clienteId || !veiculoId) {
      setMessage('Cadastre cliente e veiculo antes de abrir uma ordem.')
      return
    }

    setIsSubmitting(true)

    try {
      const createdOrdem = await createOrdem({
        clienteId,
        descricao,
        oficinaId: oficina.id,
        status,
        titulo,
        valor,
        veiculoId,
      })

      setOrdens((currentOrdens) => [createdOrdem, ...currentOrdens])
      setDescricao('')
      setStatus('aberta')
      setTitulo('')
      setValor('')
      setMessage('Ordem cadastrada com sucesso.')
    } catch {
      setMessage('Nao foi possivel cadastrar a ordem.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(ordemId: string, nextStatus: string) {
    setStatusMessage('')

    try {
      const updatedOrdem = await updateOrdemStatus({
        ordemId,
        status: nextStatus,
      })

      setOrdens((currentOrdens) =>
        currentOrdens.map((ordem) => (ordem.id === ordemId ? updatedOrdem : ordem)),
      )
      setStatusMessage('Status atualizado.')
    } catch {
      setStatusMessage('Nao foi possivel atualizar o status.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-[min(82vw,320px)] shadow-2xl">
            <DashboardSidebar oficinaName={oficinaName} />
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <DashboardSidebar oficinaName={oficinaName} />
      </div>

      <section className="min-w-0">
        <DashboardTopbar
          eyebrow="Operacao"
          onOpenMenu={() => setIsMenuOpen(true)}
          title="Ordens de servico"
        >
          <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">
            {ordens.length} ordem(ns)
          </span>
        </DashboardTopbar>

        <div className="grid gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[460px_1fr]">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Nova ordem</h2>
            <p className="mt-1 text-sm text-slate-500">
              Abra um servico vinculando cliente, veiculo, status e valor.
            </p>

            {requiresRealLogin ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Entre com sua conta real para salvar ordens no Supabase. O acesso demo e apenas
                para apresentacao visual.
              </div>
            ) : clientes.length === 0 || veiculos.length === 0 ? (
              <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
                Cadastre pelo menos um cliente e um veiculo antes.{' '}
                <Link className="underline" to="/clientes">
                  Ir para clientes
                </Link>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Cliente</span>
                  <select
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setClienteId(event.target.value)}
                    required
                    value={clienteId}
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Veiculo</span>
                  <select
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setVeiculoId(event.target.value)}
                    required
                    value={veiculoId}
                  >
                    {filteredVeiculos.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.modelo} {veiculo.placa ? `- ${veiculo.placa}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Titulo</span>
                  <input
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setTitulo(event.target.value)}
                    placeholder="Troca de oleo, revisao, diagnostico..."
                    required
                    value={titulo}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-slate-700">Descricao</span>
                  <textarea
                    className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Detalhes do servico"
                    value={descricao}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Status</span>
                    <select
                      className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      onChange={(event) => setStatus(event.target.value)}
                      value={status}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-slate-700">Valor</span>
                    <input
                      className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      inputMode="decimal"
                      onChange={(event) => setValor(event.target.value)}
                      placeholder="420,00"
                      value={valor}
                    />
                  </label>
                </div>

                {message ? (
                  <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                    {message}
                  </p>
                ) : null}

                <button
                  className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar ordem'}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">Ordens cadastradas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Historico inicial de servicos da oficina.
            </p>

            {statusMessage ? (
              <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                {statusMessage}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3">
              {ordens.length > 0 ? (
                ordens.map((ordem) => (
                  <article className="rounded-xl border border-slate-200 p-4" key={ordem.id}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <strong className="block text-base font-black text-slate-950">
                          {ordem.titulo}
                        </strong>
                        <span className="mt-1 block text-sm text-slate-500">
                          {clientesById[ordem.cliente_id ?? '']?.nome ?? 'Cliente nao informado'}
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {veiculosById[ordem.veiculo_id ?? '']?.modelo ?? 'Veiculo nao informado'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <label className="sr-only" htmlFor={`status-${ordem.id}`}>
                          Status da ordem
                        </label>
                        <select
                          className="h-9 rounded-lg border border-orange-200 bg-orange-50 px-2 text-xs font-black text-orange-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                          id={`status-${ordem.id}`}
                          onChange={(event) => handleStatusChange(ordem.id, event.target.value)}
                          value={ordem.status}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <strong className="text-sm font-black text-slate-950">
                          R$ {Number(ordem.valor).toFixed(2)}
                        </strong>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <Link
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                            to={`/documentos/${ordem.id}/orcamento`}
                          >
                            Orcamento
                          </Link>
                          <Link
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
                            to={`/documentos/${ordem.id}/nota-simples`}
                          >
                            Nota simples
                          </Link>
                        </div>
                      </div>
                    </div>
                    {ordem.descricao ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{ordem.descricao}</p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Nenhuma ordem cadastrada ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
