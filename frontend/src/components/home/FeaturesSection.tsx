import { features } from '../../data/home'
import SectionHeading from './SectionHeading'

export default function FeaturesSection() {
  return (
    <section id="recursos" className="px-5 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Recursos"
          title="O essencial para vender, executar e acompanhar serviços."
          description="A primeira versão foca no fluxo que mais importa: cadastrar, abrir ordem, acompanhar execução e entender os números da oficina."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200"
              key={feature.title}
            >
              <div className="mb-5 h-2 w-14 rounded-full bg-orange-600" />
              <h3 className="text-xl font-black text-slate-950">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
