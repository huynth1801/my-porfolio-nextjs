import AboutSection from "./components/about-section";
import EducationSection from "./components/education-section";
import ExperienceSection from "./components/experience-section";
import SkillSection from "./components/skill";

export default function Home() {
  return (
    <main className="bg-[#0d0d0f]">
      <AboutSection />
      <ExperienceSection />
      <SkillSection />
      <EducationSection
        title="Education & Training"
        subtitle="A short list of degrees and certifications"
        items={[
          {
            id: "uni-1",
            school: "Ho Chi Minh City University of Technology",
            degree: "B.Sc. Computer Science",
            field: "Software Engineering",
            startDate: "2016",
            endDate: "2020",
            description: "Graduated with honors. Focus on frontend engineering, UX and algorithms.",
            tags: ["Honors", "GPA 3.8"],
            logoSrc: "/logos/hcmut.png",
          },
          {
            id: "course-1",
            school: "Frontend Masters",
            degree: "Advanced React Patterns",
            startDate: "2022",
            endDate: "2022",
            description: "Practical patterns and state management.",
            tags: ["Certificate"],
          },
        ]}
      />
    </main>
  );
}
