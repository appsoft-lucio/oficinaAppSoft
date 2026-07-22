import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ensureUserOficina } from '../../services/oficinas'

type ProtectedRouteProps = {
  children: ReactNode
}

type Access = 'allowed' | 'denied' | 'developer' | 'expired' | 'inactive'

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [access, setAccess] = useState<Access>('denied')

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setIsLoading(false)
        return
      }

      const { data: admin } = await supabase
        .from('app_admins')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (admin) {
        setAccess('developer')
        setIsLoading(false)
        return
      }

      try {
        const oficina = await ensureUserOficina({
          fallbackName: String(data.user.user_metadata.workshop_name || 'Minha Oficina'),
          userId: data.user.id,
        })
        const trialExpired = oficina.trial_ends_at
          ? new Date(oficina.trial_ends_at).getTime() <= Date.now()
          : false

        setAccess(oficina.status !== 'ativo' ? 'inactive' : trialExpired ? 'expired' : 'allowed')
      } catch {
        setAccess('denied')
      }

      setIsLoading(false)
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
            Oficina AppSoft
          </p>
          <h1 className="mt-3 text-2xl font-black">Carregando painel...</h1>
        </div>
      </main>
    )
  }

  if (access === 'denied') return <Navigate to="/login" replace />
  if (access === 'developer') return <Navigate to="/desenvolvedor" replace />
  if (access === 'expired' || access === 'inactive') {
    return <Navigate state={{ reason: access }} to="/acesso-indisponivel" replace />
  }

  return children
}
