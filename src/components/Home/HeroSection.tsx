import { useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
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

      // Match the original Framer Motion logic exactly
      tl.to(contentRef.current, { scale: 0.85, opacity: 0, y: -100, ease: "none" }, 0)
        .to(title1Ref.current, { x: -150, ease: "none" }, 0)
        .to(title2Ref.current, { x: 150, ease: "none" }, 0)
        .to(meshRef.current, { scale: 1.5, ease: "none" }, 0)
        .to(indicatorRef.current, { opacity: 0, ease: "none" }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="scroll-section" id="home">
      <div className="sticky-container">
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

        <div ref={contentRef} className="max-w-7xl mx-auto mt-24 px-6 pt-20 md:pt-32 pb-24 sm:pb-40 text-center z-10 w-full flex flex-col justify-center min-h-[90vh] will-change-transform" >

          <div className="relative mb-4 sm:mb-12">
            <div className="overflow-hidden">
              <h1 ref={title1Ref} className="text-[clamp(3.5rem,12vw,120px)] font-black leading-[0.85] tracking-[-0.06em] text-white">
                DESIGNING
              </h1>
            </div>
            <div className="mt-4">
              <h1 ref={title2Ref} className="text-[clamp(3.5rem,12vw,120px)] font-black leading-[0.85] tracking-[-0.06em] text-chocolate-accent">
                THE FUTURE
              </h1>
            </div>
          </div>

          <div ref={introRef} className="max-w-4xl mx-auto mt-6 ">
            <h2 className="text-lg md:text-2xl italic font-light text-white/60 tracking-tight leading-relaxed mb-4 sm:mb-12 text-balance">
              "Hi, I'm <span className="text-white font-medium">Aaron Ezeala</span>. <br className="hidden sm:block" />
              I build high-fidelity digital interfaces and robust systems 
              that define the next generation of the web."
            </h2>
            
            <div className="flex flex-col sm:flex-row pt-8 md:pt-12 justify-center items-center gap-6 md:gap-18">
              <motion.a
                href="#projects"
                className="group relative w-full sm:w-auto px-12 py-4 sm:py-5 bg-white text-black text-md sm:text-lg font-bold rounded-full overflow-hidden transition-all text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Explore Work</span>
                <div className="absolute inset-0 bg-chocolate-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              <motion.a
                href="#contact"
                className="w-full sm:w-auto px-12 py-4 sm:py-5 border border-white/10 bg-white/5 backdrop-blur-md text-white text-md sm:text-lg font-bold rounded-full hover:bg-white/10 transition-all text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.a>
            </div>
          </div>
        </div>

        <div ref={indicatorRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">Initiate</p>
            <div className="w-[1px] h-20 bg-gradient-to-b from-chocolate-accent to-transparent relative">
              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-chocolate-accent rounded-full shadow-[0_0_10px_var(--color-chocolate-accent)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
