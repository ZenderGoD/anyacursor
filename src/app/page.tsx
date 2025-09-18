import Navigation from '@/components/landing/navigation';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import FooterSection from '@/components/landing/footer-section';

// Raj's Beautiful Landing Page
export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <FooterSection />
    </div>
  );
}
