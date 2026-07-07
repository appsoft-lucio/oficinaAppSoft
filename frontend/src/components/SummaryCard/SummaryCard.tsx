export type SummaryCardProps = {
  label: string
  value: string
  detail: string
}

export default function SummaryCard({ label, value, detail }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}
