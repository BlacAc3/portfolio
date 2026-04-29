import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import me from "../../assets/me.webp";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";
import { NoiseTexture } from "../magicui/noise-texture";
import { useSanity } from "../../hooks/useSanity";

type ExpandedType = "journey" | "toolkit" | null;

interface Experience {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  responsibilities?: string[];
}

interface Skill {
  name: string;
  proficiency: number;
  category: string;
}

interface SiteSettings {
  experience?: string;
  projectsCompleted?: string;
}

const AboutSection = () => {
  const [expandedType, setExpandedType] = useState<ExpandedType>(null);

  const { data: sanityExperiences } = useSanity<Experience[]>(`*[_type == "experience"] | order(startDate desc)`);
  const { data: sanitySkills } = useSanity<Skill[]>(`*[_type == "skill"] | order(proficiency desc)`);
  const { data: settings } = useSanity<SiteSettings>(`*[_type == "siteSettings"][0]`);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const experiences = useMemo(() => {
    if (!sanityExperiences) return [];
    return sanityExperiences.map(exp => ({
      company: exp.company,
      role: exp.jobTitle,
      period: `${formatDate(exp.startDate)} - ${exp.isCurrentRole ? "Present" : formatDate(exp.endDate || "")}`,
      details: exp.responsibilities || []
    }));
  }, [sanityExperiences]);

  const skills = useMemo(() => {
    if (!sanitySkills) return [];
    return sanitySkills.map(skill => ({
      name: skill.name,
      level: skill.proficiency || 0,
      category: skill.category || "Other"
    }));
  }, [sanitySkills]);

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
          {/* 1. MAJOR ANCHOR: Professional Journey (2x2) */}
          <motion.div
            layoutId="journey-card"
            className="md:col-span-2 md:row-span-2 cursor-pointer group"
            onClick={() => setExpandedType("journey")}
          >
            <BentoCard colSpan={2} rowSpan={2} theme="dark" className="h-full">
              <NoiseTexture opacity={0.1} />
              <div className="h-full flex flex-col pointer-events-none relative z-10">
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
                  {experiences.length === 0 && (
                     <p className="text-white/20 font-tech uppercase tracking-widest text-[10px]">No experience listed yet.</p>
                  )}
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* 2. THE TOOLKIT (1x1) */}
          <motion.div
            layoutId="toolkit-card"
            className="md:col-span-1 md:row-span-1 cursor-pointer group"
            onClick={() => setExpandedType("toolkit")}
          >
            <BentoCard colSpan={1} rowSpan={1} theme="dark" className="h-full">
              <div className="h-full flex flex-col justify-between gap-4 pointer-events-none">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm sm:text-[10px] uppercase tracking-[0.3em] font-black opacity-60 font-tech">
                    Toolkit
                  </h4>
                  <span className="text-xs sm:text-[8px] font-black opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-tech">
                    Details
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill.name}
                      className="px-2 py-1 bg-amber-900/20 rounded text-[10px] font-black font-tech"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {skills.length === 0 && (
                     <p className="text-white/20 font-tech uppercase tracking-widest text-[10px]">Loading...</p>
                  )}
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* 3. TALL PROFILE IMAGE (1x2) - Asymmetrical Balance */}
          <BentoCard
            colSpan={1}
            rowSpan={2}
            className="p-0 border-0 overflow-hidden"
          >
            <img
              src={me}
              alt="Aaron"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            />
          </BentoCard>

          {/* 4. PHILOSOPHY: Bridging the Gap (1x1) */}
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
                  <FaGithub size={16} />
                </a>
                <a
                  href="https://linkedin.com/in/aaron-ezeala"
                  target="_blank"
                  className="p-2 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <FaLinkedin size={16} />
                </a>
              </div>
            </div>
          </BentoCard>

          {/* 5. STATS: (2x1) - Wide bottom balance */}
          <BentoCard colSpan={2} rowSpan={1} theme="glass">
            <div className="grid grid-cols-2 gap-8 h-full items-center">
              <div className="text-center border-r border-white/5">
                <p className="text-5xl font-black text-chocolate-accent tracking-tighter font-tech">
                  {settings?.projectsCompleted || "20+"}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-2 font-tech">
                  Projects Delivered
                </p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black text-white tracking-tighter font-tech">
                  {settings?.experience || "3+"}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-2 font-tech">
                  Years Experience
                </p>
              </div>
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
                className="fixed top-24 inset-x-16 bottom-4 bg-chocolate-dark/40 backdrop-blur-2xl z-200 overflow-hidden flex flex-col rounded-[20px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] border  border-white/20"
              >
                <NoiseTexture opacity={0.01} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-4 px-6 md:p-6 md:px-16 flex justify-between items-center border-b border-white/5 bg-white/2">
                    <div>
                      <h4 className="text-[0.70rem] uppercase tracking-[0.6em] font-black text-chocolate-accent mb-2 font-tech">
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
                      className="p-3 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all group"
                    >
                      <FaTimes
                        size={20}
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
                          {experiences.length === 0 && (
                             <p className="text-white/40 text-center font-tech uppercase tracking-widest">No entries found in the archives.</p>
                          )}
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
                          {skills.length === 0 && (
                             <p className="text-white/40 text-center font-tech uppercase tracking-widest">Scanning technical arsenal...</p>
                          )}
                        </div>
                      )}
                    </div>
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
