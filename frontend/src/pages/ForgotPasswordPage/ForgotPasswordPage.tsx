import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      description="Informe seu e-mail para receber as instruções de recuperação quando a autenticação estiver conectada."
      eyebrow="Recuperação de acesso"
      title="Recupere o acesso ao painel sem interromper a operação."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Esqueci minha senha</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enviaremos um link de recuperação para o e-mail cadastrado.
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <AuthField label="E-mail" name="email" placeholder="seuemail@exemplo.com" type="email" />

        <button
          className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700"
          type="button"
        >
          Enviar link de recuperação
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
