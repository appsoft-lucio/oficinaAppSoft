import { Link } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-Photoroom.png'
import './LandingPage.css'

type Feature = {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '📋',
    title: 'Ordens de Serviço',
    description: 'Organize e acompanhe todos os serviços em tempo real com status claro.',
  },
  {
    icon: '👥',
    title: 'Gestão de Clientes',
    description: 'Mantenha histórico completo de clientes, veículos e histórico de serviços.',
  },
  {
    icon: '📦',
    title: 'Controle de Estoque',
    description: 'Monitore peças e insumos com alertas automáticos de baixo estoque.',
  },
  {
    icon: '📄',
    title: 'Emissão de NF-e e RPA',
    description: 'Emita notas fiscais eletrônicas e recibos de forma rápida e segura.',
  },
  {
    icon: '📊',
    title: 'Relatórios e Analytics',
    description: 'Acompanhe faturamento, performance e métricas da sua oficina.',
  },
  {
    icon: '🔒',
    title: 'Segurança e Backup',
    description: 'Seus dados 100% protegidos com backup automático na nuvem.',
  },
]

export default function LandingPage() {
  return (
    <>
      <header className="nav-bar">
        <div className="nav-container">
          <img className="nav-logo" src={logoAppSoft} alt="AppSoft" />
          <nav className="nav-links" aria-label="Principal">
            <button className="nav-link">Recursos</button>
            <button className="nav-link">Preços</button>
            <button className="nav-link">Sobre</button>
          </nav>
          <div className="nav-actions">
            <Link className="btn-login" to="/login">
              Login
            </Link>
            <Link className="btn-signup" to="/login">
              Cadastre-se
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">Software para oficina</p>
          <h1>Gestão completa de oficina de autos</h1>
          <p className="hero-description">
            Controle suas ordens de serviço, clientes, estoque e emita notas fiscais com simplicidade.
            Aumente sua produtividade com a plataforma AppSoft.
          </p>
          <div className="hero-buttons">
            <Link className="btn-primary" to="/login">
              Começar agora
            </Link>
            <button className="btn-secondary">Ver demo</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2>Tudo que você precisa para gerenciar sua oficina</h2>
          <p>Funcionalidades completas e intuitivas para crescer seu negócio</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Pronto para começar?</h2>
          <p>Junte-se a centenas de oficinas que confiam na AppSoft para gerenciar seus negócios.</p>
          <Link className="btn-primary-large" to="/login">
            Criar conta grátis
          </Link>
          <p className="cta-footer">Sem cartão de crédito necessário. Acesso imediato.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <img className="footer-logo" src={logoAppSoft} alt="AppSoft" />
          <p>&copy; 2026 AppSoft. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  )
}
