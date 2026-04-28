import ProjectsSection from "../components/Projects/ProjectsSection";
import { motion } from "framer-motion";

const Work = () => {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-32"
        >
            <h1 className="text-[10vw] font-black tracking-[-0.06em] leading-[0.8] mb-12">
                SELECTED <br />
                <span className="text-chocolate-accent">WORKS</span>
            </h1>
            <p className="max-w-2xl text-2xl text-white/40 font-light leading-relaxed">
                A collection of high-impact digital products, ranging from SaaS architectures to immersive frontend experiences.
            </p>
        </motion.div>
      </div>
      <ProjectsSection />
      
      <section className="py-40 text-center">
         <h2 className="text-3xl font-bold mb-8">Ready to start a project?</h2>
         <a href="/contact" className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all inline-block">Start a Conversation</a>
      </section>
    </div>
  );
};

export default Work;
