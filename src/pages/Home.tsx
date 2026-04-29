import { useRef, useLayoutEffect } from "react";
import HeroSection from "../components/Home/HeroSection";
import BentoGrid from "../components/Shared/BentoGrid";
import BentoCard from "../components/Shared/BentoCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import me from "../public/me.webp";
import { HiArrowRight } from "react-icons/hi2";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const speedRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const speedContentRef = useRef<HTMLDivElement>(null);
  const craftContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const speedTl = gsap.timeline({
        scrollTrigger: {
          trigger: speedRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
        },
      });

      speedTl
        .fromTo(
          speedContentRef.current,
          { opacity: 0, scale: 0.95, y: 50 },
          { opacity: 1, scale: 1, y: 0, duration: 1 },
        )
        .to(
          speedContentRef.current,
          { opacity: 0, y: -50, duration: 1 },
          "+=0.5",
        );

      const craftTl = gsap.timeline({
        scrollTrigger: {
          trigger: craftRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
        },
      });

      craftTl
        .fromTo(
          craftContentRef.current,
          { opacity: 0, scale: 0.95, y: 50 },
          { opacity: 1, scale: 1, y: 0, duration: 1 },
        )
        .to(
          craftContentRef.current,
          { opacity: 0, y: -50, duration: 1 },
          "+=0.5",
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <section className="py-20 md:py-32 px-4 md:px-6 relative z-10 border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 text-white">
                THE <span className="text-chocolate-accent">SYNERGY</span>
              </h2>
              <p className="text-lg md:text-xl text-white/40 uppercase tracking-widest font-bold font-tech">
                Design & Engineering: The Perfect Pairing
              </p>
            </div>
            <Link
              to="/work"
              className="group flex items-center gap-4 text-white font-bold uppercase tracking-widest text-sm font-tech"
            >
              Explore Work
              <span className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <HiArrowRight className="text-xl md:text-2xl" />
              </span>
            </Link>
          </div>

          <BentoGrid>
            <BentoCard colSpan={2} rowSpan={2} theme="glass">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-6xl font-black mb-6 md:mb-8 leading-[0.9] md:leading-[0.85] tracking-tight">
                    Like rice and stew — <br />
                    <span className="text-chocolate-accent">
                      inseparable by nature.
                    </span>
                  </h3>
                  <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light mb-8 md:mb-12">
                    In my world, design and engineering aren't different phases;
                    they are the same soul in different forms. One provides the
                    structure, the other provides the life.
                  </p>
                </div>
                <div className="pt-8 border-t border-white/5 flex items-center gap-6 md:gap-10">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-white font-tech tracking-tighter">
                      FAST
                    </p>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mt-1 font-tech">
                      Performance
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-black text-chocolate-accent font-tech tracking-tighter">
                      FINE
                    </p>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mt-1 font-tech">
                      Aesthetics
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              colSpan={2}
              rowSpan={1}
              className="p-0 border-0 overflow-hidden min-h-[300px]"
            >
              <div className="relative h-full w-full overflow-hidden group">
                <img
                  src={me}
                  alt="Aaron"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-dark/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-black text-chocolate-accent mb-2 md:mb-3 font-tech">
                    Portfolio Owner
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Aaron Ezeala
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard colSpan={2} rowSpan={1} theme="glass">
              <div className="grid grid-cols-2 gap-4 md:gap-6 h-full items-center">
                <div className="border-r border-white/5 pr-4">
                  <p className="text-4xl md:text-5xl lg:text-7xl font-black text-chocolate-accent tracking-tighter font-tech">
                    3+
                  </p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 md:mt-2 font-tech">
                    Years Exp.
                  </p>
                </div>
                <div>
                  <p className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter font-tech">
                    20+
                  </p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 md:mt-2 font-tech">
                    Projects
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard colSpan={1} rowSpan={1} theme="accent">
              <div className="h-full flex flex-col justify-between">
                <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black opacity-50 mb-4 font-tech">
                  Tech
                </h4>
                <p className="text-lg md:text-xl font-black leading-tight tracking-tight">
                  Exploring the bleeding edge.
                </p>
              </div>
            </BentoCard>

            <BentoCard colSpan={1} rowSpan={1} theme="dark">
              <div className="h-full flex flex-col justify-between">
                <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black opacity-30 mb-4 font-tech">
                  Speed
                </h4>
                <p className="text-lg md:text-xl font-black leading-tight tracking-tight text-white/90">
                  Precision engineering enthusiast.
                </p>
              </div>
            </BentoCard>

            <BentoCard colSpan={2} theme="glass">
              <div className="h-full flex flex-col justify-between">
                <h3 className="text-xl md:text-2xl font-black mb-4 tracking-tight">
                  Curated Engineering
                </h3>
                <Link
                  to="/work"
                  className="text-[10px] md:text-xs font-black uppercase tracking-widest text-chocolate-accent hover:text-white transition-colors font-tech"
                >
                  View Case Studies →
                </Link>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* 3. PHILOSOPHY PART 1: SPEED */}
      <section
        className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden"
        ref={speedRef}
      >
        <div ref={speedContentRef} className="max-w-5xl text-center px-6">
          <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-chocolate-accent font-black mb-8 md:mb-10 font-tech">
            Philosophy of Speed
          </h3>
          <p className="text-4xl md:text-8xl lg:text-[105px] font-black tracking-tighter leading-[0.9] md:leading-[0.8] text-white">
            "Speed isn't <br className="hidden md:block" />
            just a metric;
            <br className="hidden md:block" />
            it’s a{" "}
            <span className="italic text-chocolate-accent">discipline.</span>"
          </p>
          <p className="mt-12 md:mt-16 text-lg md:text-2xl text-white/40 font-light max-w-3xl mx-auto leading-relaxed">
            Software should be engineered for high-velocity performance without
            sacrificing the soul of its design.
          </p>
        </div>
      </section>

      {/* 4. PHILOSOPHY PART 2: THE CRAFT */}
      <section
        className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden"
        ref={craftRef}
      >
        <div ref={craftContentRef} className="max-w-6xl text-center px-6">
          <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-chocolate-accent font-black mb-12 md:mb-16 font-tech">
            The Craft
          </h3>
          <p className="text-4xl md:text-8xl lg:text-[105px] font-black tracking-tighter leading-[0.9] md:leading-[0.8] text-white">
            To master the tool,
            <br className="hidden md:block" />
            first{" "}
            <span className="text-chocolate-accent">
              understand <br />
              the gear.
            </span>
          </p>
          <p className="mt-12 md:mt-18 text-lg md:text-2xl text-white/40 font-light max-w-3xl mx-auto leading-relaxed">
            Knowing every gear and circuit before assembling the machine ensures
            that functionality meets absolute beauty.
          </p>
        </div>
      </section>

      {/* 5. THE CALL TO ACTION */}
      <section className="py-24 md:py-40 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-6"
        >
          <h2 className="text-4xl md:text-[140px] font-black tracking-[-0.07em] leading-[0.8] md:leading-[0.75] mb-12 md:mb-20 uppercase">
            READY TO <br />
            <span className="text-chocolate-accent">ACCELERATE?</span>
          </h2>
          <Link
            to="/contact"
            className="px-10 py-6 md:px-16 md:py-8 bg-chocolate-accent text-chocolate-dark rounded-full font-black uppercase tracking-widest hover:scale-110 transition-all inline-block shadow-[0_20px_60px_-15px_rgba(212,167,106,0.4)] font-tech text-sm md:text-base"
          >
            Start a Conversation
          </Link>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-chocolate-accent/15 blur-[80px] md:blur-[180px] rounded-full -z-10 pointer-events-none" />
      </section>
    </div>
  );
};

export default Home;
