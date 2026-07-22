import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function TrialExpiredPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const reason = (location.state as { reason?: string } | null)?.reason
  const isInactive = reason === 'inactive'

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <AuthLayout
      description="Seu cadastro e seus dados continuam preservados com segurança."
      eyebrow="Status do acesso"
      title={isInactive ? 'Este acesso está temporariamente inativo.' : 'Seu período gratuito de 7 dias terminou.'}
    >
      <h2 className="text-2xl font-black text-slate-950">
        {isInactive ? 'Conta inativa' : 'Período de avaliação encerrado'}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isInactive
          ? 'O responsável pelo sistema desativou temporariamente esta conta.'
          : 'Fale com a equipe da Oficina AppSoft para escolher um plano e continuar usando o painel.'}
      </p>
      <div className="mt-8 grid gap-3">
        <a className="inline-flex min-h-12 items-center justify-center rounded-lg bg-orange-600 px-6 font-black text-white" href="https://wa.me/5531983044087" rel="noreferrer" target="_blank">
          Falar com a AppSoft
        </a>
        <button className="min-h-12 rounded-lg border border-slate-300 px-6 font-black text-slate-700" onClick={handleLogout} type="button">
          Sair da conta
        </button>
        <Link className="text-center text-sm font-bold text-slate-500" to="/">Voltar ao site</Link>
      </div>
    </AuthLayout>
  )
}
