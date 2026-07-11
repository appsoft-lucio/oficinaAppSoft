import DashboardPreview from './DashboardPreview'
import SectionHeading from './SectionHeading'

export default function ProductPreviewSection() {
  return (
    <section id="dashboard" className="bg-slate-950 px-5 py-16 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Dashboard"
            tone="dark"
            title="Informações relevantes para decisões mais seguras."
            description="Acompanhe ordens, clientes, veículos e resultados financeiros em um painel objetivo, preparado para apoiar a rotina administrativa da oficina."
          />
          <ul className="mt-8 space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Visão consolidada da operação
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Indicadores claros para a gestão
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Dados centralizados e disponíveis online
            </li>
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}
