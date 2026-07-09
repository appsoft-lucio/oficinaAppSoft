import { useEffect, useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import OrdersPanel from '../../components/dashboard/OrdersPanel'
import SchedulePanel from '../../components/dashboard/SchedulePanel'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { supabase } from '../../lib/supabase'
import type { Cliente } from '../../services/clientes'
import { getDashboardData } from '../../services/dashboard'
import { ensureUserOficina, type Oficina } from '../../services/oficinas'
import type { OrdemServico } from '../../services/ordens'
import type { Veiculo } from '../../services/veiculos'

type DashboardSummaryItem = {
  detail: string
  label: string
  value: string
}

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [summary, setSummary] = useState<DashboardSummaryItem[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const oficinaName = oficina?.nome ?? 'Oficina Demonstracao'

  useEffect(() => {
    async function prepareOficina() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        return
      }

      const preparedOficina = await ensureUserOficina({
        fallbackName: 'Oficina Demonstracao',
        userId: data.user.id,
      })

      setOficina(preparedOficina)

      const dashboardData = await getDashboardData(preparedOficina.id)

      setClientes(dashboardData.clientes)
      setOrdens(dashboardData.ordens)
      setSummary(dashboardData.summary)
      setVeiculos(dashboardData.veiculos)
    }

    prepareOficina()
  }, [])

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
            <button
              aria-label="Fechar menu"
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setIsMenuOpen(false)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
            <DashboardSidebar oficinaName={oficinaName} />
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <DashboardSidebar oficinaName={oficinaName} />
      </div>

      <section className="min-w-0">
        <DashboardTopbar onOpenMenu={() => setIsMenuOpen(true)}>
          <button className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50">
            Exportar relatorio
          </button>
          <button className="min-h-11 rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-700">
            Nova ordem
          </button>
        </DashboardTopbar>

        <div className="px-5 py-6 sm:px-8">
          <section className="mb-6 rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
              Visão geral
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Ola. A {oficinaName} esta em movimento.
            </h2>
            <p className="mt-2 max-w-3xl text-slate-300">
              Esta é a primeira tela logada do app. Os dados ainda são demonstrativos, mas
              a estrutura já está pronta para conectar com Supabase.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <SummaryCard key={item.label} {...item} />
            ))}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <OrdersPanel clientes={clientes} ordens={ordens} veiculos={veiculos} />
            <SchedulePanel ordens={ordens} />
          </div>
        </div>
      </section>
    </main>
  )
}
