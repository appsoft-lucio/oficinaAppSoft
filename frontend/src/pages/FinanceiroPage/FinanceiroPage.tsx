import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { supabase } from '../../lib/supabase'
import { listClientes, type Cliente } from '../../services/clientes'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import {
  listOrdens,
  type OrdemServico,
  updateOrdemPagamentoStatus,
} from '../../services/ordens'
import { listVeiculos, type Veiculo } from '../../services/veiculos'

const pagamentoStatusOptions = [
  { label: 'Em aberto', value: 'em_aberto' },
  { label: 'Parcial', value: 'parcial' },
  { label: 'Pago', value: 'pago' },
]

const pagamentoStatusLabels: Record<string, string> = {
  em_aberto: 'Em aberto',
  parcial: 'Parcial',
  pago: 'Pago',
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })
}

function getMonthKey(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

function getCurrentMonthKey() {
  return new Intl.DateTimeFormat('pt-BR', {
    month: '2-digit',
    year: 'numeric',
  }).format(new Date())
}

function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function getPeriodRange(period: string, customStartDate: string, customEndDate: string) {
  const today = new Date()

  if (period === 'mes_atual') {
    return {
      end: getEndOfMonth(today),
      start: getStartOfMonth(today),
    }
  }

  if (period === 'mes_anterior') {
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    return {
      end: getEndOfMonth(previousMonth),
      start: getStartOfMonth(previousMonth),
    }
  }

  if (period === 'ultimos_3_meses') {
    return {
      end: today,
      start: new Date(today.getFullYear(), today.getMonth() - 2, 1),
    }
  }

  if (period === 'ano_atual') {
    return {
      end: today,
      start: new Date(today.getFullYear(), 0, 1),
    }
  }

  if (period === 'personalizado' && customStartDate && customEndDate) {
    return {
      end: new Date(`${customEndDate}T23:59:59.999`),
      start: new Date(`${customStartDate}T00:00:00.000`),
    }
  }

  return {
    end: null,
    start: null,
  }
}

function parseCurrencyInput(value: string) {
  const parsedValue = Number(value.replace(',', '.'))

  return Number.isNaN(parsedValue) ? 0 : parsedValue
}

function getValorRecebido(ordem: OrdemServico) {
  const valor = Number(ordem.valor)
  const valorPago = Math.min(Math.max(Number(ordem.valor_pago), 0), valor)

  if (ordem.pagamento_status === 'pago') {
    return valor
  }

  if (ordem.pagamento_status === 'parcial') {
    return valorPago
  }

  return 0
}

function getValorEmAberto(ordem: OrdemServico) {
  return Math.max(Number(ordem.valor) - getValorRecebido(ordem), 0)
}

function buildPartialPayments(ordens: OrdemServico[]) {
  return ordens.reduce<Record<string, string>>((acc, ordem) => {
    acc[ordem.id] = String(Number(ordem.valor_pago || 0))
    return acc
  }, {})
}

export default function FinanceiroPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [customEndDate, setCustomEndDate] = useState(getDateInputValue(new Date()))
  const [customStartDate, setCustomStartDate] = useState(
    getDateInputValue(getStartOfMonth(new Date())),
  )
  const [clienteFilter, setClienteFilter] = useState('todos')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [pagamentoFilter, setPagamentoFilter] = useState('todos')
  const [partialPayments, setPartialPayments] = useState<Record<string, string>>({})
  const [periodFilter, setPeriodFilter] = useState('mes_atual')
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const [veiculoFilter, setVeiculoFilter] = useState('todos')
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

  const filteredOrdens = useMemo(() => {
    const { end, start } = getPeriodRange(periodFilter, customStartDate, customEndDate)

    return ordens.filter((ordem) => {
      const ordemDate = new Date(ordem.created_at)
      const isInsidePeriod = (!start || ordemDate >= start) && (!end || ordemDate <= end)
      const matchesCliente = clienteFilter === 'todos' || ordem.cliente_id === clienteFilter
      const matchesVeiculo = veiculoFilter === 'todos' || ordem.veiculo_id === veiculoFilter
      const matchesPagamento =
        pagamentoFilter === 'todos' || ordem.pagamento_status === pagamentoFilter

      return isInsidePeriod && matchesCliente && matchesVeiculo && matchesPagamento
    })
  }, [
    clienteFilter,
    customEndDate,
    customStartDate,
    ordens,
    pagamentoFilter,
    periodFilter,
    veiculoFilter,
  ])

  const totalRecebido = useMemo(() => {
    return filteredOrdens.reduce((total, ordem) => total + getValorRecebido(ordem), 0)
  }, [filteredOrdens])

  const totalRecebidoAteHoje = useMemo(() => {
    return ordens.reduce((total, ordem) => total + getValorRecebido(ordem), 0)
  }, [ordens])

  const totalEmAberto = useMemo(() => {
    return filteredOrdens.reduce((total, ordem) => total + getValorEmAberto(ordem), 0)
  }, [filteredOrdens])

  const totalEmAbertoAteHoje = useMemo(() => {
    return ordens.reduce((total, ordem) => total + getValorEmAberto(ordem), 0)
  }, [ordens])

  const totalPrevisto = useMemo(() => {
    return filteredOrdens.reduce((total, ordem) => total + Number(ordem.valor), 0)
  }, [filteredOrdens])

  const ordensPagas = filteredOrdens.filter((ordem) => ordem.pagamento_status === 'pago').length
  const currentMonthKey = getCurrentMonthKey()

  const monthlySummary = useMemo(() => {
    const summary = filteredOrdens.reduce<
      Record<
        string,
        {
          aberto: number
          ordens: number
          previsto: number
          recebido: number
        }
      >
    >((acc, ordem) => {
      const monthKey = getMonthKey(ordem.created_at)
      const valorOrdem = Number(ordem.valor)

      if (!acc[monthKey]) {
        acc[monthKey] = {
          aberto: 0,
          ordens: 0,
          previsto: 0,
          recebido: 0,
        }
      }

      acc[monthKey].ordens += 1
      acc[monthKey].previsto += valorOrdem

      acc[monthKey].recebido += getValorRecebido(ordem)
      acc[monthKey].aberto += getValorEmAberto(ordem)

      return acc
    }, {})

    return Object.entries(summary)
      .map(([month, values]) => ({
        month,
        ...values,
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number)
        const [bMonth, bYear] = b.month.split('/').map(Number)

        return bYear - aYear || bMonth - aMonth
      })
  }, [filteredOrdens])

  const currentMonthSummary = monthlySummary.find((item) => item.month === currentMonthKey) ?? {
    aberto: 0,
    month: currentMonthKey,
    ordens: 0,
    previsto: 0,
    recebido: 0,
  }

  useEffect(() => {
    async function loadFinanceiro() {
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

      const [loadedClientes, loadedOrdens, loadedVeiculos] = await Promise.all([
        listClientes(preparedOficina.id),
        listOrdens(preparedOficina.id),
        listVeiculos(preparedOficina.id),
      ])

      setClientes(loadedClientes)
      setOrdens(loadedOrdens)
      setPartialPayments(buildPartialPayments(loadedOrdens))
      setVeiculos(loadedVeiculos)
    }

    loadFinanceiro()
  }, [])

  async function handlePagamentoStatusChange(ordemId: string, pagamentoStatus: string) {
    setMessage('')
    const currentOrdem = ordens.find((ordem) => ordem.id === ordemId)

    if (!currentOrdem) {
      return
    }

    const nextValorPago =
      pagamentoStatus === 'pago'
        ? Number(currentOrdem.valor)
        : pagamentoStatus === 'em_aberto'
          ? 0
          : Number(currentOrdem.valor_pago)

    try {
      const updatedOrdem = await updateOrdemPagamentoStatus({
        ordemId,
        pagamentoStatus,
        valorPago: nextValorPago,
      })

      setOrdens((currentOrdens) =>
        currentOrdens.map((ordem) => (ordem.id === ordemId ? updatedOrdem : ordem)),
      )
      setPartialPayments((currentValues) => ({
        ...currentValues,
        [ordemId]: String(Number(updatedOrdem.valor_pago || 0)),
      }))
      setMessage('Status de pagamento atualizado.')
    } catch {
      setMessage('Nao foi possivel atualizar o pagamento.')
    }
  }

  async function handlePartialPaymentSave(ordem: OrdemServico) {
    setMessage('')
    const valorOrdem = Number(ordem.valor)
    const valorPago = Math.min(
      Math.max(parseCurrencyInput(partialPayments[ordem.id] ?? '0'), 0),
      valorOrdem,
    )
    const nextStatus = valorPago >= valorOrdem ? 'pago' : valorPago > 0 ? 'parcial' : 'em_aberto'

    try {
      const updatedOrdem = await updateOrdemPagamentoStatus({
        ordemId: ordem.id,
        pagamentoStatus: nextStatus,
        valorPago,
      })

      setOrdens((currentOrdens) =>
        currentOrdens.map((currentOrdem) =>
          currentOrdem.id === ordem.id ? updatedOrdem : currentOrdem,
        ),
      )
      setPartialPayments((currentValues) => ({
        ...currentValues,
        [ordem.id]: String(Number(updatedOrdem.valor_pago || 0)),
      }))
      setMessage('Valor parcial atualizado.')
    } catch {
      setMessage('Nao foi possivel salvar o valor parcial.')
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
          eyebrow="Financeiro"
          onOpenMenu={() => setIsMenuOpen(true)}
          title="Controle financeiro"
        >
          <span className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700">
            {filteredOrdens.length} ordem(ns)
          </span>
        </DashboardTopbar>

        <div className="px-5 py-6 sm:px-8">
          {requiresRealLogin ? (
            <div className="rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
              Entre com sua conta real para visualizar o financeiro.
            </div>
          ) : null}

          <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Filtros financeiros</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Consulte receita por periodo, cliente, carro e pagamento.
                </p>
              </div>
              <button
                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setClienteFilter('todos')
                  setPagamentoFilter('todos')
                  setPeriodFilter('mes_atual')
                  setVeiculoFilter('todos')
                }}
                type="button"
              >
                Limpar filtros
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="text-sm font-black text-slate-700">Periodo</span>
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setPeriodFilter(event.target.value)}
                  value={periodFilter}
                >
                  <option value="mes_atual">Este mes</option>
                  <option value="mes_anterior">Mes anterior</option>
                  <option value="ultimos_3_meses">Ultimos 3 meses</option>
                  <option value="ano_atual">Este ano</option>
                  <option value="todos">Todo o periodo</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Cliente</span>
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setClienteFilter(event.target.value)}
                  value={clienteFilter}
                >
                  <option value="todos">Todos os clientes</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Carro</span>
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setVeiculoFilter(event.target.value)}
                  value={veiculoFilter}
                >
                  <option value="todos">Todos os carros</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.modelo} {veiculo.placa ? `- ${veiculo.placa}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700">Pagamento</span>
                <select
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  onChange={(event) => setPagamentoFilter(event.target.value)}
                  value={pagamentoFilter}
                >
                  <option value="todos">Todos</option>
                  {pagamentoStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {periodFilter === 'personalizado' ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Data inicial</span>
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setCustomStartDate(event.target.value)}
                    type="date"
                    value={customStartDate}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-slate-700">Data final</span>
                  <input
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    onChange={(event) => setCustomEndDate(event.target.value)}
                    type="date"
                    value={customEndDate}
                  />
                </label>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              detail={`${filteredOrdens.length} ordem(ns) filtradas`}
              label="Recebido no periodo"
              value={formatCurrency(totalRecebido)}
            />
            <SummaryCard
              detail={`${currentMonthSummary.month === currentMonthKey ? 'Mes atual' : 'Periodo filtrado'}`}
              label="Em aberto no periodo"
              value={formatCurrency(totalEmAberto)}
            />
            <SummaryCard
              detail={`${ordensPagas} ordem(ns) pagas`}
              label="Recebido ate hoje"
              value={formatCurrency(totalRecebidoAteHoje)}
            />
            <SummaryCard
              detail={`${ordens.length} ordem(ns) no total`}
              label="Em aberto ate hoje"
              value={formatCurrency(totalEmAbertoAteHoje)}
            />
          </section>

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Resumo por mes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recebido, em aberto e previsto agrupados pelo mes da ordem.
                </p>
              </div>
              <strong className="text-sm font-black text-slate-700">
                Previsto total: {formatCurrency(totalPrevisto)}
              </strong>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-sm text-slate-500">
                    <th className="px-4 py-2 font-black">Mes</th>
                    <th className="px-4 py-2 font-black">Ordens</th>
                    <th className="px-4 py-2 font-black">Recebido</th>
                    <th className="px-4 py-2 font-black">Em aberto</th>
                    <th className="px-4 py-2 font-black">Previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.length > 0 ? (
                    monthlySummary.map((item) => (
                      <tr className="rounded-xl bg-slate-50" key={item.month}>
                        <td className="rounded-l-xl px-4 py-3 text-sm font-black text-slate-950">
                          {item.month}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-600">
                          {item.ordens}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                          {formatCurrency(item.recebido)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-orange-700">
                          {formatCurrency(item.aberto)}
                        </td>
                        <td className="rounded-r-xl px-4 py-3 text-sm font-black text-slate-950">
                          {formatCurrency(item.previsto)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="rounded-xl bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500"
                        colSpan={5}
                      >
                        Nenhum dado financeiro para resumir.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Receita por ordem</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acompanhe o valor e o status de pagamento de cada servico.
                </p>
              </div>
            </div>

            {message ? (
              <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                {message}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3">
              {filteredOrdens.length > 0 ? (
                filteredOrdens.map((ordem) => (
                  <article
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center"
                    key={ordem.id}
                  >
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
                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-orange-600">
                        {pagamentoStatusLabels[ordem.pagamento_status] ?? ordem.pagamento_status}
                      </span>
                    </div>

                    <div className="min-w-36 text-left lg:text-right">
                      <strong className="block text-lg font-black text-slate-950">
                        {formatCurrency(Number(ordem.valor))}
                      </strong>
                      <span className="mt-1 block text-sm font-bold text-emerald-700">
                        Recebido: {formatCurrency(getValorRecebido(ordem))}
                      </span>
                      <span className="mt-1 block text-sm font-bold text-orange-700">
                        Aberto: {formatCurrency(getValorEmAberto(ordem))}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:min-w-52">
                      <select
                        className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-black text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        onChange={(event) =>
                          handlePagamentoStatusChange(ordem.id, event.target.value)
                        }
                        value={ordem.pagamento_status}
                      >
                        {pagamentoStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {ordem.pagamento_status === 'parcial' ? (
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                            Valor pago
                          </span>
                          <input
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-black text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            inputMode="decimal"
                            onBlur={() => handlePartialPaymentSave(ordem)}
                            onChange={(event) =>
                              setPartialPayments((currentValues) => ({
                                ...currentValues,
                                [ordem.id]: event.target.value,
                              }))
                            }
                            placeholder="0,00"
                            value={partialPayments[ordem.id] ?? ''}
                          />
                        </label>
                      ) : null}
                    </div>
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
