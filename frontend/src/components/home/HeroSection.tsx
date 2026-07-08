import DashboardPreview from './DashboardPreview'

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
      <div>
        <p className="mb-4 text-[13px] font-black uppercase tracking-[0.18em] text-orange-600">
          Gestão para oficinas
        </p>
        <h1 className="max-w-3xl text-[clamp(2.35rem,5vw,4.5rem)] font-black leading-[1.04] text-slate-950">
          Controle sua oficina com menos papel e mais previsibilidade.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-slate-600 sm:text-lg">
          Organize clientes, veículos, ordens de serviço, pagamentos e relatórios em um
          painel simples para o dia a dia da mecânica.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="min-h-12 rounded-lg bg-orange-600 px-6 text-[15px] font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700">
            Ver demonstração
          </button>
          <button className="min-h-12 rounded-lg border border-slate-300 bg-white px-6 text-[15px] font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
            Conhecer recursos
          </button>
        </div>
      </div>

      <DashboardPreview />
    </section>
  )
}
