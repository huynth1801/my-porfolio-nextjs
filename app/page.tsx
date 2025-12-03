import AboutSection from "./components/about-section";
import EducationSection from "./components/education-section";
import ExperienceSection from "./components/experience-section";
import SkillSection from "./components/skill";

export default function Home() {
  const educations = [
    {
      id: "uni-1",
      school: "Ho Chi Minh City University of Technology",
      degree: "Electronics and Telecommunication Engineering",
      startDate: "2018",
      endDate: "2022",
      description: "Graduated with honors. Focus on frontend engineering, UX and algorithms.",
      logoSrc: "/logos/hcmut.png",
    },
    {
      id: "uni-2",
      school: "UEH University",
      degree: "Software Engineering",
      startDate: "2023",
      endDate: "2025",
      description: "Practical patterns and state management.",
      tags: ["Certificate"],
    },
  ];
  return (
    <main className="bg-[#0d0d0f]">
      <AboutSection />
      <ExperienceSection />
      <SkillSection />
      <EducationSection
        title="Education & Training"
        subtitle="A short list of degrees and certifications"
        items={educations}
      />
    </main>
  );
}
