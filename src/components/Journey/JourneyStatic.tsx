import { CHAPTERS, ROSSO } from "./chapters";

/**
 * The drive as a plain read: used with reduced motion or without WebGL.
 * Same copy, same order, a route line down the side instead of a road.
 */
export default function JourneyStatic() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 id="journey-title" className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-black tracking-[-0.035em] text-ink">
          What I love, in nine stops
        </h2>
        <p className="mt-3 max-w-xl text-ink/65">
          The animated drive is off because your device asks for reduced motion, or can&apos;t run 3D. Here&apos;s the same route.
        </p>
        <ol className="relative mt-14 list-none border-l-2 border-ink/10 p-0 pl-8 md:pl-12">
          <span
            aria-hidden="true"
            className="absolute -left-[7px] top-0 h-3 w-3 rounded-[3px]"
            style={{ background: ROSSO }}
          />
          {CHAPTERS.map((c, i) => (
            <li key={c.id} className="relative pb-14 last:pb-0">
              <span aria-hidden="true" className="absolute -left-[calc(2rem+7px)] top-2 h-3 w-3 rounded-full border-2 border-accent bg-canvas md:-left-[calc(3rem+7px)]" />
              <p className="font-tech text-xs font-bold text-ink/55">
                <span className="text-accent">
                  {i + 1}/{CHAPTERS.length}
                </span>{" "}
                {c.stop}
              </p>
              <h3 id={`stop-${c.id}`} className="mt-2 font-display text-3xl font-black tracking-[-0.03em] text-ink md:text-4xl">
                {c.title}
              </h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">{c.body}</p>
              <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                {c.facts.map((f) => (
                  <li key={f} className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/80">
                    {f}
                  </li>
                ))}
              </ul>
              {c.note && <p className="mt-3 max-w-xl text-xs leading-relaxed text-ink/50">{c.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
