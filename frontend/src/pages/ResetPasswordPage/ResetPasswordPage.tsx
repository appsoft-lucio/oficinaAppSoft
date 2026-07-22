import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [wasUpdated, setWasUpdated] = useState(false)

  useEffect(() => {
    let isMounted = true
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true)
        setIsChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setHasSession(Boolean(data.session))
      setIsChecking(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (password.length < 8) {
      setMessage('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmation) {
      setMessage('As senhas informadas não são iguais.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (error) {
      setMessage('O link expirou ou não foi possível alterar a senha. Solicite um novo link.')
      return
    }

    await supabase.auth.signOut()
    setWasUpdated(true)
    setMessage('Senha alterada com sucesso. Você já pode entrar com a nova senha.')
  }

  return (
    <AuthLayout
      description="Defina uma nova senha para recuperar o acesso ao painel."
      eyebrow="Recuperação de acesso"
      title="Crie uma nova senha segura para sua conta."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Redefinir senha</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use uma senha nova, com no mínimo 8 caracteres.
        </p>
      </div>

      {isChecking ? (
        <p className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
          Validando o link de recuperação...
        </p>
      ) : null}

      {!isChecking && !hasSession && !wasUpdated ? (
        <div className="mt-8 space-y-4">
          <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            Este link é inválido ou expirou. Solicite um novo e-mail.
          </p>
          <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-orange-600 px-6 font-black text-white" to="/esqueci-minha-senha">
            Solicitar novo link
          </Link>
        </div>
      ) : null}

      {hasSession && !wasUpdated ? (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <AuthField autoComplete="new-password" label="Nova senha" name="password" onChange={setPassword} placeholder="Digite a nova senha" required type="password" value={password} />
          <AuthField autoComplete="new-password" label="Confirme a nova senha" name="confirmation" onChange={setConfirmation} placeholder="Repita a nova senha" required type="password" value={confirmation} />
          {message ? <p className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">{message}</p> : null}
          <button className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white hover:bg-orange-700 disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Alterando senha...' : 'Salvar nova senha'}
          </button>
        </form>
      ) : null}

      {wasUpdated ? (
        <div className="mt-8 space-y-4">
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>
          <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-orange-600 px-6 font-black text-white" to="/login">
            Entrar no sistema
          </Link>
        </div>
      ) : null}
    </AuthLayout>
  )
}
