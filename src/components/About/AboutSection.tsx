import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";
import { NoiseTexture } from "../magicui/noise-texture";

type ExpandedType = "toolkit" | null;

const AboutSection = () => {
  const [expandedType, setExpandedType] = useState<ExpandedType>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const skills = useMemo(
    () => [
      { name: "Node.js", level: 95, category: "Core Backend" },
      { name: "Python", level: 95, category: "Core Backend" },
      { name: "Go", level: 85, category: "Core Backend" },
      { name: "React", level: 90, category: "Frontend Integration" },
      { name: "Microservices", level: 90, category: "Architecture & Design" },
      { name: "PostgreSQL", level: 90, category: "Data & Storage" },
      { name: "Redis", level: 85, category: "Data & Storage" },
      { name: "Linux", level: 95, category: "Infrastructure" },
      { name: "Docker", level: 90, category: "Infrastructure" },
    ],
    [],
  );

  const settings = { projectsCompleted: "20+", experience: "4+" };

  // Dialog behaviour: focus the close button, close on Escape,
  // lock background scroll and hand focus back to the trigger on close.
  useEffect(() => {
    if (!expandedType) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedType(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [expandedType]);

  const dialogTitleId = "about-dialog-title";

  return (
    <section id="about" aria-label="Profile overview" className="pb-12 px-4 sm:px-6 md:pb-16 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BentoGrid>
          {/* One row on desktop: toolkit (wide) · numbers · links.
              Tablet: toolkit across the top, numbers + links beneath. */}
          {/* Toolkit */}
          <motion.div layoutId="toolkit-card" className="group md:col-span-3 lg:col-span-2">
            <BentoCard colSpan={1} rowSpan={1} theme="dark" className="h-full">
              <div className="h-full flex flex-col justify-between gap-4 pointer-events-none">
                <div className="flex justify-between items-center">
                  <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-white/70 font-tech">
                    Toolkit
                  </h2>
                  <span
                    aria-hidden="true"
                    className="shrink-0 whitespace-nowrap text-[11px] font-black text-white/50 group-hover:text-chocolate-accent transition-colors uppercase tracking-widest font-tech"
                  >
                    Expand +
                  </span>
                </div>
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {skills.slice(0, 6).map((skill) => (
                    <li
                      key={skill.name}
                      className="px-2.5 py-1 bg-chocolate-accent/10 border border-chocolate-accent/20 rounded-md text-[11px] font-black font-tech text-chocolate-light-accent"
                    >
                      {skill.name}
                    </li>
                  ))}
                  <li className="px-2.5 py-1 text-[11px] font-black font-tech text-white/60">
                    +{skills.length - 6} more
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setExpandedType("toolkit")}
                aria-haspopup="dialog"
                aria-label="Open full technical toolkit"
                className="absolute inset-0 z-20 rounded-[32px] cursor-pointer"
              />
            </BentoCard>
          </motion.div>

          {/* Links */}
          <div className="md:order-last md:col-span-1">
          <BentoCard colSpan={1} rowSpan={1} theme="glass" className="h-full">
            <div className="h-full flex flex-col justify-between gap-6">
              <p className="text-xl font-black leading-tight">
                Bridging <span className="text-chocolate-accent">logic</span> &amp; aesthetics.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://github.com/blacac3"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub (opens in a new tab)"
                  className="w-11 h-11 inline-flex items-center justify-center bg-white/5 rounded-xl hover:bg-white hover:text-chocolate-dark transition-colors"
                >
                  <FaGithub size={18} aria-hidden="true" />
                </a>
                <a
                  href="https://linkedin.com/in/aaron-ezeala"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (opens in a new tab)"
                  className="w-11 h-11 inline-flex items-center justify-center bg-white/5 rounded-xl hover:bg-white hover:text-chocolate-dark transition-colors"
                >
                  <FaLinkedin size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </BentoCard>
          </div>

          {/* Numbers */}
          <div className="md:col-span-2 lg:col-span-1">
          <BentoCard colSpan={1} rowSpan={1} theme="glass" className="h-full">
            <dl className="grid grid-cols-2 gap-6 h-full items-center">
              <div className="text-center border-r border-white/10 flex flex-col-reverse">
                <dt className="text-[11px] uppercase tracking-widest font-bold text-white/60 mt-2 font-tech">
                  Projects Delivered
                </dt>
                <dd className="text-4xl lg:text-5xl font-black text-chocolate-accent tracking-tighter font-tech">
                  {settings.projectsCompleted}
                </dd>
              </div>
              <div className="text-center flex flex-col-reverse">
                <dt className="text-[11px] uppercase tracking-widest font-bold text-white/60 mt-2 font-tech">
                  Years Experience
                </dt>
                <dd className="text-4xl lg:text-5xl font-black text-white tracking-tighter font-tech">
                  {settings.experience}
                </dd>
              </div>
            </dl>
          </BentoCard>
          </div>
        </BentoGrid>

        {/* MODAL ARCHITECTURE */}
        <AnimatePresence>
          {expandedType && (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedType(null)}
                className="fixed inset-0 bg-chocolate-dark/85 backdrop-blur-3xl z-[199] cursor-zoom-out"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                layoutId="toolkit-card"
                className="fixed top-20 md:top-24 inset-x-3 sm:inset-x-6 md:inset-x-16 bottom-3 md:bottom-4 bg-chocolate-medium/70 backdrop-blur-2xl z-[200] overflow-hidden flex flex-col rounded-[24px] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] border border-white/15"
              >
                <NoiseTexture opacity={0.01} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-4 px-5 md:p-6 md:px-16 flex justify-between items-center gap-4 border-b border-white/10 bg-white/[0.02]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.5em] font-black text-chocolate-accent mb-2 font-tech">
                        Technical Proficiency
                      </p>
                      <h2
                        id={dialogTitleId}
                        className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase"
                      >
                        The Toolkit
                      </h2>
                    </div>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setExpandedType(null)}
                      aria-label="Close dialog"
                      className="w-12 h-12 shrink-0 inline-flex items-center justify-center bg-white/5 rounded-full hover:bg-white hover:text-chocolate-dark transition-colors group"
                    >
                      <FaTimes
                        size={20}
                        aria-hidden="true"
                        className="group-hover:rotate-90 transition-transform duration-300"
                      />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 md:p-12 md:px-20 no-scrollbar" data-lenis-prevent>
                    <div className="max-w-5xl mx-auto py-6 md:py-10 pb-24 md:pb-40">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10 md:gap-y-12 list-none p-0 m-0">
                          {skills.map((skill, i) => (
                            <motion.li
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + i * 0.05 }}
                              key={skill.name}
                            >
                              <div className="flex justify-between items-end mb-4">
                                <div>
                                  <p className="text-[11px] uppercase tracking-widest font-black text-white/55 mb-1 font-tech">
                                    {skill.category}
                                  </p>
                                  <h3 className="text-2xl font-black text-white tracking-tight">
                                    {skill.name}
                                  </h3>
                                </div>
                                <p className="text-2xl font-black text-chocolate-accent font-tech">
                                  {skill.level}%
                                </p>
                              </div>
                              <div
                                role="meter"
                                aria-label={`${skill.name} proficiency`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={skill.level}
                                className="h-1 w-full bg-white/10 rounded-full overflow-hidden"
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${skill.level}%` }}
                                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                                  className="h-full bg-gradient-to-r from-chocolate-accent/40 to-chocolate-accent shadow-[0_0_15px_var(--color-chocolate-accent)]"
                                />
                              </div>
                            </motion.li>
                          ))}
                        </ul>
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
