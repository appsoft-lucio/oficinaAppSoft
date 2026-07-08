type MetricCardProps = {
  label: string
  value: string
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded-lg bg-white/10 p-4">
      <strong className="block text-2xl font-black">{value}</strong>
      <span className="text-xs font-bold text-slate-300">{label}</span>
    </article>
  )
}
