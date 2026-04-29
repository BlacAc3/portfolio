import ProjectsSection from "../components/Projects/ProjectsSection";
import { motion } from "framer-motion";

const Work = () => {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 md:mb-32"
        >
            <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-12">
                SELECTED <br />
                <span className="text-chocolate-accent">WORKS</span>
            </h1>
            <p className="max-w-2xl text-xl md:text-2xl text-white/40 font-light leading-relaxed">
                A collection of high-impact digital products, ranging from SaaS architectures to immersive frontend experiences.
            </p>
        </motion.div>
      </div>
      <ProjectsSection />
      
      <section className="py-24 md:py-40 text-center px-6">
         <h2 className="text-2xl md:text-3xl font-bold mb-8">Ready to start a project?</h2>
         <a href="/contact" className="px-10 py-5 md:px-12 md:py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all inline-block text-sm md:text-base">Start a Conversation</a>
      </section>
    </div>
  );
};

export default Work;
