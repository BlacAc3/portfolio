import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { hasWebGL, usePrefersReducedMotion } from "../../hooks/useMediaQuery";

export interface ModelProps {
  /** On screen — keep the render loop running. */
  active: boolean;
  /** prefers-reduced-motion: draw one still frame, no idle animation. */
  reduced: boolean;
}

interface ModelStageProps {
  /** Renders the (lazy) model. Only called once the stage nears the viewport. */
  children: (props: ModelProps) => ReactNode;
  /** Shown without WebGL, and while the 3D chunk downloads. */
  fallback?: ReactNode;
  className?: string;
  /** Accessible description of what the decorative model depicts. */
  label: string;
}

/**
 * Wrapper for the page-level 3D models.
 *  - The model (and three.js) is only mounted when the stage comes within
 *    ~300px of the viewport, so text paints first.
 *  - Off screen, `active` goes false and the model stops its frame loop.
 *  - No WebGL → the static fallback stays.
 * The canvas is decorative; the label gives screen readers the gist.
 */
const ModelStage = ({ children, fallback, className = "", label }: ModelStageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !webgl) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          near.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    const seen = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.01,
    });
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, [webgl]);

  return (
    <div ref={ref} role="img" aria-label={label} className={`relative ${className}`}>
      <div aria-hidden="true" className="stage-glow pointer-events-none absolute inset-0" />
      {webgl && mounted ? (
        <Suspense fallback={fallback ?? null}>{children({ active, reduced })}</Suspense>
      ) : (
        fallback ?? null
      )}
    </div>
  );
};

export default ModelStage;
