type ServiceRowProps = {
  title: string
  status: string
  statusTone: 'orange' | 'slate'
}

const statusColors = {
  orange: 'text-orange-600',
  slate: 'text-slate-600',
}

export default function ServiceRow({ title, status, statusTone }: ServiceRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
      <span className="font-bold">{title}</span>
      <span className={`text-sm font-black ${statusColors[statusTone]}`}>{status}</span>
    </div>
  )
}
