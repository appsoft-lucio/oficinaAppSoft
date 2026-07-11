import { painPoints } from '../../data/home'
import SectionHeading from './SectionHeading'

export default function PainPointsSection() {
  return (
    <section className="border-y border-slate-200 bg-white px-5 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Gestão profissional"
          title="Mais controle da operação, menos dependência de anotações dispersas."
          description="A rotina da oficina exige agilidade e informações confiáveis. A plataforma reúne os dados essenciais para que cada atendimento seja acompanhado com clareza."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {painPoints.map((item, index) => (
            <article
              className="rounded-xl border border-slate-200 bg-slate-50 p-6"
              key={item.title}
            >
              <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-orange-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
