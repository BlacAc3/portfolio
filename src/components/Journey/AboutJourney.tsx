import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "../../contexts/ThemeContext";
import { hasWebGL, useMediaQuery, usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { jumpTo } from "../../lib/jump";
import { CHAPTERS, ROSSO } from "./chapters";
import { N, READ_AT, veilAt } from "./timeline";
import { pauseParticles } from "../magicui/particles";
import JourneyStatic from "./JourneyStatic";
import { journey, window4 } from "./state";

const JourneyScene = lazy(() => import("./JourneyScene"));

/** Scroll per chapter, in viewport heights. */
const PER_CHAPTER = 1.4;

const linkCls = "underline decoration-ink/25 underline-offset-2 hover:text-accent hover:decoration-accent";

/** The models' CC BY attribution lives on its own page; this is the way there. */
const ModelCredits = () => (
  <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink/45">
    <Link className={linkCls} to="/credits">
      3D model credits
    </Link>
  </p>
);

/** Opens "The short version" from anywhere on the page. */
export const openShortVersion = () => window.dispatchEvent(new CustomEvent("journey:short"));

/* ------------------------------------------------------------------ */
/* The short version                                                   */
/* ------------------------------------------------------------------ */

const ShortVersion = ({ onGo }: { onGo: (c: number) => void }) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const open = () => ref.current?.showModal();
    window.addEventListener("journey:short", open);
    return () => window.removeEventListener("journey:short", open);
  }, []);
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      data-lenis-prevent
      aria-labelledby="short-title"
      onClick={(e) => e.target === ref.current && close()}
      className="m-auto w-[min(100%-2rem,42rem)] max-h-[min(88svh,52rem)] overflow-y-auto rounded-[28px] border border-ink/10 bg-surface p-0 text-ink shadow-2xl backdrop:bg-canvas/70 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 flex items-start justify-between gap-6 border-b border-ink/10 bg-surface px-6 pb-5 pt-6 md:px-8">
        <div>
          <h2 id="short-title" className="font-display text-2xl font-black tracking-tight md:text-3xl">
            The short version
          </h2>
          <p className="mt-1 text-sm text-ink/60">Nine stops, one line each. Pick one to drive straight there.</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="shrink-0 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Close
        </button>
      </div>
      <ol className="m-0 list-none p-0">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className="border-b border-ink/5 last:border-0">
            <button
              type="button"
              onClick={() => {
                close();
                onGo(i);
              }}
              className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 px-6 py-4 text-left hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] focus-visible:outline-none md:px-8"
            >
              <span className="font-tech text-xs font-bold text-accent">{i + 1}</span>
              <span>
                <span className="block font-semibold">{c.stop}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink/65">{c.short}</span>
              </span>
              <span className="text-xs font-semibold text-ink/40 group-hover:text-accent group-focus-visible:text-accent">
                Go
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-6 py-5 text-sm md:px-8">
        <span className="text-ink/55">Seen enough?</span>
        <a
          href="#about"
          onClick={close}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Skip to experience and toolkit
        </a>
      </div>
    </dialog>
  );
};

/* ------------------------------------------------------------------ */
/* The drive                                                           */
/* ------------------------------------------------------------------ */

const Panel = ({ i }: { i: number }) => {
  const c = CHAPTERS[i];
  return (
    <article
      data-panel={i}
      aria-labelledby={`stop-${c.id}`}
      style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
      className="absolute inset-x-0 bottom-0 px-5 pb-[max(5.5rem,env(safe-area-inset-bottom))] will-change-[opacity,transform] md:inset-x-auto md:bottom-auto md:left-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:top-1/2 md:w-[min(26rem,34vw)] md:px-0 md:pb-0"
    >
      <p className="font-tech text-xs font-bold text-ink/55">
        <span className="text-accent">
          {i + 1}/{N}
        </span>{" "}
        {c.stop}
      </p>
      <h2
        id={`stop-${c.id}`}
        className="mt-3 font-display text-[clamp(1.9rem,3.5vw,3.25rem)] font-black leading-[0.98] tracking-[-0.035em] text-ink"
      >
        {c.title}
      </h2>
      <p className="mt-4 max-w-[34rem] text-[15px] leading-relaxed text-ink/75 md:mt-5 md:text-base">{c.body}</p>
      <ul className="mt-5 hidden list-none flex-wrap gap-2 p-0 md:flex">
        {c.facts.map((f) => (
          <li key={f} className="rounded-full border border-ink/15 bg-canvas/40 px-3 py-1 text-xs font-semibold text-ink/80 backdrop-blur-sm">
            {f}
          </li>
        ))}
      </ul>
      {c.note && <p className="mt-4 hidden max-w-[30rem] text-xs leading-relaxed text-ink/50 md:block">{c.note}</p>}
      {i === N - 1 && (
        <div data-outro className="mt-6 flex flex-wrap gap-3" style={{ opacity: 0 }}>
          <Link
            to="/work"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-canvas hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            See my work
          </Link>
          <a
            href="#about"
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
          >
            Keep reading
          </a>
        </div>
      )}
    </article>
  );
};

