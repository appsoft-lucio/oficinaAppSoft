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

export default function FinanceiroPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [requiresRealLogin, setRequiresRealLogin] = useState(false)
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  const clientesById = useMemo(() => {
    return clientes.reduce<Record<string, Cliente>>((acc, cliente) => {
      acc[cliente.id] = cliente
      return acc
    }, {})
  }, [clientes])

  const totalRecebido = useMemo(() => {
    return ordens
      .filter((ordem) => ordem.pagamento_status === 'pago')
      .reduce((total, ordem) => total + Number(ordem.valor), 0)
  }, [ordens])

  const totalEmAberto = useMemo(() => {
    return ordens
      .filter((ordem) => ordem.pagamento_status !== 'pago')
      .reduce((total, ordem) => total + Number(ordem.valor), 0)
  }, [ordens])

  const totalPrevisto = useMemo(() => {
    return ordens.reduce((total, ordem) => total + Number(ordem.valor), 0)
  }, [ordens])

  const ordensPagas = ordens.filter((ordem) => ordem.pagamento_status === 'pago').length
  const currentMonthKey = getCurrentMonthKey()

  const monthlySummary = useMemo(() => {
    const summary = ordens.reduce<
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

      if (ordem.pagamento_status === 'pago') {
        acc[monthKey].recebido += valorOrdem
      } else {
        acc[monthKey].aberto += valorOrdem
      }

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
  }, [ordens])

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

      const [loadedClientes, loadedOrdens] = await Promise.all([
        listClientes(preparedOficina.id),
        listOrdens(preparedOficina.id),
      ])

      setClientes(loadedClientes)
      setOrdens(loadedOrdens)
    }

    loadFinanceiro()
  }, [])

  async function handlePagamentoStatusChange(ordemId: string, pagamentoStatus: string) {
    setMessage('')

    try {
      const updatedOrdem = await updateOrdemPagamentoStatus({
        ordemId,
        pagamentoStatus,
      })

      setOrdens((currentOrdens) =>
        currentOrdens.map((ordem) => (ordem.id === ordemId ? updatedOrdem : ordem)),
      )
      setMessage('Status de pagamento atualizado.')
    } catch {
      setMessage('Nao foi possivel atualizar o pagamento.')
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
            {ordens.length} ordem(ns)
          </span>
        </DashboardTopbar>

        <div className="px-5 py-6 sm:px-8">
          {requiresRealLogin ? (
            <div className="rounded-xl bg-orange-50 p-4 text-sm font-bold text-orange-700">
              Entre com sua conta real para visualizar o financeiro.
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              detail={`Mes ${currentMonthKey}`}
              label="Recebido no mes"
              value={formatCurrency(currentMonthSummary.recebido)}
            />
            <SummaryCard
              detail={`Mes ${currentMonthKey}`}
              label="Em aberto no mes"
              value={formatCurrency(currentMonthSummary.aberto)}
            />
            <SummaryCard
              detail={`${ordensPagas} ordem(ns) pagas`}
              label="Recebido ate hoje"
              value={formatCurrency(totalRecebido)}
            />
            <SummaryCard
              detail={`${ordens.length} ordem(ns) no total`}
              label="Em aberto ate hoje"
              value={formatCurrency(totalEmAberto)}
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
              {ordens.length > 0 ? (
                ordens.map((ordem) => (
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
                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-orange-600">
                        {pagamentoStatusLabels[ordem.pagamento_status] ?? ordem.pagamento_status}
                      </span>
                    </div>

                    <strong className="text-lg font-black text-slate-950">
                      {formatCurrency(Number(ordem.valor))}
                    </strong>

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
