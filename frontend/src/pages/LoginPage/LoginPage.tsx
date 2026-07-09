import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@appsoft.com')
  const [password, setPassword] = useState('123456')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    if (email === 'demo@appsoft.com' && password === '123456') {
      setIsSubmitting(false)
      navigate('/dashboard')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setMessage('Nao foi possivel entrar. Confira o e-mail e a senha.')
      return
    }

    navigate('/dashboard')
  }

  return (
    <AuthLayout
      description="Entre no painel para acompanhar ordens de servico, clientes, veiculos e indicadores da oficina."
      eyebrow="Acesso ao sistema"
      title="Bem-vindo de volta ao painel da sua oficina."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use os dados preenchidos para acessar a demonstracao.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthField
          autoComplete="email"
          label="E-mail"
          name="email"
          onChange={setEmail}
          placeholder="seuemail@exemplo.com"
          required
          type="email"
          value={email}
        />
        <AuthField
          autoComplete="current-password"
          label="Senha"
          name="password"
          onChange={setPassword}
          placeholder="Sua senha"
          required
          type="password"
          value={password}
        />

        {message ? (
          <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="font-bold text-orange-600 hover:text-orange-700"
            to="/esqueci-minha-senha"
          >
            Esqueci minha senha
          </Link>
          <Link className="font-bold text-slate-600 hover:text-slate-950" to="/criar-conta">
            Criar conta
          </Link>
        </div>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar no painel'}
        </button>
      </form>
    </AuthLayout>
  )
}
