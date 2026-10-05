import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const projectsData = [
  {
    id: "1",
    title: "Educational Management System (EMS)",
    description: "Architected the backend and spearheaded frontend integration for a comprehensive gamified EMS using Django and React. Designed a complex relational database schema mapping intricate many-to-many relationships.",
    period: "August 2025 - June 2026",
    role: "Full Stack Engineer @ IYF Studios",
    tech: ["Django", "React", "PostgreSQL"],
  },
  {
    id: "2",
    title: "Membership Platform",
    description: "Engineered a secure, highly scalable membership platform using Django. Designed robust user provisioning workflows, implemented strict Role-Based Access Control (RBAC), and managed the database architecture for complex subscription lifecycles.",
    period: "Jan 2026 - Mar 2026",
    role: "Backend Engineer @ Heckerbella",
    tech: ["Django", "RBAC", "PostgreSQL"],
  },
  {
    id: "3",
    title: "Job/Recruitment Platform",
    description: "Designed a multi-tenant backend utilizing Django and PostgreSQL. Engineered a highly concurrent job queue system using Celery and Redis for asynchronous processing. Integrated sub-millisecond full-text search capabilities.",
    period: "Aug 2024 - Mar 2025",
    role: "Backend Engineer @ Heckerbella",
    tech: ["Django", "PostgreSQL", "Celery", "Redis"],
  },
  {
    id: "4",
    title: "Linux Workstation Configuration",
    description: "Maintain a custom Arch-based (Hyprland) development environment. Proficient in shell scripting and system resource management.",
    period: "Ongoing",
    role: "Personal Project",
    tech: ["Arch Linux", "Hyprland", "Shell Scripting"],
  },
  {
    id: "5",
    title: "libp2p Decentralized Protocols",
    description: "Active interest in the libp2p ecosystem and decentralized network protocols.",
    period: "Ongoing",
    role: "Open Source",
    tech: ["libp2p", "Decentralized Networks"],
  }
];

const ProjectsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto" ref={containerRef}>
        <div className="relative ml-4 md:ml-8 space-y-16">
          {/* Base border line (dim) */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />
          
          {/* Animated active line */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 w-[2px] bg-chocolate-accent shadow-[0_0_15px_var(--color-chocolate-accent)] origin-top z-0" 
            style={{ scaleY }}
          />

          {projectsData.map((project) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0.3, x: -20, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: false, margin: "-200px 0px" }}
              transition={{ duration: 0.6 }}
              className="relative pl-8 md:pl-16 group z-10"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-chocolate-dark border-2 border-chocolate-accent group-hover:bg-chocolate-accent group-hover:shadow-[0_0_15px_var(--color-chocolate-accent)] transition-all duration-300 z-10" />
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4">
                <h3 className="text-2xl md:text-4xl font-black text-white group-hover:text-chocolate-accent transition-colors">
                  {project.title}
                </h3>
                <span className="text-sm uppercase tracking-widest font-tech text-white/40">
                  {project.period}
                </span>
              </div>
              
              <p className="text-chocolate-accent text-sm md:text-base font-bold mb-4 font-tech uppercase tracking-widest">
                {project.role}
              </p>
              
              <p className="text-white/60 text-lg leading-relaxed font-light mb-6">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white/80 group-hover:border-chocolate-accent/30 transition-colors">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
