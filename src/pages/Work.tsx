import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi2";
import ProjectsSection from "../components/Projects/ProjectsSection";

const Work = () => {
  return (
    <div className="pt-24 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 md:mb-0"
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-chocolate-accent font-black font-tech mb-6">
            Case studies · {new Date().getFullYear()}
          </p>
          <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-12">
            SELECTED <br />
            <span className="text-chocolate-accent">WORKS</span>
          </h1>
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <p className="max-w-2xl text-xl md:text-2xl text-white/70 leading-relaxed md:col-span-7">
              A collection of high-impact digital products, ranging from SaaS
              architectures to immersive frontend experiences.
            </p>
            <dl className="flex gap-10 border-t border-white/10 pt-6 md:col-span-4 md:col-start-9 md:justify-end md:border-0 md:pt-0">
              {[
                ["05", "Projects"],
                ["03", "Production systems"],
                ["02", "Teams"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-3xl font-black tracking-tight text-white md:text-4xl">
                    {value}
                  </dd>
                  <dd className="mt-1 font-tech text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.header>
      </div>

      <ProjectsSection />

      <section
        aria-labelledby="work-cta"
        className="py-24 md:py-40 text-center px-6"
      >
        <h2 id="work-cta" className="text-2xl md:text-4xl font-black tracking-tight mb-4">
          Ready to start a project?
        </h2>
        <p className="text-white/65 max-w-md mx-auto mb-10">
          Tell me what you are building — I usually reply within a day.
        </p>
        <Link
          to="/contact"
          className="group inline-flex items-center gap-3 min-h-11 px-10 py-5 md:px-12 bg-white text-chocolate-dark rounded-full font-black uppercase tracking-widest text-sm md:text-base hover:bg-chocolate-accent hover:scale-105 transition-[transform,background-color] duration-300"
        >
          Start a Conversation
          <HiArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
};

export default Work;
