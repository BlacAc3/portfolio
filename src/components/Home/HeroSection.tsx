import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
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
 * Phones: compact type on short screens; on its side the copy takes the left
 * column and the box the right (`compact:` / `short:` in index.css).
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
    <div className="relative mx-auto flex h-full min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-6 pt-[15svh] sm:pt-[18svh] md:px-8 md:pb-8 md:pt-[19svh] compact:pt-20 short:flex-row short:items-stretch short:gap-6 short:px-8 short:pb-4 short:pt-16">
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-x-8 short:w-[54%] short:shrink-0 short:grid-cols-1 short:content-center short:gap-x-0">
        {/* `contents` lets the two headline lines sit in the grid directly. */}
        <h1 className="contents text-[clamp(2.4rem,13.5vw,3.25rem)] font-black sm:text-[clamp(3.25rem,9vw,104px)] compact:text-[clamp(2.25rem,min(13vw,8.5svh),3.25rem)] short:text-[clamp(2rem,12svh,3.75rem)] uppercase leading-[0.85] tracking-[-0.06em]">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease }}
            className="block text-left md:col-span-12 short:col-span-1"
          >
            <span data-hero-l className="inline-block text-ink -ml-[0.05em] md:-ml-[0.07em]">
              Designing
            </span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.08, ease }}
            className="mt-2 block text-right sm:mt-4 md:col-span-7 md:col-start-6 md:row-start-2 md:pr-6 lg:pr-10 short:col-span-1 short:col-start-auto short:row-start-auto short:mt-1 short:pl-[0.6em] short:pr-0 short:text-left"
          >
            <span data-hero-r className="inline-block text-accent">
              The Future
            </span>
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="mt-10 flex flex-col items-center text-center md:col-span-5 md:col-start-1 md:row-start-2 md:mt-[clamp(1.5rem,3.2vw,3rem)] md:items-start md:text-left compact:mt-6 short:col-span-1 short:col-start-auto short:row-start-auto short:mt-4 short:items-start short:text-left"
        >
          <p className="flex items-center gap-3 font-tech text-[11px] font-bold uppercase tracking-[0.4em] text-accent">
            <span aria-hidden="true" className="hidden h-px w-8 bg-accent/60 md:block" />
            The Architect
          </p>
          <p className="mt-4 max-w-sm text-balance text-base leading-relaxed text-ink/60 md:max-w-[22rem] md:text-[17px] compact:mt-3 compact:text-[15px] short:mt-2 short:max-w-[24rem] short:text-sm">
            Hi, I&apos;m <span className="font-semibold text-ink">Aaron Ezeala</span>. I
            build <span className="whitespace-nowrap">high-fidelity</span> interfaces and robust systems for the next
            generation of the web.
          </p>

          <div className="mt-7 flex items-center gap-5 sm:gap-6 compact:mt-5 short:mt-4">
            <MagneticButton>
              <MotionLink
                to="/work"
                className="group pointer-events-auto relative inline-flex min-h-12 items-center whitespace-nowrap gap-3.5 overflow-hidden rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-bold text-canvas sm:text-[15px]"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span aria-hidden="true" className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="relative z-10">Explore work</span>
                <span aria-hidden="true" className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-canvas text-ink transition-transform duration-300 group-hover:translate-x-0.5">
                  <HiArrowRight className="h-4 w-4" strokeWidth={0.6} />
                </span>
              </MotionLink>
            </MagneticButton>
            <Link
              to="/contact"
              className="group pointer-events-auto relative whitespace-nowrap py-1 text-sm font-bold text-ink/80 transition-colors hover:text-ink sm:text-[15px]"
            >
              Get in touch
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-500 group-hover:scale-x-[0.4]" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* The box's place: whatever space the copy leaves. The 3D scene sizes
          and centres the resting box into this, so the two never collide,
          however short or narrow the screen. On a phone on its side it's
          the column beside the copy. */}
      {!standalone && (
        <div data-hero-box aria-hidden="true" className="mt-4 min-h-28 flex-1 short:mt-0 short:min-h-0" />
      )}

      {/* Scroll cue — the only thing under the box, so it has room to breathe. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-auto hidden justify-center font-tech text-[10px] font-bold uppercase tracking-[0.35em] md:flex short:hidden"
      >
        <span className="flex flex-col items-center gap-3 text-ink/45">
          Hover to peek · Scroll to unbox
          <span aria-hidden="true" className="relative h-8 w-px overflow-hidden bg-ink/20">
            <span className="hero-scroll-dot absolute inset-x-0 top-0 h-3 bg-accent" />
          </span>
        </span>
      </motion.div>
    </div>
  </div>
);

export default HeroSection;
