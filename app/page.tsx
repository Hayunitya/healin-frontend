import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HeroCarousel from "@/components/landing/HeroCarousel";
import Features from "@/components/landing/Features";
import About from "@/components/landing/About";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroCarousel />
      <Hero />
      <Features />
      <About />
      <CTA />
      <Footer />
    </main>
  );
}