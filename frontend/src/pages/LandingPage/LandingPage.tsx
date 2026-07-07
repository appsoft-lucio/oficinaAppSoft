import { Link } from 'react-router-dom'
import FeatureCard, { type FeatureCardProps } from '../../components/FeatureCard/FeatureCard'
import LandingFooter from '../../components/LandingFooter/LandingFooter'
import LandingHeader from '../../components/LandingHeader/LandingHeader'
import './LandingPage.css'

const features: FeatureCardProps[] = [
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
      <LandingHeader />

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
            <FeatureCard key={feature.title} {...feature} />
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

      <LandingFooter />
    </>
  )
}
