import DashboardSidebar from '../../components/dashboard/DashboardSidebar'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar'
import OrdersPanel from '../../components/dashboard/OrdersPanel'
import SchedulePanel from '../../components/dashboard/SchedulePanel'
import SummaryCard from '../../components/dashboard/SummaryCard'
import { dashboardSummary } from '../../data/dashboard'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      <section className="min-w-0">
        <DashboardTopbar />

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
