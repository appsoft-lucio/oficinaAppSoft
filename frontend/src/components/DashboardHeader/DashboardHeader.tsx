import { Link } from 'react-router-dom'

type DashboardHeaderProps = {
  userName: string
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="dashboard-kicker">Oficina AppSoft</p>
        <h1>Bem-vindo, {userName}</h1>
      </div>
      <Link className="dashboard-profile" to="/login">
        Perfil
      </Link>
    </header>
  )
}
