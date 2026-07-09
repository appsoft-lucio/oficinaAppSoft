import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type DashboardTopbarProps = {
  onOpenMenu: () => void
}

export default function DashboardTopbar({ onOpenMenu }: DashboardTopbarProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="relative flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 pr-20 sm:px-8 sm:pr-24 lg:flex-row lg:items-center lg:justify-between">
      <button
        className="absolute right-5 top-5 min-h-8 rounded-lg bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800 sm:right-8"
        onClick={handleLogout}
        type="button"
      >
        Sair
      </button>

      <div className="flex items-start gap-4">
        <button
          aria-label="Abrir menu"
          className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-950 transition hover:bg-slate-50 lg:hidden"
          onClick={onOpenMenu}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Painel logado
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard da oficina</h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50">
          Exportar relatório
        </button>
        <button className="min-h-11 rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-700">
          Nova ordem
        </button>
      </div>
    </header>
  )
}
