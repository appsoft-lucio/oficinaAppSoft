import ContactSection from '../../components/home/ContactSection'
import FeaturesSection from '../../components/home/FeaturesSection'
import HeroSection from '../../components/home/HeroSection'
import PainPointsSection from '../../components/home/PainPointsSection'
import PricingSection from '../../components/home/PricingSection'
import ProductPreviewSection from '../../components/home/ProductPreviewSection'
import TrustBar from '../../components/home/TrustBar'
import Footer from '../../components/layout/Footer'
import Header from '../../components/layout/Header'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <HeroSection />
      <TrustBar />
      <PainPointsSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
