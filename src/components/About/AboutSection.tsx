import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import me from "../../public/me.webp";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";

type ExpandedType = "journey" | "toolkit" | null;

const AboutSection = () => {
  const [expandedType, setExpandedType] = useState<ExpandedType>(null);

  const skills = [
    { name: "Golang", level: 90, category: "Backend" },
    { name: "Python", level: 95, category: "Backend" },
    { name: "Django", level: 92, category: "Backend" },
    { name: "TypeScript", level: 88, category: "Frontend" },
    { name: "React", level: 90, category: "Frontend" },
    { name: "FastAPI", level: 85, category: "Backend" },
    { name: "AWS", level: 80, category: "Infrastructure" },
    { name: "Docker", level: 85, category: "Infrastructure" },
    { name: "Kubernetes", level: 75, category: "Infrastructure" },
    { name: "GraphQL", level: 82, category: "Backend" },
    { name: "PostgreSQL", level: 90, category: "Database" },
    { name: "Node.js", level: 85, category: "Backend" },
  ];

  const experiences = [
    {
      company: "Jaa Africa",
      role: "Python Developer (Django)",
      period: "April 2025 - Present",
      details: [
        "Architecting robust backend systems for financial ecosystems.",
        "Optimizing database performance and implementing secure REST APIs.",
        "Collaborating on high-fidelity user interfaces integrated with Django.",
      ],
    },
    {
      company: "Techivate",
      role: "Backend Engineer",
      period: "2023",
      details: [
        "Built and maintained scalable API services for client projects.",
        "Streamlined deployment pipelines using Docker and CI/CD tools.",
        "Integrated third-party payment gateways and notification systems.",
      ],
    },
    {
      company: "Freelance / Open Source",
      role: "Software Engineer",
      period: "2022 - Present",
      details: [
        "Developing custom compilers and specialized AI automation tools.",
        "Contributing to various open-source Python and JavaScript projects.",
        "Consulting for startups on infrastructure and backend architecture.",
      ],
    },
    {
      company: "Project Ace",
      role: "Lead Compiler Architect",
      period: "2022",
      details: [
        "Designed and implemented a custom programming language syntax.",
        "Engineered efficient lexical analysis and parsing algorithms.",
        "Managed memory allocation and bytecode generation processes.",
      ],
    },
    {
      company: "Smart Logic Systems",
      role: "Backend Intern",
      period: "2021",
      details: [
        "Assisted in the development of data processing microservices.",
        "Wrote automated unit tests for core backend functionality.",
        "Learned industry-standard DevOps practices and cloud deployments.",
      ],
    },
    {
      company: "Dev Community Lead",
      role: "Technical Mentor",
      period: "2021 - 2023",
      details: [
        "Led workshops on modern web architecture and performance.",
        "Mentored junior developers on system design principles.",
        "Curated technical content for a community of 500+ engineers.",
      ],
    },
    {
      company: "FinTech Solutions",
      role: "Contract Engineer",
      period: "2023",
      details: [
        "Implemented high-security ledger systems for payment tracking.",
        "Integrated real-time currency conversion APIs with low latency.",
        "Refactored legacy codebases to improve maintainability and speed.",
      ],
    },
    {
      company: "Nexus Labs",
      role: "Systems Research",
      period: "2024",
      details: [
        "Researched next-generation distributed systems and consensus protocols.",
        "Built prototypes for decentralized data storage solutions.",
        "Optimized networking layers for high-throughput data streams.",
      ],
    },
  ];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedType(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BentoGrid>
          <BentoCard
            colSpan={1}
            rowSpan={1}
            className="p-0 border-0 overflow-hidden"
          >
            <img
              src={me}
              alt="Aaron"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </BentoCard>

          <BentoCard colSpan={1} rowSpan={1} theme="glass">
            <div className="h-full flex flex-col justify-between">
              <h3 className="text-xl font-black leading-tight">
                Bridging <span className="text-chocolate-accent">logic</span> &
                aesthetics.
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://github.com/blacac3"
                  target="_blank"
                  className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <FaGithub size={18} />
                </a>
                <a
                  href="https://linkedin.com/in/aaron-ezeala"
                  target="_blank"
                  className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>
          </BentoCard>

          {/* Journey Expansion */}
          <motion.div
            layoutId="journey-card"
            className="md:col-span-2 md:row-span-2 cursor-pointer group"
            onClick={() => setExpandedType("journey")}
          >
            <BentoCard colSpan={2} rowSpan={2} theme="dark" className="h-full">
              <div className="h-full flex flex-col pointer-events-none">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-chocolate-accent">
                    Professional Journey
                  </h4>
                  <span className="text-[10px] font-black text-white/20 group-hover:text-chocolate-accent transition-colors uppercase tracking-widest font-tech">
                    Explore
                  </span>
                </div>
                <div className="space-y-8">
                  {experiences.slice(0, 3).map((exp, i) => (
                    <div key={i} className="border-l border-white/10 pl-6 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-xl text-white">
                          {exp.company}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-white/30">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-chocolate-accent text-sm font-bold">
                        {exp.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Toolkit Expansion */}
          <motion.div
            layoutId="toolkit-card"
            className="md:col-span-1 md:row-span-1 cursor-pointer group"
            onClick={() => setExpandedType("toolkit")}
          >
            <BentoCard colSpan={1} rowSpan={1} className="h-full">
              <div className="h-full flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 font-tech">
                    Toolkit
                  </h4>
                  <span className="text-[8px] font-black opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-tech">
                    Details
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill.name}
                      className="px-2 py-1 bg-black/10 rounded text-[10px] font-black font-tech"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </BentoCard>
          </motion.div>

          <BentoCard colSpan={1} rowSpan={1} theme="glass">
            <div className="h-full flex flex-col justify-center text-center">
              <p className="text-5xl font-black text-chocolate-accent tracking-tighter font-tech">
                20+
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-2 font-tech">
                Projects Delivered
              </p>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* MODAL ARCHITECTURE */}
        <AnimatePresence>
          {expandedType && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedType(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[199] cursor-zoom-out"
              />
              <motion.div
                layoutId={
                  expandedType === "journey" ? "journey-card" : "toolkit-card"
                }
                className="fixed top-12 md:top-24 inset-x-16 bottom-3 bg-chocolate-dark/40 backdrop-blur-2xl z-[200] overflow-hidden flex flex-col rounded-3xl shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] border border-white/10"
              >
                <div className="p-7 md:px-20 flex justify-between items-center border-b border-white/5 bg-white/2">
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.6em] font-black text-chocolate-accent mb-2 font-tech">
                      {expandedType === "journey"
                        ? "Professional Journey"
                        : "Technical Proficiency"}
                    </h4>
                    <p className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">
                      {expandedType === "journey"
                        ? "Full Timeline"
                        : "The Toolkit"}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedType(null)}
                    className="p-4 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all group"
                  >
                    <FaTimes
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 md:px-20 no-scrollbar scroll-smooth">
                  <div className="max-w-5xl mx-auto py-10 pb-40">
                    {expandedType === "journey" ? (
                      <div className="space-y-24">
                        {experiences.map((exp, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            key={i}
                            className="border-l-2 border-chocolate-accent/20 pl-8 md:pl-12 relative"
                          >
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-chocolate-accent shadow-[0_0_15px_var(--color-chocolate-accent)]" />
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                              <div>
                                <p className="font-black text-3xl md:text-4xl text-white mb-2 tracking-tight">
                                  {exp.company}
                                </p>
                                <p className="text-chocolate-accent text-lg font-bold font-tech uppercase tracking-widest">
                                  {exp.role}
                                </p>
                              </div>
                              <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-black text-white/40 font-tech whitespace-nowrap">
                                {exp.period}
                              </span>
                            </div>
                            <ul className="space-y-4">
                              {exp.details.map((detail, j) => (
                                <li
                                  key={j}
                                  className="text-lg text-white/60 leading-relaxed font-light flex gap-4"
                                >
                                  <span className="text-chocolate-accent font-black mt-1">
                                    /
                                  </span>{" "}
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                        {skills.map((skill, i) => (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            key={skill.name}
                            className="group"
                          >
                            <div className="flex justify-between items-end mb-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-white/20 mb-1 font-tech">
                                  {skill.category}
                                </p>
                                <p className="text-2xl font-black text-white tracking-tight">
                                  {skill.name}
                                </p>
                              </div>
                              <p className="text-2xl font-black text-chocolate-accent font-tech">
                                {skill.level}%
                              </p>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{
                                  duration: 1.5,
                                  ease: "circOut",
                                  delay: 0.5,
                                }}
                                className="h-full bg-gradient-to-r from-chocolate-accent/40 to-chocolate-accent shadow-[0_0_15px_var(--color-chocolate-accent)]"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AboutSection;
