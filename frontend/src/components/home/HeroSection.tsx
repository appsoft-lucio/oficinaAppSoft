import DashboardPreview from './DashboardPreview'

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-600">
          Gestão para oficinas
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
          Controle sua oficina com menos papel e mais previsibilidade.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Organize clientes, veículos, ordens de serviço, pagamentos e relatórios em um
          painel simples para o dia a dia da mecânica.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-lg bg-orange-600 px-6 py-3 font-black text-white shadow-lg shadow-orange-600/20">
            Ver demonstração
          </button>
          <button className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-black text-slate-800">
            Conhecer recursos
          </button>
        </div>
      </div>

      <DashboardPreview />
    </section>
  )
}
