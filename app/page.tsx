import AboutSection from "./components/about-section";
import EducationSection from "./components/education-section";
import ExperienceSection from "./components/experience-section";
import SkillSection from "./components/skill";
import { HeroSection } from "./components/sections/hero-section";
import { ProjectsSection } from "./components/sections/projects-section";
import { ContactCta } from "./components/sections/contact-cta";
import { JourneyCanvas } from "./components/journey/journey-canvas";
import { SmoothScroll } from "./components/journey/smooth-scroll";
import { educations } from "@/lib/content";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <JourneyCanvas />
      {/* main ignores pointer events so the 3D room stays draggable during
          the hero; each section below opts back in with pointer-events-auto */}
      <main className="pointer-events-none relative z-10">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillSection />
        <EducationSection
          title="Education & Training"
          subtitle="A short list of degrees and certifications"
          items={educations}
        />
        <ContactCta />
      </main>
    </>
  );
}
