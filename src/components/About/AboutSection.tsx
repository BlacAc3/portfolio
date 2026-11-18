import { lazy, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FaGithub, FaLinkedin, FaTimes } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";
import { NoiseTexture } from "../magicui/noise-texture";
import ModelStage from "../Three/ModelStage";

const KeycapCluster = lazy(() => import("../Three/KeycapCluster"));

type ExpandedType = "toolkit" | null;

const ease = [0.22, 1, 0.36, 1] as const;

const grid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const tile: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const TIMELINE = [
  {
    when: "2025 — 2026",
    role: "Full-stack engineer",
    org: "IYF Studios",
    note: "Gamified education platform · Django + React",
  },
  {
    when: "2024 — 2026",
    role: "Backend engineer",
    org: "Heckerbella",
    note: "Membership & recruitment platforms · RBAC, Celery, Redis",
  },
  {
    when: "Ongoing",
    role: "Open source",
    org: "libp2p · Linux",
    note: "Decentralised protocols and a hand-tuned Arch workstation",
  },
];

const tileBase = "surface-card relative overflow-hidden rounded-[28px]";
const eyebrow = "font-tech text-[11px] font-bold uppercase tracking-[0.3em] text-ink/60";

/** Lagos local time, so visitors know when a reply is realistic. */
const useLagosTime = () => {
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt.format(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, [fmt]);
  return now;
};

const AboutSection = () => {
  const [expandedType, setExpandedType] = useState<ExpandedType>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lagos = useLagosTime();

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
    <section id="about" aria-label="Profile overview" className="px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[minmax(250px,auto)_minmax(250px,auto)]"
        >
          {/* Toolkit — the 3D keyboard types out the stack */}
          <motion.div variants={tile} className={`${tileBase} group md:col-span-2 lg:row-span-2`}>
            <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative flex h-full flex-col p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={eyebrow}>Toolkit</h2>
                  <p className="mt-3 max-w-xs font-display text-2xl font-black leading-tight tracking-tight md:text-3xl">
                    Tools I reach for <span className="text-accent">daily.</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedType("toolkit")}
                  aria-haspopup="dialog"
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 font-tech text-[11px] font-bold uppercase tracking-[0.2em] text-ink/80 transition-colors hover:border-accent hover:bg-accent hover:text-canvas"
                >
                  Full toolkit
                  <HiArrowUpRight aria-hidden="true" />
                </button>
              </div>

              <ModelStage
                label="A small 3D mechanical keyboard whose keys are labelled with languages and tools — Python, Go, TypeScript, SQL — pressing themselves as if typing."
                className="my-2 h-[260px] flex-1 sm:h-[320px] lg:min-h-[300px]"
              >
                {(p) => <KeycapCluster {...p} />}
              </ModelStage>

              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-full border border-ink/10 bg-raised/60 px-3 py-1.5 font-tech text-[11px] font-bold text-ink/80"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Now — availability, local time, links */}
          <motion.div variants={tile} className={`${tileBase} flex flex-col justify-between gap-8 p-6 md:p-8`}>
            <div>
              <h2 className={eyebrow}>Right now</h2>
              <p className="mt-5 flex items-center gap-3 text-lg font-bold leading-snug">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Open to full-time &amp; contract roles
              </p>
              <p className="mt-3 text-sm text-ink/65">
                Lagos, Nigeria · <time className="font-tech font-bold text-ink">{lagos}</time> WAT
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://github.com/blacac3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.04] transition-colors hover:bg-ink hover:text-canvas"
              >
                <FaGithub size={18} aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com/in/aaron-ezeala"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.04] transition-colors hover:bg-ink hover:text-canvas"
              >
                <FaLinkedin size={18} aria-hidden="true" />
              </a>
            </div>
          </motion.div>

          {/* Numbers — on a gold tile for rhythm */}
          <motion.div
            variants={tile}
            className="relative overflow-hidden rounded-[28px] bg-accent p-6 text-canvas md:p-8"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-canvas/15 blur-2xl" />
            <dl className="relative grid h-full grid-cols-2 content-between gap-6">
              {[
                [settings.projectsCompleted, "Projects delivered"],
                [settings.experience, "Years shipping"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-2 font-tech text-[11px] font-bold uppercase tracking-[0.2em] text-canvas/75">
                    {label}
                  </dt>
                  <dd className="font-display text-5xl font-black tracking-tighter lg:text-6xl">{value}</dd>
                </div>
              ))}
              <p className="col-span-2 self-end text-sm font-semibold leading-snug text-canvas/80">
                Bridging logic &amp; aesthetics — backend depth, front-end care.
              </p>
            </dl>
          </motion.div>

          {/* Experience timeline */}
          <motion.div variants={tile} className={`${tileBase} p-6 md:col-span-2 md:p-8`}>
            <h2 className={eyebrow}>Experience</h2>
            <ol className="relative m-0 mt-6 list-none space-y-5 p-0 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-ink/10">
              {TIMELINE.map((item, i) => (
                <li key={item.org} className="relative grid gap-1 pl-7 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 ${
                      i === 0 ? "border-accent bg-accent" : "border-ink/25 bg-surface"
                    }`}
                  />
                  <span className="font-tech text-[11px] font-bold uppercase tracking-[0.2em] text-ink/55 sm:pt-0.5">
                    {item.when}
                  </span>
                  <div>
                    <p className="font-bold">
                      {item.role} <span className="text-accent">· {item.org}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink/65">{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </motion.div>

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
                className="fixed inset-0 bg-canvas/85 backdrop-blur-3xl z-[199] cursor-zoom-out"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.45, ease }}
                className="fixed top-20 md:top-24 inset-x-3 sm:inset-x-6 md:inset-x-16 bottom-3 md:bottom-4 bg-surface/70 backdrop-blur-2xl z-[200] overflow-hidden flex flex-col rounded-[24px] shadow-[0_-20px_80px_-20px_rgb(var(--shadow-rgb)/0.6)] border border-ink/15"
              >
                <NoiseTexture opacity={0.01} />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-4 px-5 md:p-6 md:px-16 flex justify-between items-center gap-4 border-b border-ink/10 bg-ink/[0.02]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.5em] font-black text-accent mb-2 font-tech">
                        Technical Proficiency
                      </p>
                      <h2
                        id={dialogTitleId}
                        className="text-2xl md:text-4xl font-black tracking-tighter text-ink uppercase"
                      >
                        The Toolkit
                      </h2>
                    </div>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setExpandedType(null)}
                      aria-label="Close dialog"
                      className="w-12 h-12 shrink-0 inline-flex items-center justify-center bg-ink/5 rounded-full hover:bg-ink hover:text-canvas transition-colors group"
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
                                  <p className="text-[11px] uppercase tracking-widest font-black text-ink/55 mb-1 font-tech">
                                    {skill.category}
                                  </p>
                                  <h3 className="text-2xl font-black text-ink tracking-tight">
                                    {skill.name}
                                  </h3>
                                </div>
                                <p className="text-2xl font-black text-accent font-tech">
                                  {skill.level}%
                                </p>
                              </div>
                              <div
                                role="meter"
                                aria-label={`${skill.name} proficiency`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={skill.level}
                                className="h-1 w-full bg-ink/10 rounded-full overflow-hidden"
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${skill.level}%` }}
                                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                                  className="h-full bg-gradient-to-r from-accent/40 to-accent shadow-[0_0_15px_var(--color-accent)]"
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
