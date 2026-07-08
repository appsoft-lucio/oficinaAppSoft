import type { ServiceStatusTone } from '../../data/home'

type ServiceRowProps = {
  title: string
  status: string
  statusTone: ServiceStatusTone
}

const statusColors = {
  orange: 'text-orange-600',
  slate: 'text-slate-600',
}

export default function ServiceRow({ title, status, statusTone }: ServiceRowProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[15px] font-bold leading-snug">{title}</span>
      <span className={`text-sm font-black ${statusColors[statusTone]}`}>{status}</span>
    </div>
  )
}
