import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import me from "../../public/me.webp";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";

const AboutSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const skills = [
    "Golang",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Django",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "FastAPI",
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

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BentoGrid>
          {/* 1. Profile Image Card */}
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

          {/* 2. Main Narrative */}
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

          {/* 3. MAJOR: Experience Card with Expansion Logic */}
          <motion.div
            layoutId="journey-card"
            className="md:col-span-2 md:row-span-2 cursor-pointer group relative"
            onClick={() => setIsExpanded(true)}
          >
            <BentoCard colSpan={2} rowSpan={2} theme="dark" className="h-full">
              <div className="h-full flex flex-col pointer-events-none">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-chocolate-accent">
                    Professional Journey
                  </h4>
                  <span className="text-[10px] font-black text-white/20 group-hover:text-chocolate-accent transition-colors uppercase tracking-widest">
                    Click to Expand
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

          {/* 4. Skills Card */}
          <BentoCard colSpan={1} rowSpan={1} theme="accent">
            <div className="h-full flex flex-col justify-between">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 font-tech">
                Toolkit
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 8).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-black/10 rounded text-[10px] font-black font-tech"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* 5. Stats Card */}
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

        {/* 6. MODAL EXPANSION */}
        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-2xl z-[100] cursor-zoom-out"
              />
              <motion.div
                layoutId="journey-card"
                className="fixed top-12 md:top-24 inset-x-6 bottom-2 bg-chocolate-dark z-[200] overflow-hidden flex flex-col rounded-[20px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.8)]"
              >
                <div className="p-5 pl-8 flex justify-between items-center border-b border-white/5 bg-white/2">
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.6em] font-black text-chocolate-accent mb-3 font-tech">
                      Professional Journey
                    </h4>
                    <p className="text-xl md:text-4xl font-black tracking-tighter mb-3 text-white">
                      Full Timeline
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">
                      Continuous Evolution
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-4 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all group"
                  >
                    <FaTimes
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar scroll-smooth">
                  <div className="max-w-5xl mx-auto space-y-16 py-8">
                    {experiences.map((exp, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        key={i}
                        className="border-l-2 border-chocolate-accent/20 pl-8 md:pl-12 relative"
                      >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-chocolate-accent shadow-[0_0_15px_var(--color-chocolate-accent)]" />
                        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                          <div>
                            <p className="font-black text-2xl md:text-3xl text-white mb-2 tracking-tight">
                              {exp.company}
                            </p>
                            <p className="text-chocolate-accent text-md font-bold font-tech uppercase tracking-widest">
                              {exp.role}
                            </p>
                          </div>
                          <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-black text-white/40 font-tech whitespace-nowrap">
                            {exp.period}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {exp.details.map((detail, j) => (
                            <li
                              key={j}
                              className="text-lg text-white/60 leading-relaxed font-light flex items-center gap-2"
                            >
                              <span className="text-chocolate-accent font-black ">
                                /
                              </span>{" "}
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
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
