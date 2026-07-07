import type { ReactNode } from 'react'

type DashboardPanelProps = {
  title: string
  children: ReactNode
}

export default function DashboardPanel({ title, children }: DashboardPanelProps) {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}
