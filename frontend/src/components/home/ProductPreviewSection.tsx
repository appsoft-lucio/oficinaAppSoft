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
            title="Um painel para bater o olho e saber onde agir."
            description="Acompanhe ordens abertas, clientes ativos, receita do mês e serviços em andamento. A ideia é reduzir dúvida e aumentar velocidade na tomada de decisão."
          />
          <ul className="mt-8 space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Visão diária da operação
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Indicadores simples para o dono da oficina
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              Base pronta para evoluir com Supabase
            </li>
          </ul>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}
