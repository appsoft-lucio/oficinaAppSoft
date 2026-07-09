import { scheduleItems } from '../../data/dashboard'

export default function SchedulePanel() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <h2 className="text-xl font-black text-slate-950">Agenda de hoje</h2>
      <p className="mt-1 text-sm text-slate-500">Compromissos e retornos importantes.</p>

      <div className="mt-5 space-y-4">
        {scheduleItems.map((item) => (
          <article className="flex gap-4" key={`${item.time}-${item.title}`}>
            <time className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-black text-orange-700">
              {item.time}
            </time>
            <div>
              <strong className="block font-black text-slate-950">{item.title}</strong>
              <span className="text-sm text-slate-500">{item.description}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
