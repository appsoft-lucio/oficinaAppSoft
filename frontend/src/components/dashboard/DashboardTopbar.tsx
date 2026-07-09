export default function DashboardTopbar() {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          Painel logado
        </p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard da oficina</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50">
          Exportar relatório
        </button>
        <button className="min-h-11 rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-700">
          Nova ordem
        </button>
      </div>
    </header>
  )
}
