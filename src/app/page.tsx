import { HeroSection } from "@/components/landing/hero-section";
import { HeroHeader } from "@/components/hero-header";
import { Features } from "@/components/landing/features";
import { WallOfLoveSection } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FooterSection } from "@/components/footer";
import { CallToAction } from "@/components/landing/call-to-action";

export default function Page() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <Features />
      <WallOfLoveSection />
      <Pricing />
      <CallToAction />
      <FooterSection />
    </>
  )
}
