import { pricingHighlights } from '../../data/home'
import SectionHeading from './SectionHeading'

export default function PricingSection() {
  return (
    <section id="planos" className="px-5 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200 sm:p-8 lg:grid-cols-[1fr_380px] lg:items-center">
        <SectionHeading
          eyebrow="Planos"
          title="Comece com uma versão enxuta e evolua com a oficina."
          description="A proposta inicial é validar o fluxo com clientes reais, mostrar valor rápido e adicionar módulos conforme a operação pedir."
        />

        <aside className="rounded-xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
            Primeira etapa
          </p>
          <strong className="mt-3 block text-3xl font-black">Demonstração guiada</strong>
          <p className="mt-3 leading-7 text-slate-300">
            Ideal para apresentar a oficina, entender necessidades e definir a implantação.
          </p>

          <ul className="mt-6 space-y-3">
            {pricingHighlights.map((item) => (
              <li className="flex items-center gap-3 text-sm font-bold text-slate-200" key={item}>
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
