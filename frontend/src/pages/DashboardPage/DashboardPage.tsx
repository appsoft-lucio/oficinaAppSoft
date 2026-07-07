import { Link } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-Photoroom.png'
import './DashboardPage.css'

const summaryCards = [
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
      <aside className="dashboard-sidebar">
        <img className="dashboard-logo" src={logoAppSoft} alt="AppSoft Oficina" />
        <nav className="dashboard-nav" aria-label="Painel">
          <Link className="dashboard-nav-link active" to="/dashboard">
            Dashboard
          </Link>
          <button className="dashboard-nav-link" type="button">
            Clientes
          </button>
          <button className="dashboard-nav-link" type="button">
            Ordens
          </button>
          <button className="dashboard-nav-link" type="button">
            Relatórios
          </button>
        </nav>
        <Link className="dashboard-exit" to="/">
          Sair
        </Link>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Oficina AppSoft</p>
            <h1>Bem-vindo, João</h1>
          </div>
          <Link className="dashboard-profile" to="/login">
            Perfil
          </Link>
        </header>

        <section className="summary-grid" aria-label="Resumo do dia">
          {summaryCards.map((card) => (
            <article className="summary-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>

        <div className="dashboard-columns">
          <section className="dashboard-panel">
            <div className="panel-header">
              <h2>Ações rápidas</h2>
            </div>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <button type="button" key={action}>
                  {action}
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-header">
              <h2>Notificações recentes</h2>
            </div>
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification}>{notification}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  )
}
