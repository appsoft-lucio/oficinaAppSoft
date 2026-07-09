import { useState } from 'react'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import OrdersPanel from '../../components/dashboard/OrdersPanel'
import SchedulePanel from '../../components/dashboard/SchedulePanel'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { dashboardSummary } from '../../data/dashboard'

export default function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
            <DashboardSidebar />
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      <section className="min-w-0">
        <DashboardTopbar onOpenMenu={() => setIsMenuOpen(true)} />

        <div className="px-5 py-6 sm:px-8">
          <section className="mb-6 rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
              Visão geral
            </p>
            <h2 className="mt-2 text-2xl font-black">Olá, Lucio. A oficina está em movimento.</h2>
            <p className="mt-2 max-w-3xl text-slate-300">
              Esta é a primeira tela logada do app. Os dados ainda são demonstrativos, mas
              a estrutura já está pronta para conectar com Supabase.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardSummary.map((item) => (
              <SummaryCard key={item.label} {...item} />
            ))}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <OrdersPanel />
            <SchedulePanel />
          </div>
        </div>
      </section>
    </main>
  )
}
