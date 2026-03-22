import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { NumbersSection } from '@/components/landing/NumbersSection';
import { CTASection } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <LiveDemoSection />
      <NumbersSection />
      <CTASection />
    </>
  );
}
