import { recentOrders } from '../../data/dashboard'

export default function OrdersPanel() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">Ordens recentes</h2>
          <p className="mt-1 text-sm text-slate-500">Serviços que precisam de atenção hoje.</p>
        </div>
        <button className="hidden rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white sm:block">
          Ver todas
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {recentOrders.map((order) => (
          <article
            className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
            key={`${order.client}-${order.vehicle}`}
          >
            <div>
              <strong className="block font-black text-slate-950">{order.client}</strong>
              <span className="text-sm text-slate-500">{order.vehicle}</span>
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-700">{order.service}</span>
              <span className="text-sm font-black text-orange-600">{order.status}</span>
            </div>
            <strong className="text-left text-lg font-black text-slate-950 md:text-right">
              {order.total}
            </strong>
          </article>
        ))}
      </div>
    </section>
  )
}
