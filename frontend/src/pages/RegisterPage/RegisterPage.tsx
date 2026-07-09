import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'

export default function RegisterPage() {
  return (
    <AuthLayout
      description="Crie uma conta para iniciar a configuração da oficina, cadastrar a equipe e preparar o primeiro painel."
      eyebrow="Novo acesso"
      title="Comece a organizar sua oficina em poucos passos."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Criar conta</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Essa etapa ainda é visual. A criação real será conectada ao Supabase.
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <AuthField label="Nome" name="name" placeholder="Seu nome" />
        <AuthField label="E-mail" name="email" placeholder="seuemail@exemplo.com" type="email" />
        <AuthField label="Senha" name="password" placeholder="Crie uma senha" type="password" />

        <button
          className="min-h-12 w-full rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700"
          type="button"
        >
          Criar minha conta
        </button>

        <p className="text-center text-sm text-slate-500">
          Já tem uma conta?{' '}
          <a className="font-black text-orange-600 hover:text-orange-700" href="/login">
            Entrar
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}
