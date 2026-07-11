import { Link, NavLink, useNavigate } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { supabase } from '../../lib/supabase'

const menuItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Ordens', to: '/ordens' },
  { label: 'Clientes', to: '/clientes' },
  { label: 'Veículos', to: '/veiculos' },
  { label: 'Financeiro', to: '/financeiro' },
  { label: 'Fiscal', to: '/fiscal' },
]

type DashboardSidebarProps = {
  oficinaName: string
}

export default function DashboardSidebar({ oficinaName }: DashboardSidebarProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="flex min-h-screen flex-col bg-slate-950 px-5 py-6 text-white">
      <Link to="/">
        <img className="h-16 w-auto" src={logoAppSoft} alt="Oficina AppSoft" />
      </Link>

      <div className="mt-8 rounded-xl bg-white/5 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
          Oficina
        </p>
        <strong className="mt-1 block text-lg font-black">{oficinaName}</strong>
        <span className="text-sm text-slate-400">Plano inicial</span>
      </div>

      <nav className="mt-8 grid gap-2">
        {menuItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto rounded-lg border border-slate-800 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
        onClick={handleLogout}
        type="button"
      >
        Sair
      </button>
    </aside>
  )
}
