export function JsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Huy Nguyen",
    additionalName: "Nguyen Thai Huu Huy",
    jobTitle: "Frontend Developer",
    email: "huuhuy1801@gmail.com",
    url: "https://my-porfolio-nextjs.vercel.app",
    image: "https://my-porfolio-nextjs.vercel.app/huy.jpg",
    description:
      "Frontend developer in Ho Chi Minh City building playful, high-performance web experiences with React, Next.js and WebGL.",
    sameAs: ["https://github.com/huynth1801", "https://www.linkedin.com/in/huy-nguyen-085382206/"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "Vietnam",
    },
    worksFor: {
      "@type": "Organization",
      name: "TGM Research",
    },
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "Ho Chi Minh City University of Technology",
      },
      {
        "@type": "EducationalOrganization",
        name: "UEH University",
      },
    ],
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Three.js",
      "WebGL",
      "React Three Fiber",
      "GSAP",
      "Tailwind CSS",
      "Fullstack Web Development",
      "Game Development",
      "Web Performance Optimization",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Huy Nguyen — Frontend Developer Portfolio",
    url: "https://my-porfolio-nextjs.vercel.app",
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: "Huy Nguyen",
    },
    description:
      "Frontend developer in Ho Chi Minh City building playful, high-performance web experiences with React, Next.js and WebGL.",
  };

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Huy Nguyen",
      jobTitle: "Frontend Developer",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
    </>
  );
}
