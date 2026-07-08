import { activeServices, dashboardMetrics } from '../../data/home'
import MetricCard from './MetricCard'
import ServiceRow from './ServiceRow'

export default function DashboardPreview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200 sm:p-4">
      <div className="rounded-lg bg-slate-950 p-4 text-white sm:p-5">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
              Hoje
            </p>
            <h2 className="mt-1 text-[26px] font-black leading-tight">Dashboard</h2>
          </div>
          <span className="rounded-full bg-orange-500 px-3 py-1 text-[12px] font-black">
            Online
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="mt-5 space-y-3 rounded-lg bg-white p-3 text-slate-900 sm:p-4">
          {activeServices.map((service) => (
            <ServiceRow key={service.title} {...service} />
          ))}
        </div>
      </div>
    </div>
  )
}
