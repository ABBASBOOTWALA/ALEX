import { HeroSection } from '@/components/landing/HeroSection';
import { ProfileInputForm } from '@/components/landing/ProfileInputForm';
import { FeaturePills } from '@/components/landing/FeaturePills';

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-16 md:py-24" style={{ backgroundColor: '#09090b' }}>
      <div className="max-w-3xl mx-auto">
        <HeroSection />
        <FeaturePills />
        <ProfileInputForm />

        <p className="text-center text-zinc-700 text-xs mt-8">
          Your profile data is never stored. Powered by Claude AI.
        </p>
      </div>
    </main>
  );
}
