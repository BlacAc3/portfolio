import { useRef, useLayoutEffect, useState } from "react";
import HeroSection from "../components/Home/HeroSection";
import BentoGrid from "../components/Shared/BentoGrid";
import BentoCard from "../components/Shared/BentoCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import me from "../assets/me.webp";
import { HiArrowRight } from "react-icons/hi2";
import { RiCloseLine } from "react-icons/ri";
import { useSanity } from "../hooks/useSanity";

gsap.registerPlugin(ScrollTrigger);

interface SiteSettings {
  experience?: string;
  projectsCompleted?: string;
  happyClients?: string;
  heroTagline?: string;
}

const Home = () => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const speedRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const speedContentRef = useRef<HTMLDivElement>(null);
  const craftContentRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useSanity<SiteSettings>(`*[_type == "siteSettings"][0]`);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const speedTl = gsap.timeline({
        scrollTrigger: {
          trigger: speedRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
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
          anticipatePin: 1,
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

      <AnimatePresence>
        {isImageExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsImageExpanded(false)}
          >
            <button
              className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsImageExpanded(false)}
            >
              <RiCloseLine size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={me}
              alt="Aaron full view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="min-h-screen md:h-screen w-full flex flex-col justify-center py-12 px-4 md:px-6 relative z-10 border-white/5">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 md:mb-4 text-white">
                THE <span className="text-chocolate-accent">SYNERGY</span>
              </h2>
              <p className="text-xs md:text-sm text-white/40 uppercase tracking-widest font-bold font-tech">
                Design & Engineering: The Perfect Pairing
              </p>
            </div>
            <Link
              to="/work"
              className="group flex items-center gap-3 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs font-tech"
            >
              Explore Work
              <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <HiArrowRight className="text-lg" />
              </span>
            </Link>
          </div>

          {/* Added lg:grid-cols-4 and md:grid-cols-4 so layout is consistent on desktop */}
          <BentoGrid className="flex-grow min-h-0 md:grid-rows-3 p-0 py-0 md:p-0 gap-4 md:gap-4 lg:gap-6 md:grid-cols-4 lg:grid-cols-4">
            <BentoCard colSpan={2} rowSpan={2} theme="glass" className="px-6 py-8 md:px-8 md:py-8">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-4xl font-black mb-3 md:mb-4 leading-[1] tracking-tight">
                    Like rice and stew — <br />
                    <span className="text-chocolate-accent">
                      inseparable by nature.
                    </span>
                  </h3>
                  <p className="text-sm md:text-base text-white/60 leading-relaxed font-light mb-4">
                    In my world, design and engineering aren't different phases;
                    they are the same soul in different forms. One provides the
                    structure, the other provides the life.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-6 md:gap-8">
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-black text-white font-tech tracking-tighter">
                      FAST
                    </p>
                    <p className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-bold opacity-30 mt-1 font-tech">
                      Performance
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl md:text-2xl font-black text-chocolate-accent font-tech tracking-tighter">
                      FINE
                    </p>
                    <p className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-bold opacity-30 mt-1 font-tech">
                      Aesthetics
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              colSpan={1}
              rowSpan={2}
              className="p-0 border-0 overflow-hidden min-h-[200px] cursor-pointer"
            >
              <div 
                className="relative h-full w-full overflow-hidden group"
                onClick={() => setIsImageExpanded(true)}
              >
                <img
                  src={me}
                  alt="Aaron"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-dark/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[7px] md:text-[8px] uppercase tracking-[0.5em] font-black text-chocolate-accent mb-2 font-tech">
                    Click to view
                  </p>
                  <p className="text-lg md:text-xl font-black text-white tracking-tight">
                    Aaron
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard colSpan={1} rowSpan={1} theme="glass" className="px-6 py-6 md:px-6">
              <div className="flex flex-col h-full justify-center items-center text-center">
                <p className="text-4xl md:text-5xl lg:text-6xl font-black text-chocolate-accent tracking-tighter font-tech leading-none">
                  {settings?.experience || "4+"}
                </p>
                <p className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold opacity-40 mt-2 font-tech">
                  Years Exp.
                </p>
              </div>
            </BentoCard>

            <BentoCard colSpan={1} rowSpan={1} theme="accent" className="px-6 py-6">
              <div className="h-full flex flex-col justify-center gap-2">
                <h4 className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-black opacity-50 font-tech">
                  Tech
                </h4>
                <p className="text-sm md:text-base font-black leading-tight tracking-tight">
                  Bleeding edge.
                </p>
              </div>
            </BentoCard>

            <BentoCard colSpan={2} rowSpan={1} theme="dark" className="px-6 py-6">
              <div className="h-full flex flex-col justify-center gap-2">
                <h4 className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-black opacity-30 font-tech">
                  Speed
                </h4>
                <p className="text-sm md:text-base font-black leading-tight tracking-tight text-white/90">
                  Precision enthusiast.
                </p>
              </div>
            </BentoCard>

            <BentoCard colSpan={2} theme="glass" className="px-6 py-6">
              <div className="h-full flex flex-col justify-center gap-2">
                <h3 className="text-lg md:text-xl font-black tracking-tight">
                  Curated Engineering
                </h3>
                <Link
                  to="/work"
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-chocolate-accent hover:text-white transition-colors font-tech"
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
        <div ref={speedContentRef} className="max-w-6xl w-full px-6 will-change-transform flex flex-col">
          <div className="flex justify-start w-full mb-8 md:mb-12">
            <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-chocolate-accent font-black font-tech">
              Philosophy of Speed
            </h3>
          </div>
          <div className="flex justify-end w-full">
            <p className="text-3xl md:text-6xl lg:text-[80px] font-black tracking-tighter leading-[0.9] md:leading-[0.8] text-white text-right max-w-4xl">
              "Speed isn't <br className="hidden md:block" />
              just a metric;
              <br className="hidden md:block" />
              it’s a{" "}
              <span className="italic text-chocolate-accent">discipline.</span>"
            </p>
          </div>
          <div className="flex justify-start w-full mt-12 md:mt-24">
            <p className="text-base md:text-xl text-white/40 font-light max-w-xl leading-relaxed text-left">
              Software should be engineered for high-velocity performance without
              sacrificing the soul of its design.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PHILOSOPHY PART 2: THE CRAFT */}
      <section
        className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden"
        ref={craftRef}
      >
        <div ref={craftContentRef} className="max-w-6xl w-full px-6 will-change-transform flex flex-col">
          <div className="flex justify-end w-full mb-8 md:mb-12">
            <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-chocolate-accent font-black font-tech">
              The Craft
            </h3>
          </div>
          <div className="flex justify-start w-full">
            <p className="text-3xl md:text-6xl lg:text-[80px] font-black tracking-tighter leading-[0.9] md:leading-[0.8] text-white text-left max-w-4xl">
              To master the tool,
              <br className="hidden md:block" />
              first{" "}
              <span className="text-chocolate-accent">
                understand <br />
                the gear.
              </span>
            </p>
          </div>
          <div className="flex justify-end w-full mt-12 md:mt-24">
            <p className="text-base md:text-xl text-white/40 font-light max-w-xl leading-relaxed text-right">
              Knowing every gear and circuit before assembling the machine ensures
              that functionality meets absolute beauty.
            </p>
          </div>
        </div>
      </section>

      {/* 5. THE CALL TO ACTION */}
      <section className="py-20 md:py-32 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-6"
        >
          <h2 className="text-3xl md:text-[100px] font-black tracking-[-0.07em] leading-[0.8] md:leading-[0.75] mb-12 md:mb-16 uppercase">
            READY TO <br />
            <span className="text-chocolate-accent">ACCELERATE?</span>
          </h2>
          <Link
            to="/contact"
            className="px-8 py-5 md:px-12 md:py-6 bg-chocolate-accent text-chocolate-dark rounded-full font-black uppercase tracking-widest hover:scale-110 transition-all inline-block shadow-[0_20px_60px_-15px_rgba(212,167,106,0.4)] font-tech text-xs md:text-sm"
          >
            Start a Conversation
          </Link>
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-chocolate-accent/15 blur-[80px] md:blur-[180px] rounded-full -z-10 pointer-events-none will-change-[filter,transform]" />
      </section>
    </div>
  );
};

export default Home;
