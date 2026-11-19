import { useEffect, useRef, useState } from "react";
import { ROSSO } from "./chapters";
import { journeyLoad } from "./loading";

/**
 * A rev counter over the stage while the drive loads. The needle follows real
 * progress (the scene's code, then each model file, then the shader warm-up),
 * creeping between steps so it never sits still. When the scene is ready the
 * needle blips to the redline and the gauge fades out.
 */

const CX = 100;
const CY = 104;
const R = 76;
/** Needle angle from straight up, clockwise: 0 rpm to 9,000 rpm. */
const A0 = -135;
const A1 = 135;
const REDLINE = 7.5 / 9;

const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};
const angleAt = (k: number) => A0 + (A1 - A0) * k;
const arc = (k0: number, k1: number, r: number) => {
  const a = polar(angleAt(k0), r);
  const b = polar(angleAt(k1), r);
  const large = (k1 - k0) * (A1 - A0) > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

/** Where progress should be, and how far it may creep while waiting. */
const target = () => {
  const s = journeyLoad.get();
  if (s.ready) return { to: 1, ceil: 1 };
  if (!s.chunk) return { to: 0.03, ceil: 0.08 };
  // Files done: hold short of the end while the shaders compile.
  if (s.total && s.loaded >= s.total) return { to: 0.92, ceil: 0.97 };
  // Bytes where the server reports sizes, else whole files.
  const done = s.bytesTotal ? s.bytes / s.bytesTotal : s.total ? s.loaded / s.total : 0;
  const step = s.bytesTotal ? 0.04 : s.total ? 0.82 / s.total : 0.06;
  const to = 0.08 + 0.82 * Math.min(1, done);
  return { to, ceil: Math.min(0.92, to + step * 0.85) };
};

const TICKS = Array.from({ length: 19 }, (_, i) => i / 18);

export default function JourneyLoader() {
  const [gone, setGone] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const needle = useRef<SVGGElement>(null);
  const sweep = useRef<SVGPathElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let shown = 0;
    let raf = 0;
    let last = performance.now();
    let readyAt = 0;
    let lastPct = -1;
    // The percentage is written here, not by React, so the two never fight.
    if (pct.current) pct.current.textContent = "0%";
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { to, ceil } = target();
      const ready = journeyLoad.get().ready;
      // Catch up quickly to real progress, then creep toward the next step.
      if (shown < to) shown += (to - shown) * (1 - Math.exp(-dt * (ready ? 10 : 6)));
      else if (shown < ceil) shown += (ceil - shown) * (1 - Math.exp(-dt * 0.5));
      const k = Math.min(1, shown);
      needle.current?.setAttribute("transform", `rotate(${angleAt(k).toFixed(2)} ${CX} ${CY})`);
      sweep.current?.setAttribute("d", arc(0, Math.max(0.001, k), R - 9));
      const p = Math.round(k * 100);
      if (p !== lastPct && pct.current) {
        lastPct = p;
        pct.current.textContent = `${p}%`;
        box.current?.setAttribute("aria-valuenow", String(p));
      }
      if (ready && k > 0.995) {
        readyAt ||= now;
        // A beat on the redline, then fade out.
        if (now - readyAt > 160 && box.current) box.current.dataset.done = "";
        if (now - readyAt > 900) return setGone(true);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;
  return (
    <div
      ref={box}
      role="progressbar"
      aria-label="Loading the 3D drive"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="absolute inset-0 z-30 grid place-items-center bg-canvas transition-[opacity,filter] duration-700 ease-out data-[done]:pointer-events-none data-[done]:opacity-0 data-[done]:blur-md"
    >
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 170" className="w-[min(15rem,62vw)] overflow-visible" aria-hidden="true">
          {/* Dial */}
          <path d={arc(0, 1, R)} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/20" />
          <path d={arc(REDLINE, 1, R)} fill="none" stroke={ROSSO} strokeWidth="3" />
          <path ref={sweep} d={arc(0, 0.001, R - 9)} fill="none" stroke={ROSSO} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          {TICKS.map((k, i) => {
            const major = i % 2 === 0;
            const a = polar(angleAt(k), R - 1);
            const b = polar(angleAt(k), R - (major ? 9 : 5));
            return (
              <line
                key={k}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={k >= REDLINE - 1e-6 ? ROSSO : "currentColor"}
                strokeWidth={major ? 2 : 1}
                className="text-ink/55"
              />
            );
          })}
          {TICKS.filter((_, i) => i % 2 === 0).map((k, i) => {
            const p = polar(angleAt(k), R - 21);
            return (
              <text
                key={k}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-ink/60 font-tech text-[10px] font-bold"
                fill={k >= REDLINE ? ROSSO : undefined}
              >
                {i}
              </text>
            );
          })}
          <text x={CX} y={CY + 30} textAnchor="middle" className="fill-ink/40 font-tech text-[7px] tracking-[0.2em]">
            ×1000 RPM
          </text>
          {/* Needle */}
          <g ref={needle} transform={`rotate(${A0} ${CX} ${CY})`}>
            <line x1={CX} y1={CY + 10} x2={CX} y2={CY - R + 6} stroke={ROSSO} strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle cx={CX} cy={CY} r="6" className="fill-ink" />
        </svg>
        <p className="-mt-2 font-tech text-xs font-bold text-ink/60">
          Warming up the engine <span ref={pct} className="ml-1 inline-block w-[4ch] text-left text-accent" />
        </p>
      </div>
    </div>
  );
}
