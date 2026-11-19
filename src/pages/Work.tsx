import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";
import { lazy } from "react";
import ProjectsSection from "../components/Projects/ProjectsSection";
import ModelStage from "../components/Three/ModelStage";
import { STACK_LAYERS } from "../components/Three/stackLayers";

const ArchitectureStack = lazy(() => import("../components/Three/ArchitectureStack"));

const LAYER_NOTES: Record<(typeof STACK_LAYERS)[number], string> = {
  Interface: "React, motion, a11y",
  API: "Django, Go, RBAC",
  Queue: "Celery, Redis",
  Data: "PostgreSQL, search",
};

const Work = () => {
  return (
    <div className="pt-24 min-h-[100dvh]">
      <div className="relative">
        <div aria-hidden="true" className="ambient-wash pointer-events-none absolute inset-x-0 -top-24 bottom-0" />
        <div className="relative max-w-7xl mx-auto grid gap-8 px-6 py-12 md:py-16 lg:grid-cols-12 lg:items-center">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-accent font-black font-tech mb-6">
              Case studies · {new Date().getFullYear()}
            </p>
            <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-10">
              SELECTED <br />
              <span className="text-accent">WORKS</span>
            </h1>
            <p className="max-w-2xl text-xl md:text-2xl text-ink/70 leading-relaxed">
              A collection of high-impact digital products, ranging from SaaS
              architectures to immersive frontend experiences.
            </p>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6 border-t border-ink/10 pt-6">
              {[
                ["07", "Projects"],
                ["03", "Production systems"],
                ["02", "Teams"],
                ["02", "Client sites"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-black tracking-tight text-ink md:text-4xl">
                    {value}
                  </dd>
                  <dd className="mt-1 font-tech text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
          >
            <ModelStage
              label="An exploded 3D diagram of a software stack — interface, API, queue and database layers — with small gold data packets travelling between them."
              className="h-[320px] sm:h-[400px] lg:h-[440px]"
            >
              {(p) => <ArchitectureStack {...p} />}
            </ModelStage>
            <ol
              aria-label="Layers I build"
              className="m-0 mt-2 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2"
            >
              {STACK_LAYERS.map((layer, i) => (
                <li
                  key={layer}
                  className="flex items-center gap-3 rounded-full border border-ink/10 bg-surface/80 py-1.5 pl-2 pr-4"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent font-tech text-[10px] font-bold text-canvas">
                    {i + 1}
                  </span>
                  <span className="font-tech text-[11px] font-bold uppercase tracking-[0.2em]">{layer}</span>
                  <span className="text-xs text-ink/60">{LAYER_NOTES[layer]}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>

      <ProjectsSection />

      <section
        aria-labelledby="work-cta"
        className="py-24 md:py-40 text-center px-6"
      >
        <h2 id="work-cta" className="text-2xl md:text-4xl font-black tracking-tight mb-4">
          Ready to start a project?
        </h2>
        <p className="text-ink/65 max-w-md mx-auto mb-10">
          Tell me what you are building — I usually reply within a day.
        </p>
        <Link
          to="/contact"
          className="group inline-flex items-center gap-3 min-h-11 px-10 py-5 md:px-12 bg-ink text-canvas rounded-full font-black uppercase tracking-widest text-sm md:text-base hover:bg-accent hover:scale-105 transition-[transform,background-color] duration-300"
        >
          Start a Conversation
          <HiArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
};

export default Work;
