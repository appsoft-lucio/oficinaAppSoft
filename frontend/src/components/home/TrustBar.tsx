import { trustIndicators } from '../../data/home'

export default function TrustBar() {
  return (
    <section className="px-5 pb-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200 md:grid-cols-3">
        {trustIndicators.map((item) => (
          <article className="rounded-xl bg-slate-50 p-4" key={item.label}>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              {item.label}
            </span>
            <strong className="mt-2 block text-lg font-black leading-snug text-slate-950">
              {item.value}
            </strong>
          </article>
        ))}
      </div>
    </section>
  )
}
