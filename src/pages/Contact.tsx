import { motion } from "framer-motion";
import ContactSection from "../components/Contact/ContactSection";

const Contact = () => {
  return (
    <div className="pt-24 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] font-black font-tech text-chocolate-accent mb-6">
            Available for new projects
          </p>
          <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-10">
            LET&apos;S <br />
            <span className="text-chocolate-accent">TALK</span>
          </h1>
          <p className="max-w-xl text-lg md:text-2xl text-white/70 leading-relaxed">
            Have an idea that needs a high-fidelity touch? Let&apos;s build
            something exceptional together.
          </p>
        </motion.header>
      </div>
      <ContactSection />
    </div>
  );
};

export default Contact;
