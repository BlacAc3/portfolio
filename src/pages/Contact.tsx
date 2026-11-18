import { lazy } from "react";
import { motion } from "framer-motion";
import ContactSection from "../components/Contact/ContactSection";
import ModelStage from "../components/Three/ModelStage";

const PaperPlane = lazy(() => import("../components/Three/PaperPlane"));

const ease = [0.22, 1, 0.36, 1] as const;

const Contact = () => {
  return (
    <div className="min-h-[100dvh] pt-24">
      <div className="relative">
        <div aria-hidden="true" className="ambient-wash pointer-events-none absolute inset-x-0 -top-24 bottom-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-6 pt-10 md:pt-16 lg:grid-cols-12">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-6"
          >
            <p className="mb-6 inline-flex items-center gap-3 rounded-full border border-ink/10 bg-surface/70 px-4 py-2 font-tech text-[11px] font-bold uppercase tracking-[0.3em] text-accent md:text-xs">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new projects
            </p>
            <h1 className="mb-8 text-[clamp(3.5rem,10vw,120px)] font-black leading-[0.85] tracking-[-0.06em] md:mb-10">
              LET&apos;S <br />
              <span className="text-accent">TALK</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-ink/70 md:text-2xl">
              Have an idea that needs a high-fidelity touch? Send it over — it
              lands in my inbox, not a queue.
            </p>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="lg:col-span-6"
          >
            <ModelStage
              label="A folded paper plane with a gold crease looping through the air, trailing a thin gold line."
              className="h-[260px] sm:h-[340px] lg:h-[460px]"
            >
              {(p) => <PaperPlane {...p} />}
            </ModelStage>
          </motion.div>
        </div>
      </div>
      <ContactSection />
    </div>
  );
};

export default Contact;
