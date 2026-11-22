import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Journey from "@/components/Journey";
import SectionDivider from "@/components/SectionDivider";
import Achievements from "@/components/Achievements";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Intro from "@/components/intro/Intro";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Journey />
        <SectionDivider />
        <Achievements />
        <Skills />
      </main>
      <Footer />
      <BackToTop />
      <Intro />
    </>
  );
}
