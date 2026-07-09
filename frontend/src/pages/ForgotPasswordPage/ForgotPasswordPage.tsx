import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    setIsSubmitting(false)

    if (error) {
      setMessage('Nao foi possivel enviar o link. Confira o e-mail e tente novamente.')
      return
    }

    setMessage('Link enviado. Verifique sua caixa de entrada.')
  }

  return (
    <AuthLayout
      description="Informe seu e-mail para receber as instrucoes de recuperacao quando a autenticacao estiver conectada."
      eyebrow="Recuperacao de acesso"
      title="Recupere o acesso ao painel sem interromper a operacao."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Esqueci minha senha</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enviaremos um link de recuperacao para o e-mail cadastrado.
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
          {isSubmitting ? 'Enviando...' : 'Enviar link de recuperacao'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Lembrou a senha?{' '}
          <Link className="font-black text-orange-600 hover:text-orange-700" to="/login">
            Voltar para login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
