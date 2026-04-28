import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import zloanPic from "../../public/zloan.webp";
import jobApiPic from "../../public/jobApi.webp";
import primersGptPic from "../../public/primersGPT.webp";

const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filterButtons = [
    { name: "All", filter: "all" },
    { name: "Personal", filter: "personal" },
    { name: "Freelance", filter: "freelance" },
    { name: "Open Source", filter: "contributions" },
  ];

  const projects = [
    {
      id: 1,
      title: "SaaS Subscription API",
      description: "A high-performance backend orchestration layer for multi-tenant SaaS platforms.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1470&q=80",
      category: "personal",
      colSpan: 2,
      rowSpan: 2,
      theme: "glass" as const,
      tech: ["FastAPI", "PostgreSQL", "Redis"]
    },
    {
      id: 2,
      title: "Zloan",
      description: "Financial management & loan tracking ecosystem.",
      image: zloanPic,
      category: "personal",
      colSpan: 2,
      rowSpan: 1,
      theme: "dark" as const,
      tech: ["Django", "React"]
    },
    {
      id: 3,
      title: "PrimersGPT",
      description: "AI-driven knowledge distillation platform.",
      image: primersGptPic,
      category: "freelance",
      colSpan: 1,
      rowSpan: 1,
      theme: "accent" as const,
      tech: ["React", "n8n", "OpenAI"]
    },
    {
      id: 4,
      title: "Job Management",
      description: "Productivity tool for the modern job seeker.",
      image: jobApiPic,
      category: "personal",
      colSpan: 1,
      rowSpan: 1,
      theme: "glass" as const,
      tech: ["Node.js", "Express"]
    },
    {
        id: 5,
        title: "Ace Compiler",
        description: "Custom programming language implementation.",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1470&q=80",
        category: "personal",
        colSpan: 4,
        rowSpan: 1,
        theme: "dark" as const,
        tech: ["Python", "LLVM"]
      },
  ];

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 mb-20 w-fit mx-auto md:mx-0">
          {filterButtons.map((button) => (
            <button
              key={button.filter}
              onClick={() => setActiveFilter(button.filter)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeFilter === button.filter 
                  ? "bg-chocolate-accent text-chocolate-dark" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {button.name}
            </button>
          ))}
        </div>

        <BentoGrid>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <BentoCard 
                key={project.id}
                colSpan={project.colSpan as any}
                rowSpan={project.rowSpan as any}
                theme={project.theme}
                className="group"
              >
                <div className="absolute inset-0 z-0">
                    <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolate-dark via-transparent to-transparent" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map(t => (
                        <span key={t} className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-white/10 rounded-md backdrop-blur-md">
                            {t}
                        </span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold mb-2 group-hover:text-chocolate-accent transition-colors">{project.title}</h3>
                  <p className="text-white/60 text-lg line-clamp-2">{project.description}</p>
                </div>
              </BentoCard>
            ))}
          </AnimatePresence>
        </BentoGrid>
      </div>
    </section>
  );
};

export default ProjectsSection;
