type MetricCardProps = {
  label: string
  value: string
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded-lg bg-white/10 p-3 sm:p-4">
      <strong className="block text-[24px] font-black leading-none">{value}</strong>
      <span className="mt-2 block text-[12px] font-bold leading-snug text-slate-300">
        {label}
      </span>
    </article>
  )
}
