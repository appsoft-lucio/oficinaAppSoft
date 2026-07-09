import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type ProtectedRouteProps = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      setIsAuthenticated(Boolean(data.session))
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
