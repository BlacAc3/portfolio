import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/Home/HeroSection";
import BentoShowcase from "../components/Bento3D/BentoShowcase";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import me from "../assets/me.webp";
import { RiCloseLine } from "react-icons/ri";
import { useSanity } from "../hooks/useSanity";
import { hasWebGL, usePrefersReducedMotion } from "../hooks/useMediaQuery";

interface SiteSettings {
  experience?: string;
  projectsCompleted?: string;
  happyClients?: string;
  heroTagline?: string;
}

const Home = () => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(hasWebGL);
  const showcase3D = webgl && !reduced;

  const { data: settings } = useSanity<SiteSettings>(`*[_type == "siteSettings"][0]`);

  // Lightbox: focus the close button, close on Escape, lock page scroll.
  useEffect(() => {
    if (!isImageExpanded) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsImageExpanded(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isImageExpanded]);

  return (
    <div className="overflow-x-clip">
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo of Aaron"
            className="fixed inset-0 z-[100] bg-chocolate-dark/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsImageExpanded(false)}
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close photo"
              className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsImageExpanded(false)}
            >
              <RiCloseLine size={32} aria-hidden="true" />
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

      {/* The hero is the showcase's first screen: the box resting under the
          headline is the same box that opens into the pages below. */}
      <BentoShowcase
        experience={settings?.experience}
        onExpandImage={() => setIsImageExpanded(true)}
        hero={<HeroSection standalone={!showcase3D} />}
      />

      {/* 3. THE CALL TO ACTION */}
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
            className="px-8 py-5 md:px-12 md:py-6 bg-chocolate-accent text-chocolate-dark rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform duration-300 inline-block shadow-[0_20px_60px_-15px_rgba(212,167,106,0.4)] font-tech text-xs md:text-sm"
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
