import AboutSection from "../components/About/AboutSection";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="pt-24 min-h-screen">
       <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-12"
        >
            <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-12">
                THE <br />
                <span className="text-chocolate-accent">CRAFTSMAN</span>
            </h1>
        </motion.div>
      </div>
      <AboutSection />
      
      {/* Philosophy Deep Dive */}
      <section className="py-20 md:py-32 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 tracking-tight">Software as High-Fidelity Art</h2>
            <div className="space-y-6 md:space-y-8 text-lg md:text-xl text-white/60 leading-relaxed font-light">
                <p>
                    I believe that software engineering is more than just typing lines of code. It's about architecting digital environments that respect the user's attention and intelligence.
                </p>
                <p>
                    My approach is rooted in the intersection of performance and aesthetics. A system must be robust enough to handle scale, but elegant enough to feel effortless.
                </p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default About;
