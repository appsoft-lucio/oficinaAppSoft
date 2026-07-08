import HeroSection from '../../components/home/HeroSection'
import Header from '../../components/layout/Header'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <HeroSection />
    </main>
  )
}
