import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import AboutSection from "../components/About/AboutSection";
import me from "../assets/me.webp";

const ease = [0.22, 1, 0.36, 1] as const;

const STATEMENT =
  "Software engineering is more than typing lines of code. It is architecting digital environments that respect the user's attention and intelligence.";

const PRINCIPLES = [
  {
    title: "Fast under load",
    body: "Systems designed for scale from the schema up: queues, caching and search that stay quick when traffic spikes.",
  },
  {
    title: "Calm to use",
    body: "Interfaces that feel effortless. Every motion and every millisecond is there to serve the person using it.",
  },
  {
    title: "Built to last",
    body: "Clear architecture and strict patterns, so the codebase stays maintainable long after launch.",
  },
];

/** A word that lights up as the statement scrolls through the viewport. */
const Word = ({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) => {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
};

const Statement = () => {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = STATEMENT.split(" ");

  return (
    <p
      ref={ref}
      className="font-display text-[clamp(1.75rem,4.4vw,3.75rem)] font-black leading-[1.08] tracking-[-0.03em] text-ink"
    >
      {reduced
        ? STATEMENT
        : words.map((w, i) => (
            <Word
              key={`${w}-${i}`}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
            >
              {w}
            </Word>
          ))}
    </p>
  );
};

const Portrait = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.figure
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.15, ease }}
      className="group relative m-0 md:ml-auto md:w-[min(100%,calc(64svh*0.8))]"
    >
      <div
        ref={ref}
        className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-ink/10 bg-surface md:aspect-[4/5] md:max-h-[64svh]"
      >
        <motion.img
          src={me}
          alt="Portrait of Aaron Ezeala"
          style={reduced ? undefined : { y, scale: 1.14 }}
          className="h-full w-full object-cover object-[center_35%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-[20px] border border-accent/25"
        />
      </div>
      <figcaption className="absolute inset-x-7 bottom-7 flex items-center justify-between gap-3 whitespace-nowrap font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-ink/70 sm:text-[10px] sm:tracking-[0.3em]">
        <span>Aaron Ezeala</span>
        <span className="text-accent">Full-stack engineer</span>
      </figcaption>
    </motion.figure>
  );
};

const About = () => {
  return (
    <div className="relative pt-24 min-h-[100dvh]">
      <div aria-hidden="true" className="ambient-wash pointer-events-none absolute inset-x-0 top-0 h-[90vh]" />
      <header className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-12 md:items-end md:gap-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="md:col-span-7 md:pb-6"
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.5em] text-accent font-tech font-bold mb-6">
            About · Aaron Ezeala
          </p>
          <h1 className="text-[clamp(3.5rem,10vw,120px)] font-black tracking-[-0.06em] leading-[0.85] mb-8 md:mb-10">
            THE <br />
            <span className="text-accent">CRAFTSMAN</span>
          </h1>
          <p className="max-w-xl text-lg md:text-2xl text-ink/70 leading-relaxed">
            Full-stack engineer with a designer&apos;s eye — building platforms
            that are fast under load and calm to use.
          </p>
        </motion.div>
        <div className="md:col-span-5">
          <Portrait />
        </div>
      </header>

      <AboutSection />

      <section
        aria-labelledby="philosophy-title"
        className="relative overflow-hidden border-t border-ink/5 px-6 py-24 md:py-40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-accent/[0.07] blur-[140px]"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-6 md:mb-14">
            <h2
              id="philosophy-title"
              className="font-tech text-[11px] md:text-xs font-bold uppercase tracking-[0.5em] text-accent"
            >
              Philosophy
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
          </div>

          <Statement />

          <ol className="mt-20 grid list-none gap-px overflow-hidden rounded-[28px] border border-ink/10 bg-ink/10 p-0 md:mt-28 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease }}
                className="bg-surface p-8 md:p-10"
              >
                <p className="font-tech text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-2xl font-black tracking-tight text-ink md:mt-12">
                  {p.title}
                </h3>
                <p className="mt-3 text-ink/65 leading-relaxed">{p.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};

export default About;
