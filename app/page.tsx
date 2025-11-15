import AboutSection from "./components/about-section";
import ExperienceSection from "./components/experience-section";
import SkillSection from "./components/skill";

export default function Home() {
  return (
    <main className="bg-[#0d0d0f]">
      <AboutSection />
      <ExperienceSection />
      <SkillSection />
    </main>
  );
}