const Drive = () => {
  const { theme } = useTheme();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const desktop = useMediaQuery("(min-width: 768px)");
  const go = (c: number) => {
    const st = trigger.current;
    if (!st) return;
    jumpTo(st.start + ((c + READ_AT[c]) / N) * (st.end - st.start));
  };

  // Mount the scene a screen early; only render frames while on screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const early = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "100% 0px",
    });
    const live = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    early.observe(el);
    live.observe(el);
    return () => (early.disconnect(), live.disconnect());
  }, []);

  useLayoutEffect(() => {
    const el = section.current;
    const st = stage.current;
    if (!el || !st) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = <T extends HTMLElement>(s: string) => Array.from(st.querySelectorAll<T>(s));
    const panels = q<HTMLElement>("[data-panel]");
    const stops = q<HTMLButtonElement>("[data-stop]");
    const outro = st.querySelector<HTMLElement>("[data-outro]");
    const fill = st.querySelector<HTMLElement>("[data-fill]");
    const marker = st.querySelector<HTMLElement>("[data-marker]");
    const veil = st.querySelector<HTMLElement>("[data-veil]");
    const pillNum = st.querySelector<HTMLElement>("[data-pill-num]");
    const pillLabel = st.querySelector<HTMLElement>("[data-pill-label]");
    let current = -1;
    let resumeParticles: (() => void) | null = null;

    const apply = (u: number) => {
      journey.u = u;
      panels.forEach((p, i) => {
        const v = u - i;
        const a = i === 0 ? -1 : -0.02;
        const d = i === N - 1 ? 2 : 0.98;
        const o = window4(v, a, i === 0 ? -0.5 : 0.1, i === N - 1 ? 1.5 : 0.86, d);
        p.style.opacity = String(o);
        p.style.visibility = o > 0.01 ? "visible" : "hidden";
        const y = (1 - o) * (v < 0.5 ? 18 : -18);
        p.style.transform = `translate3d(0, calc(${y}px + var(--panel-y, 0px)), 0)`;
      });
      if (outro) outro.style.opacity = String(window4(u - (N - 1), 0.84, 0.92, 2, 3));
      const k = Math.min(1, u / N);
      if (fill) fill.style.transform = `scaleX(${k})`;
      if (marker) marker.style.left = `${k * 100}%`;
      if (veil) veil.style.opacity = String(veilAt(u));
      const c = Math.min(N - 1, Math.floor(u));
      if (c !== current) {
        current = c;
        stops.forEach((b, i) => {
          if (i === c) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
        if (pillNum) pillNum.textContent = `${c + 1}/${N}`;
        if (pillLabel) pillLabel.textContent = CHAPTERS[c].stop;
      }
    };

    trigger.current = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress * N),
      // While the stage is pinned it covers the viewport: stop drawing the
      // background particles underneath it.
      onToggle: (self) => {
        if (self.isActive) resumeParticles ??= pauseParticles();
        else {
          resumeParticles?.();
          resumeParticles = null;
        }
      },
      onRefresh: (self) => apply(self.progress * N),
    });
    apply(trigger.current.progress * N);

    // ?journey=3.5 lands on that point of the drive (handy for screenshots).
    const debug = Number(new URLSearchParams(window.location.search).get("journey"));
    if (debug > 0) {
      const t = trigger.current;
      window.setTimeout(() => {
        const y = t.start + (Math.min(debug, N - 0.001) / N) * (t.end - t.start);
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        apply(debug);
      }, 400);
    }

    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
      trigger.current?.kill();
      trigger.current = null;
      resumeParticles?.();
    };
  }, []);

  const step = (d: number) => {
    const c = Math.min(N - 1, Math.max(0, Math.floor(journey.u) + d));
    go(c);
  };

  return (
    <>
      <section
        ref={section}
        id="journey"
        aria-label="The drive: what I love, in nine stops"
        className="relative"
        style={{ height: `calc(${N * PER_CHAPTER * 100}svh + 100svh)` }}
      >
        <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden bg-canvas">
          <div className="absolute inset-0">
            {near && (
              <Suspense fallback={null}>
                <JourneyScene theme={theme} active={inView} framing particles={desktop ? 9000 : 5000} />
              </Suspense>
            )}
          </div>

          {/* Scrims keep the copy readable over the scene. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 via-35% to-transparent to-60% md:bg-gradient-to-r md:from-canvas/90 md:via-canvas/55 md:via-32% md:to-transparent md:to-50%"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-canvas/80 to-transparent"
          />
          <div data-veil aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#16120f] opacity-0" />

          <div className="[--panel-y:-50%] max-md:[--panel-y:0px]">
            {CHAPTERS.map((c, i) => (
              <Panel key={c.id} i={i} />
            ))}
          </div>

          {/* Skim controls, top right on desktop */}
          <div className="absolute right-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] top-24 hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={openShortVersion}
              className="rounded-full border border-ink/15 bg-canvas/50 px-4 py-2 text-sm font-semibold text-ink backdrop-blur-md hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              The short version
            </button>
            <a
              href="#about"
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink/65 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Skip the drive
            </a>
          </div>

          {/* Route map (desktop) */}
          <nav
            aria-label="Stops on the drive"
            className="absolute bottom-8 left-1/2 hidden w-[min(46rem,62vw)] -translate-x-1/2 md:block"
          >
            <div className="relative h-10">
              <div aria-hidden="true" className="absolute inset-x-0 top-[13px] h-[2px] rounded-full bg-ink/15" />
              <div
                data-fill
                aria-hidden="true"
                className="absolute inset-x-0 top-[13px] h-[2px] origin-left rounded-full bg-accent"
                style={{ transform: "scaleX(0)" }}
              />
              <ol className="m-0 list-none p-0">
                {CHAPTERS.map((c, i) => (
                  <li key={c.id} className="absolute top-0 -translate-x-1/2" style={{ left: `${((i + READ_AT[i]) / N) * 100}%` }}>
                    <button
                      type="button"
                      data-stop={i}
                      onClick={() => go(i)}
                      className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                    >
                      <span className="mt-2 block h-3 w-3 rounded-full border-2 border-ink/40 bg-canvas transition-colors group-hover:border-accent group-focus-visible:ring-2 group-focus-visible:ring-accent group-aria-[current=step]:border-accent group-aria-[current=step]:bg-accent" />
                      <span className="whitespace-nowrap text-[11px] font-semibold text-ink/0 transition-colors group-hover:text-ink/80 group-focus-visible:text-ink/80 group-aria-[current=step]:text-ink/85">
                        {c.stop}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <span
                data-marker
                aria-hidden="true"
                className="pointer-events-none absolute top-[9px] h-[10px] w-6 -translate-x-1/2 rounded-[3px] shadow-[0_0_12px_rgba(196,30,42,0.6)]"
                style={{ left: 0, background: ROSSO }}
              />
            </div>
          </nav>

          {/* Phone pill */}
          <div className="absolute inset-x-0 bottom-5 flex justify-center px-5 md:hidden">
            <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-canvas/75 p-1 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous stop"
                className="grid h-10 w-10 place-items-center rounded-full text-lg text-ink/80 active:bg-ink/10"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={openShortVersion}
                className="min-w-[10.5rem] rounded-full px-3 py-2 text-center text-sm font-semibold text-ink"
              >
                <span data-pill-num className="mr-2 font-tech text-xs text-accent">
                  1/{N}
                </span>
                <span data-pill-label>{CHAPTERS[0].stop}</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next stop"
                className="grid h-10 w-10 place-items-center rounded-full text-lg text-ink/80 active:bg-ink/10"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
      <ModelCredits />
      <ShortVersion onGo={go} />
    </>
  );
};

/** The about-page drive, or a calm reading version without motion or WebGL. */
export default function AboutJourney() {
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(hasWebGL);
  if (reduced || !webgl)
    return (
      <>
        <JourneyStatic />
        <ShortVersion
          onGo={(c) => {
            const el = document.getElementById(`stop-${CHAPTERS[c].id}`);
            if (el) jumpTo(el.getBoundingClientRect().top + window.scrollY - 120);
          }}
        />
      </>
    );
  return <Drive />;
}
