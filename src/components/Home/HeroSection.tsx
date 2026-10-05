import { useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "../Shared/MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          anticipatePin: 1,
        }
      });

      tl.to(contentRef.current, { scale: 0.85, opacity: 0, y: -100, ease: "none" }, 0)
        .to(title1Ref.current, { x: -150, ease: "none" }, 0)
        .to(title2Ref.current, { x: 150, ease: "none" }, 0)
        .to(meshRef.current, { scale: 1.5, opacity: 0, ease: "none" }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="scroll-section" id="home">
      <div className="sticky-container px-4 md:px-6">
        <div className="absolute inset-0">
          <motion.div 
            ref={meshRef}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] opacity-20 will-change-transform"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--color-chocolate-accent) 0%, transparent 50%),
                           radial-gradient(circle at 20% 80%, #3a2e26 0%, transparent 40%),
                           radial-gradient(circle at 80% 20%, #1d1b1a 0%, transparent 40%)`
            }}
          />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] will-change-opacity" />
        </div>

        <div ref={contentRef} className="max-w-7xl mx-auto px-6 md:px-8 pt-[30vh] md:pt-[35vh] pb-24 sm:pb-32 text-center z-10 w-full flex flex-col min-h-screen will-change-transform" >
          {/* HEADLINE */}
          <div className="relative mb-16 sm:mb-24 pointer-events-none w-full">
            <div className="overflow-hidden flex justify-start">
              <h1 ref={title1Ref} className="text-[clamp(3.5rem,10vw,110px)] font-black leading-[0.85] tracking-[-0.06em] text-white uppercase -ml-[0.05em] md:-ml-[0.07em]">
                DESIGNING
              </h1>
            </div>
            <div className="mt-2 sm:mt-4 flex justify-end">
              <h1 ref={title2Ref} className="text-[clamp(3.5rem,10vw,110px)] font-black leading-[0.85] tracking-[-0.06em] text-chocolate-accent uppercase">
                THE FUTURE
              </h1>
            </div>
          </div>

          {/* LOWER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-16 pointer-events-auto w-full relative border-t border-white/5 pt-12 md:pt-16">
            
            {/* Left: Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-20 w-full md:w-auto justify-center md:justify-start order-2 md:order-1">
              <MagneticButton>
                <motion.a
                  href="#projects"
                  className="group relative w-full sm:w-auto px-8 py-3 sm:py-4 bg-white text-black text-sm sm:text-base font-bold rounded-full overflow-hidden transition-all text-center inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Explore Work</span>
                  <div className="absolute inset-0 bg-chocolate-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              </MagneticButton>

              <MagneticButton>
                <motion.a
                  href="#contact"
                  className="w-full sm:w-auto px-8 py-3 sm:py-4 border border-white/10 bg-white/5 backdrop-blur-md text-white text-sm sm:text-base font-bold rounded-full hover:bg-white/10 transition-all text-center inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get in Touch
                </motion.a>
              </MagneticButton>
            </div>

            {/* Right: Intro Text */}
            <div ref={introRef} className="max-w-sm text-center md:text-right w-full md:w-auto order-1 md:order-2">
              <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-chocolate-accent mb-4 font-tech">
                The Architect
              </p>
              <h2 className="text-base md:text-lg italic font-light text-white/60 tracking-tight leading-relaxed text-balance">
                "Hi, I'm <span className="text-white font-medium">Aaron Ezeala</span>.<br className="hidden sm:block" />
                I build high-fidelity digital interfaces and robust systems 
                that define the next generation of the web."
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
