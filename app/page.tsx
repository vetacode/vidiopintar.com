import HeroSection from "@/components/hero-section";
import { HeroHeader } from "@/components/hero-header";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import CallToAction from "@/components/call-to-action";

export const maxDuration = 60;

export default function Page() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <Features />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  )
}
