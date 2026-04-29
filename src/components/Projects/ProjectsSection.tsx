import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import { useSanity } from "../../hooks/useSanity";
import { urlFor } from "../../lib/sanity";
import { PortableText } from "@portabletext/react";

interface Project {
  _id: string;
  name: string;
  description?: any;
  mainImage?: any;
  technologies?: string[];
  category?: string;
  projectLink?: string;
  featured?: boolean;
}

const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: sanityProjects, loading } = useSanity<Project[]>(`*[_type == "project"] | order(_createdAt desc)`);

  const filterButtons = [
    { name: "All", filter: "all" },
    { name: "Web App", filter: "web-app" },
    { name: "Mobile App", filter: "mobile-app" },
    { name: "Residential", filter: "residential" },
    { name: "Commercial", filter: "commercial" },
  ];

  const projects = useMemo(() => {
    if (!sanityProjects) return [];
    
    return sanityProjects.map((p, index) => {
      // Logic for bento spans to keep it interesting
      let colSpan = 1;
      let rowSpan = 1;
      
      if (index % 5 === 0) {
        colSpan = 2;
        rowSpan = 2;
      } else if (index % 5 === 1) {
        colSpan = 2;
        rowSpan = 1;
      } else if (index % 5 === 4) {
        colSpan = 4;
        rowSpan = 1;
      }

      return {
        id: p._id,
        title: p.name,
        description: p.description,
        image: p.mainImage ? urlFor(p.mainImage).url() : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1470&q=80",
        category: p.category || "web-app",
        colSpan,
        rowSpan,
        theme: (index % 3 === 0 ? "glass" : index % 3 === 1 ? "dark" : "accent") as "glass" | "dark" | "accent",
        tech: p.technologies || []
      };
    });
  }, [sanityProjects]);

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  if (loading && !sanityProjects) {
    return <div className="py-20 text-center text-white/40 uppercase tracking-widest font-bold font-tech">Loading Masterpieces...</div>;
  }

  if (projects.length === 0 && !loading) {
    return null; // Don't show section if no projects
  }

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
                  <div className="text-white/60 text-lg line-clamp-2">
                    {typeof project.description === 'string' ? (
                      project.description
                    ) : project.description ? (
                      <PortableText value={project.description} />
                    ) : (
                      "View project details"
                    )}
                  </div>
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
