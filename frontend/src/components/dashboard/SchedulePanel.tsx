import type { OrdemServico } from '../../services/ordens'

type SchedulePanelProps = {
  ordens: OrdemServico[]
}

const statusLabels: Record<string, string> = {
  aberta: 'Aberta',
  aguardando_peca: 'Aguardando peca',
  cancelada: 'Cancelada',
  concluida: 'Concluida',
  em_andamento: 'Em andamento',
}

export default function SchedulePanel({ ordens }: SchedulePanelProps) {
  const statusSummary = Object.entries(
    ordens.reduce<Record<string, number>>((acc, ordem) => {
      acc[ordem.status] = (acc[ordem.status] ?? 0) + 1
      return acc
    }, {}),
  )

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <h2 className="text-xl font-black text-slate-950">Status das ordens</h2>
      <p className="mt-1 text-sm text-slate-500">Resumo operacional atual.</p>

      <div className="mt-5 space-y-4">
        {statusSummary.length > 0 ? (
          statusSummary.map(([status, total]) => (
            <article className="flex items-center gap-4" key={status}>
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-black text-orange-700">
                {total}
              </span>
              <div>
                <strong className="block font-black text-slate-950">
                  {statusLabels[status] ?? status}
                </strong>
                <span className="text-sm text-slate-500">ordem(ns) neste status</span>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">
            Nenhuma ordem para resumir.
          </p>
        )}
      </div>
    </section>
  )
}
