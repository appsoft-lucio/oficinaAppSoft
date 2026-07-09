import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout
      description="Entre no painel para acompanhar ordens de serviço, clientes, veículos e indicadores da oficina."
      eyebrow="Acesso ao sistema"
      title="Bem-vindo de volta ao painel da sua oficina."
    >
      <div>
        <h2 className="text-2xl font-black text-slate-950">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use os dados preenchidos para acessar a demonstração.
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <AuthField
          defaultValue="demo@appsoft.com"
          label="E-mail"
          name="email"
          placeholder="seuemail@exemplo.com"
          type="email"
        />
        <AuthField
          defaultValue="123456"
          label="Senha"
          name="password"
          placeholder="Sua senha"
          type="password"
        />

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

        <Link
          className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-orange-600 px-6 font-black text-white transition hover:bg-orange-700"
          to="/dashboard"
        >
          Entrar no painel
        </Link>
      </form>
    </AuthLayout>
  )
}
