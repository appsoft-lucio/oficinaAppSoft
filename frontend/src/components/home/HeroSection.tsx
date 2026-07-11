import DashboardPreview from './DashboardPreview'

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
      <div>
        <p className="mb-4 text-[13px] font-black uppercase tracking-[0.18em] text-orange-600">
          Sistema de gestão para oficinas mecânicas
        </p>
        <h1 className="max-w-3xl text-[clamp(2.35rem,5vw,4.5rem)] font-black leading-[1.04] text-slate-950">
          Organize sua oficina do atendimento ao pagamento.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-slate-600 sm:text-lg">
          Centralize clientes, veículos, ordens de serviço, peças, documentos e pagamentos
          em uma plataforma desenvolvida para a rotina da oficina.
        </p>
        <p className="mt-4 max-w-xl text-[15px] font-bold leading-7 text-slate-500">
          Tenha mais agilidade no atendimento, controle sobre a operação e informações
          confiáveis para apoiar a gestão do negócio.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-orange-600 px-6 text-[15px] font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
            href="#dashboard"
          >
            Conhecer o sistema
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-[15px] font-black text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            href="#recursos"
          >
            Conhecer recursos
          </a>
        </div>
      </div>

      <DashboardPreview />
    </section>
  )
}
