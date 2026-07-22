import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type DeveloperRouteProps = {
  children: ReactNode
}

export default function DeveloperRoute({ children }: DeveloperRouteProps) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied' | 'signed-out'>('loading')

  useEffect(() => {
    async function checkAccess() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        setStatus('signed-out')
        return
      }

      const { data, error } = await supabase
        .from('app_admins')
        .select('user_id')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      setStatus(!error && data ? 'allowed' : 'denied')
    }

    checkAccess()
  }, [])

  if (status === 'loading') {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
        <p className="font-black">Validando acesso de desenvolvedor...</p>
      </main>
    )
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (status === 'denied') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
