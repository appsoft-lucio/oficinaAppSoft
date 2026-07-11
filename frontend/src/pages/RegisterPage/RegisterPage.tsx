import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setIsSubmitting(false)

    if (error) {
      setMessage('Não foi possível criar a conta. Confira os dados e tente novamente.')
      return
    }

    setMessage('Conta criada. Verifique seu e-mail para confirmar o acesso.')
  }

  return (
    <AuthLayout
      description="Crie uma conta para iniciar a configuracao da oficina, cadastrar a equipe e preparar o primeiro painel."
      eyebrow="Novo acesso"
      title="Comece a organizar sua oficina em poucos passos."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Criar conta</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Crie seu acesso para conectar a oficina ao painel.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthField
          autoComplete="name"
          label="Nome"
          name="name"
          onChange={setName}
          placeholder="Seu nome"
          required
          value={name}
        />
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
          autoComplete="new-password"
          label="Senha"
          name="password"
          onChange={setPassword}
          placeholder="Crie uma senha"
          required
          type="password"
          value={password}
        />

        {message ? (
          <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            {message}
          </p>
        ) : null}

        <button
          className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar minha conta'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Já tem uma conta?{' '}
          <Link className="font-black text-orange-600 hover:text-orange-700" to="/login">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
