import { Link } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo'

export default function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <BrandLogo className="dashboard-logo" />
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
  )
}
