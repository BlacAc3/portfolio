import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Pillar 1: Scrollytelling - Transform based on scroll progress
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);
  
  // Specific title transforms for that "scrubber" feel
  const title1X = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const title2X = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section ref={containerRef} className="scroll-section" id="home">
      <div className="sticky-container">
        <motion.div 
          style={{ scale, opacity }}
          className="max-w-7xl mx-auto px-6 text-center z-10 w-full"
        >
          {/* Pillar 2: Massive Typography & Negative Space */}
          <div className="relative mb-24">
            <motion.h1 
              style={{ x: title1X, opacity: titleOpacity }}
              className="text-massive text-white whitespace-nowrap"
            >
              DESIGNING
            </motion.h1>
            <motion.h1 
              style={{ x: title2X, opacity: titleOpacity }}
              className="text-massive text-chocolate-accent whitespace-nowrap"
            >
              THE FUTURE
            </motion.h1>
          </div>

          <motion.div 
            style={{ y: textY }}
            className="max-w-3xl mx-auto mt-12"
          >
            <h2 className="text-3xl md:text-5xl font-light mb-12 text-white/80 tracking-tight leading-tight">
              I'm Aaron. I craft high-fidelity digital experiences that bridge the gap between imagination and reality.
            </h2>
            
            <div className="flex justify-center space-x-8">
              <motion.a
                href="#projects"
                className="px-10 py-5 bg-white text-black text-xl font-semibold rounded-full hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                Explore Projects
              </motion.a>
              <motion.a
                href="#contact"
                className="px-10 py-5 border border-white/20 text-white text-xl font-semibold rounded-full hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Background Visuals - Glassmorphism & Depth */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
             style={{ scale: useTransform(scrollYProgress, [0, 1], [1, 1.5]) }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-chocolate-accent/10 blur-[150px] rounded-full" 
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        </div>
      </div>

      <motion.div
        className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-20"
        style={{ opacity: titleOpacity }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] mb-4 text-white/40 font-bold">Scroll to Begin</span>
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[2px] h-16 bg-gradient-to-b from-chocolate-accent to-transparent rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
