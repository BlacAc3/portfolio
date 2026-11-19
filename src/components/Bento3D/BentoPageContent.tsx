import { Link } from "react-router-dom";
import { preloadJourney } from "../Journey/loading";
import { HiArrowRight } from "react-icons/hi2";
import me from "../../assets/me.webp";
import type { BentoCell } from "./bentoData";

/**
 * The body of one bento compartment turned full-screen page.
 *
 * It is rendered twice: once inside the sticky 3D stage (translated by GSAP to
 * fake a real scroll) and once as a plain stacked section for reduced-motion /
 * no-WebGL visitors. Both get the same markup, so the content is never a
 * second-class fallback.
 */

interface BentoPageContentProps {
  cell: BentoCell;
  index: number;
  total: number;
  experience?: string;
  onExpandImage: () => void;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen pages must stay opaque: the 3D box is still rendering behind
 * the panel, so any translucency turns the copy into an unreadable mess.
 * Glass is faked with a sheen overlay on a solid base instead.
 */
const surface: Record<BentoCell["theme"], string> = {
  glass: "bg-surface text-ink",
  dark: "bg-canvas text-ink",
  accent: "bg-accent text-canvas",
  photo: "bg-raised text-ink",
};

const BentoPageContent = ({
  cell,
  index,
  total,
  experience,
  onExpandImage,
  className = "",
}: BentoPageContentProps) => {
  const { page, theme } = cell;
  const bright = theme === "accent";
  const isPhoto = theme === "photo";

  // Live Sanity value overrides the placeholder "Years" figure.
  const stats = page.stats?.map((stat) =>
    cell.id === "experience" && stat.label === "In the craft"
      ? { ...stat, value: experience || stat.value }
      : stat,
  );

  const muted = bright ? "text-canvas/70" : "text-ink/60";
  const body = bright ? "text-canvas/80" : "text-ink/70";
  const hairline = bright ? "bg-canvas/20" : "bg-ink/15";
  const chip = bright
    ? "border-canvas/25 text-canvas/80"
    : "border-ink/15 text-ink/70";

  const portrait = (
    <button
      type="button"
      onClick={onExpandImage}
      className="group relative mx-auto block aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-[28px] border border-ink/10 bg-black/40 md:max-w-none"
      aria-label="View full photo of Aaron"
    >
      <img
        src={me}
        alt="Aaron Ezeala"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-3 rounded-[20px] border border-accent/25" />
      <span className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="font-tech text-[10px] font-bold uppercase tracking-[0.3em] text-ink/85">
          View photo
        </span>
      </span>
    </button>
  );

  return (
    <div
      className={`relative w-full overflow-hidden ${surface[theme]} ${className}`}
    >
      {theme === "glass" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgb(var(--ink-rgb)/0.06),rgb(var(--ink-rgb)/0.015)_38%,rgb(var(--ink-rgb)/0)_64%)]"
          />
          <div aria-hidden className="glistening-glass-top-edge" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/25 to-transparent"
          />
        </>
      )}

      {/* Warm glow anchored to the top edge — sells the "screen" feeling. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[120px] ${
          bright ? "bg-ink/30" : "bg-accent/10"
        }`}
      />

      <div className="relative h-full overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pt-[max(2.25rem,6vh)] pb-[18vh] sm:px-10 md:px-14 md:pt-[7vh]">
          {/* Index + eyebrow */}
          <div className="flex items-center gap-4">
            <span
              className={`font-tech text-[11px] font-bold uppercase tracking-[0.4em] ${muted}`}
            >
              {pad(index + 1)}
              <span className="opacity-40"> / {pad(total)}</span>
            </span>
            <span className={`h-px flex-1 ${hairline}`} />
            <span
              className={`font-tech text-[11px] font-bold uppercase tracking-[0.4em] ${bright ? "text-canvas/70" : "text-accent"}`}
            >
              {cell.eyebrow}
            </span>
          </div>

          {isPhoto ? (
            /* Portrait page: copy + points on the left, a tall portrait on
               the right (stacks title → lead → portrait → points on phones). */
            <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-12 lg:gap-16">
              <div className="flex flex-col md:col-span-7">
                <h3 data-title className="font-display text-[clamp(2.35rem,5.6vw,4.25rem)] font-black leading-[0.92] tracking-[-0.035em]">
                  {cell.title}
                </h3>
                <p className={`mt-6 max-w-[46ch] text-base leading-relaxed sm:text-lg md:mt-8 md:text-[1.0625rem] md:leading-[1.7] ${body}`}>
                  {page.lead}
                </p>
                <div className="mt-10 md:hidden">{portrait}</div>
                <ol className="mt-12 list-none border-t border-ink/10 p-0 md:mt-auto md:pt-2">
                  {page.points.map((point, i) => (
                    <li key={point.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-ink/10 py-6 md:py-7">
                      <span className={`pt-1.5 font-tech text-[10px] font-bold tracking-[0.3em] ${muted}`}>
                        {pad(i + 1)}
                      </span>
                      <div>
                        <h4 className="font-display text-lg font-bold tracking-tight md:text-xl">
                          {point.title}
                        </h4>
                        <p className={`mt-2 max-w-md text-sm leading-relaxed md:text-[0.9375rem] ${body}`}>
                          {point.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="hidden md:col-span-5 md:block">{portrait}</div>
            </div>
          ) : (
            <>
          {/* Title + lead */}
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end md:gap-10">
            <h3
              data-title
              className={`font-display font-black leading-[0.92] tracking-[-0.035em] text-[clamp(2.35rem,5.6vw,4.25rem)] ${
                isPhoto ? "md:col-span-6" : "md:col-span-7"
              }`}
            >
              {cell.title}
            </h3>
            <p
              className={`max-w-[46ch] text-base leading-relaxed sm:text-lg md:col-span-4 md:col-start-9 md:text-[1.0625rem] md:leading-[1.7] ${body}`}
            >
              {page.lead}
            </p>
          </div>

          {/* Points */}
          <div
            className={`mt-14 grid gap-9 border-t pt-9 md:mt-20 md:grid-cols-3 md:gap-10 ${
              bright ? "border-canvas/20" : "border-ink/10"
            }`}
          >
            {page.points.map((point, i) => (
              <div
                key={point.title}
                className={
                  i > 0
                    ? `md:border-l md:pl-10 ${
                        bright ? "border-canvas/20" : "border-ink/10"
                      }`
                    : ""
                }
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={`font-tech text-[10px] font-bold tracking-[0.3em] ${muted}`}
                  >
                    {pad(i + 1)}
                  </span>
                  <h4 className="font-display text-lg font-bold tracking-tight md:text-xl">
                    {point.title}
                  </h4>
                </div>
                <p
                  className={`mt-3 max-w-sm text-sm leading-relaxed md:text-[0.9375rem] ${body}`}
                >
                  {point.body}
                </p>
              </div>
            ))}
          </div>

            </>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div
              className={`mt-14 grid gap-8 border-t pt-10 md:mt-20 md:grid-cols-2 ${
                bright ? "border-canvas/20" : "border-ink/10"
              }`}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-4xl font-black tracking-tight md:text-5xl">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-2 font-tech text-[10px] font-bold uppercase tracking-[0.35em] ${muted}`}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quote */}
          {page.quote && (
            <blockquote className="mt-16 md:mt-24">
              <p
                className={`max-w-4xl font-display text-[clamp(1.75rem,4.4vw,3.25rem)] font-black leading-[1.02] tracking-[-0.03em] ${
                  bright ? "text-canvas" : "text-ink/90"
                }`}
              >
                <span className="text-accent">&ldquo;</span>
                {page.quote}
                <span className="text-accent">&rdquo;</span>
              </p>
            </blockquote>
          )}

          {/* Toolkit */}
          {page.toolkit && page.toolkit.length > 0 && (
            <div className="mt-14 md:mt-20">
              <p
                className={`font-tech text-[10px] font-bold uppercase tracking-[0.4em] ${muted}`}
              >
                Toolkit
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {page.toolkit.map((tool) => (
                  <li
                    key={tool}
                    className={`rounded-full border px-4 py-2 font-tech text-[11px] font-bold uppercase tracking-[0.2em] ${chip}`}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 flex flex-wrap items-center gap-6 md:mt-24">
            {page.cta && (
              <Link
                to={page.cta.to}
                onPointerEnter={page.cta.to === "/about" ? () => void preloadJourney() : undefined}
                className={`group inline-flex items-center gap-3 rounded-full px-7 py-4 font-tech text-[11px] font-bold uppercase tracking-[0.25em] transition-transform duration-300 hover:scale-[1.03] ${
                  bright
                    ? "bg-canvas text-accent-soft"
                    : "bg-accent text-canvas"
                }`}
              >
                {page.cta.label}
                <HiArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            )}
            <span
              className={`font-tech text-[10px] font-bold uppercase tracking-[0.35em] ${muted}`}
            >
              Keep scrolling
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoPageContent;
