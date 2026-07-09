import { Link } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'

const menuItems = ['Dashboard', 'Ordens', 'Clientes', 'Veiculos', 'Financeiro']

type DashboardSidebarProps = {
  oficinaName: string
}

export default function DashboardSidebar({ oficinaName }: DashboardSidebarProps) {
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
          <button
            className={`rounded-lg px-4 py-3 text-left text-sm font-black transition ${
              item === 'Dashboard'
                ? 'bg-orange-600 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <Link
        className="mt-auto rounded-lg border border-slate-800 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
        to="/login"
      >
        Sair
      </Link>
    </aside>
  )
}
