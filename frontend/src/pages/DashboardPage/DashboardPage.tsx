import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
import DashboardPanel from '../../components/DashboardPanel/DashboardPanel'
import DashboardSidebar from '../../components/DashboardSidebar/DashboardSidebar'
import SummaryCard, { type SummaryCardProps } from '../../components/SummaryCard/SummaryCard'
import './DashboardPage.css'

const summaryCards: SummaryCardProps[] = [
  { label: 'Ordens hoje', value: '5', detail: '3 concluídas' },
  { label: 'Pendentes', value: '2', detail: '1 aguardando peça' },
  { label: 'Receita hoje', value: 'R$ 1.450', detail: '+12% vs. ontem' },
]

const quickActions = ['Nova ordem', 'Novo cliente', 'Buscar ordem', 'Relatório']

const notifications = [
  'Ordem #2541 concluída',
  'Cliente novo registrado',
  'Relatório diário disponível',
]

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <DashboardSidebar />

      <section className="dashboard-content">
        <DashboardHeader userName="João" />

        <section className="summary-grid" aria-label="Resumo do dia">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </section>

        <div className="dashboard-columns">
          <DashboardPanel title="Ações rápidas">
            <div className="quick-actions">
              {quickActions.map((action) => (
                <button type="button" key={action}>
                  {action}
                </button>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Notificações recentes">
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification}>{notification}</li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      </section>
    </main>
  )
}
