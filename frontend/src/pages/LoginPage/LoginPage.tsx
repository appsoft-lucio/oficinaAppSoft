import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-Photoroom.png'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <main className="login-page">
      <Link className="btn-back" to="/">
        ← Voltar
      </Link>

      <section className="login-showcase" aria-label="Resumo AppSoft Oficina">
        <img className="showcase-logo" src={logoAppSoft} alt="AppSoft Oficina" />
        <div className="showcase-copy">
          <p className="showcase-label">Gestão para oficina mecânica</p>
          <h1>Controle sua operação sem perder tempo no balcão.</h1>
          <p>
            Acompanhe ordens de serviço, clientes, estoque e emissão fiscal em uma rotina
            mais simples para sua equipe.
          </p>
        </div>

        <div className="showcase-metrics" aria-label="Indicadores de exemplo">
          <div>
            <strong>24</strong>
            <span>ordens hoje</span>
          </div>
          <div>
            <strong>98%</strong>
            <span>serviços no prazo</span>
          </div>
          <div>
            <strong>R$ 8,4k</strong>
            <span>receita semanal</span>
          </div>
        </div>
      </section>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-header">
          <p className="login-intro">Acesso seguro</p>
          <h2 id="login-title">Entrar na oficina</h2>
          <p className="login-subtitle">Use seus dados para acessar o painel da AppSoft.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="user">E-mail ou usuário</label>
            <input id="user" type="text" placeholder="exemplo@appsoft.com" autoComplete="username" />
          </div>

          <div className="field-group">
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" placeholder="Digite sua senha" autoComplete="current-password" />
          </div>

          <div className="form-options">
            <label className="remember-option" htmlFor="remember">
              <input id="remember" type="checkbox" />
              <span>Lembrar-me</span>
            </label>
            <button className="text-button" type="button">
              Esqueci minha senha
            </button>
          </div>

          <button className="submit-button" type="submit">
            Entrar
          </button>
        </form>

        <div className="signup-callout">
          <span>Ainda não tem conta?</span>
          <button className="text-button strong" type="button">
            Criar cadastro
          </button>
        </div>
      </section>
    </main>
  )
}
