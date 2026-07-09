type SummaryCardProps = {
  label: string
  value: string
  detail: string
}

export default function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <span className="text-sm font-black text-slate-500">{label}</span>
      <strong className="mt-3 block text-3xl font-black text-slate-950">{value}</strong>
      <p className="mt-2 text-sm font-bold text-orange-600">{detail}</p>
    </article>
  )
}
