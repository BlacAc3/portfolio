import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MagneticButton from "../Shared/MagneticButton";

const MotionLink = motion.create(Link);
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Hero copy. It has no scroll logic of its own: it sits on the bento
 * showcase's first screen, above the closed box, and the showcase's render
 * loop drives it out (`[data-hero]`, `[data-hero-l]`, `[data-hero-r]`).
 * With `standalone` it lays itself out as a normal full-height section
 * (reduced motion / no WebGL).
 *
 * Composition (md+): the headline steps down left → right, and the intro +
 * actions fill the space under "Designing", beside "The Future". That
 * leaves the bottom middle to the box, with only a slim meta strip under it.
 */
const HeroSection = ({ standalone = false }: { standalone?: boolean }) => (
  <div
    id="home"
    className={
      standalone
        ? "relative min-h-[100svh] w-full"
        : "pointer-events-none absolute inset-0 w-full"
    }
  >
    <div className="relative mx-auto flex h-full min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-6 pt-[15svh] sm:pt-[18svh] md:px-8 md:pb-8 md:pt-[19svh]">
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-x-8">
        {/* `contents` lets the two headline lines sit in the grid directly. */}
        <h1 className="contents text-[clamp(3.25rem,9vw,104px)] font-black uppercase leading-[0.85] tracking-[-0.06em]">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease }}
            className="block text-left md:col-span-12"
          >
            <span data-hero-l className="inline-block text-white -ml-[0.05em] md:-ml-[0.07em]">
              Designing
            </span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.08, ease }}
            className="mt-2 block text-right sm:mt-4 md:col-span-7 md:col-start-6 md:row-start-2 md:pr-6 lg:pr-10"
          >
            <span data-hero-r className="inline-block text-chocolate-accent">
              The Future
            </span>
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="mt-10 flex flex-col items-center text-center md:col-span-5 md:col-start-1 md:row-start-2 md:mt-[clamp(1.5rem,3.2vw,3rem)] md:items-start md:text-left"
        >
          <p className="flex items-center gap-3 font-tech text-[11px] font-bold uppercase tracking-[0.4em] text-chocolate-accent">
            <span aria-hidden="true" className="hidden h-px w-8 bg-chocolate-accent/60 md:block" />
            The Architect
          </p>
          <p className="mt-4 max-w-sm text-balance text-base leading-relaxed text-white/60 md:max-w-[22rem] md:text-[17px]">
            Hi, I&apos;m <span className="font-semibold text-white">Aaron Ezeala</span>. I
            build <span className="whitespace-nowrap">high-fidelity</span> interfaces and robust systems for the next
            generation of the web.
          </p>

          <div className="mt-7 flex items-center gap-6">
            <MagneticButton>
              <MotionLink
                to="/work"
                className="group pointer-events-auto relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white py-3 pl-6 pr-3 text-sm font-bold text-chocolate-dark sm:text-[15px]"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span aria-hidden="true" className="absolute inset-0 bg-chocolate-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="relative z-10">Explore work</span>
                <span aria-hidden="true" className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-chocolate-dark text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </MotionLink>
            </MagneticButton>
            <Link
              to="/contact"
              className="group pointer-events-auto relative py-1 text-sm font-bold text-white/80 transition-colors hover:text-white sm:text-[15px]"
            >
              Get in touch
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-chocolate-accent transition-transform duration-500 group-hover:scale-x-[0.4]" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue — the only thing under the box, so it has room to breathe. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-auto hidden justify-center font-tech text-[10px] font-bold uppercase tracking-[0.35em] md:flex"
      >
        <span className="flex flex-col items-center gap-3 text-white/45">
          Hover to peek · Scroll to unbox
          <span aria-hidden="true" className="relative h-8 w-px overflow-hidden bg-white/20">
            <span className="hero-scroll-dot absolute inset-x-0 top-0 h-3 bg-chocolate-accent" />
          </span>
        </span>
      </motion.div>
    </div>
  </div>
);

export default HeroSection;
