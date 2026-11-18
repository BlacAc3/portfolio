import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import me from "../../assets/me.webp";

interface SynergyGridProps {
  experience?: string;
  onExpandImage: () => void;
  /**
   * `true` → the grid runs its own scroll-triggered reveal (static fallback).
   * `false` → a parent timeline owns the reveal (3D showcase outro).
   */
  selfReveal?: boolean;
}

const GRID_CLASSES =
  "flex-grow min-h-0 md:grid-rows-3 p-0 py-0 md:p-0 gap-4 md:gap-4 lg:gap-6 md:grid-cols-4 lg:grid-cols-4";

function renderCards(experience: string | undefined, onExpandImage: () => void) {
  return (
    <>
      <BentoCard colSpan={2} rowSpan={2} theme="glass" className="px-6 py-8 md:px-8 md:py-8">
        <div className="h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xl md:text-2xl lg:text-4xl font-black mb-3 md:mb-4 leading-[1] tracking-tight">
              Like rice and stew — <br />
              <span className="text-accent">inseparable by nature.</span>
            </h3>
            <p className="text-sm md:text-base text-ink/70 leading-relaxed mb-4">
              In my world, design and engineering aren't different phases;
              they are the same soul in different forms. One provides the
              structure, the other provides the life.
            </p>
          </div>
          <div className="pt-4 border-t border-ink/5 flex items-center gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black text-ink font-tech tracking-tighter">
                FAST
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-ink/60 mt-1 font-tech">
                Performance
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl font-black text-accent font-tech tracking-tighter">
                FINE
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-ink/60 mt-1 font-tech">
                Aesthetics
              </p>
            </div>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        colSpan={1}
        rowSpan={2}
        className="p-0 border-0 overflow-hidden min-h-[280px] md:min-h-[200px]"
      >
        <button
          type="button"
          aria-label="View full photo of Aaron"
          className="relative h-full w-full overflow-hidden group text-left"
          onClick={onExpandImage}
        >
          <img
            src={me}
            alt="Aaron"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <p className="text-[11px] uppercase tracking-[0.35em] font-black text-accent mb-2 font-tech">
              View photo
            </p>
            <p className="text-lg md:text-xl font-black text-ink tracking-tight">Aaron</p>
          </div>
        </button>
      </BentoCard>

      <BentoCard colSpan={1} rowSpan={1} theme="glass" className="px-6 py-6 md:px-6">
        <div className="flex flex-col h-full justify-center items-center text-center">
          <p className="text-4xl md:text-5xl lg:text-6xl font-black text-accent tracking-tighter font-tech leading-none">
            {experience || "4+"}
          </p>
          <p className="text-[11px] uppercase tracking-widest font-bold text-ink/60 mt-2 font-tech">
            Years Exp.
          </p>
        </div>
      </BentoCard>

      <BentoCard colSpan={1} rowSpan={1} theme="accent" className="px-6 py-6">
        <div className="h-full flex flex-col justify-center gap-2">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-black opacity-70 font-tech">
            Tech
          </h4>
          <p className="text-sm md:text-base font-black leading-tight tracking-tight">
            Bleeding edge.
          </p>
        </div>
      </BentoCard>

      <BentoCard colSpan={2} rowSpan={1} theme="dark" className="px-6 py-6">
        <div className="h-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-black text-ink/60 font-tech">
              Speed
            </h4>
            <p className="text-lg md:text-xl font-black leading-tight tracking-tight text-ink/90">
              Precision enthusiast.
            </p>
          </div>
          <dl className="flex gap-6 font-tech">
            {[
              ["<100ms", "Interaction"],
              ["60fps", "Motion"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-[11px] uppercase tracking-[0.25em] text-ink/60 mt-1">{label}</dt>
                <dd className="text-xl md:text-2xl font-black text-accent tracking-tighter">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </BentoCard>

      <BentoCard colSpan={2} theme="glass" className="px-6 py-6">
        <div className="h-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg md:text-xl font-black tracking-tight">Curated Engineering</h3>
            <p className="text-sm text-ink/70 max-w-xs">
              Platforms, systems and tooling — shipped end to end.
            </p>
          </div>
          <Link
            to="/work"
            className="group/cta inline-flex items-center gap-3 self-start sm:self-auto min-h-11 rounded-full border border-accent/40 px-5 text-xs font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-canvas transition-colors font-tech"
          >
            View Case Studies
            <HiArrowRight aria-hidden="true" className="transition-transform group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </BentoCard>
    </>
  );
}

/**
 * The real, accessible bento — the destination the 3D box opens into.
 * Same content and styling as the original Synergy section.
 */
const SynergyGrid = forwardRef<HTMLDivElement, SynergyGridProps>(
  ({ experience, onExpandImage, selfReveal = true }, ref) => {
    const cards = renderCards(experience, onExpandImage);

    return (
      <div ref={ref} className="max-w-7xl mx-auto w-full h-full flex flex-col">
        <div
          data-synergy-head
          className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 md:mb-4 text-ink">
              THE <span className="text-accent">SYNERGY</span>
            </h2>
            <p className="text-xs md:text-sm text-ink/60 uppercase tracking-widest font-bold font-tech">
              Design & Engineering: The Perfect Pairing
            </p>
          </div>
          <Link
            to="/work"
            className="group flex items-center gap-3 text-ink font-bold uppercase tracking-widest text-xs font-tech min-h-11"
          >
            Explore Work
            <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center group-hover:bg-ink group-hover:text-canvas group-focus-visible:bg-ink group-focus-visible:text-canvas transition-colors">
              <HiArrowRight className="text-lg" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {selfReveal ? (
          <BentoGrid className={GRID_CLASSES}>{cards}</BentoGrid>
        ) : (
          <div
            data-synergy-grid
            className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto w-full ${GRID_CLASSES}`}
          >
            {cards}
          </div>
        )}
      </div>
    );
  },
);

SynergyGrid.displayName = "SynergyGrid";
export default SynergyGrid;
