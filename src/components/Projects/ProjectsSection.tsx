import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import jobApi from "../../assets/jobApi.webp";

type Visual = "schema" | "rbac" | "image" | "terminal" | "mesh" | "site";

interface Project {
  id: string;
  title: string;
  description: string;
  period: string;
  role: string;
  tech: string[];
  visual: Visual;
  image?: string;
  url?: string;
}

const projectsData: Project[] = [
  {
    id: "1",
    title: "Educational Management System",
    description:
      "Architected the backend and spearheaded frontend integration for a comprehensive gamified EMS using Django and React. Designed a complex relational database schema mapping intricate many-to-many relationships.",
    period: "Aug 2025 — Jun 2026",
    role: "Full Stack Engineer · IYF Studios",
    tech: ["Django", "React", "PostgreSQL"],
    visual: "schema",
  },
  {
    id: "2",
    title: "Membership Platform",
    description:
      "Engineered a secure, highly scalable membership platform using Django. Designed robust user provisioning workflows, implemented strict Role-Based Access Control (RBAC), and managed the database architecture for complex subscription lifecycles.",
    period: "Jan 2026 — Mar 2026",
    role: "Backend Engineer · Heckerbella",
    tech: ["Django", "RBAC", "PostgreSQL"],
    visual: "rbac",
  },
  {
    id: "3",
    title: "Job / Recruitment Platform",
    description:
      "Designed a multi-tenant backend utilizing Django and PostgreSQL. Engineered a highly concurrent job queue system using Celery and Redis for asynchronous processing. Integrated sub-millisecond full-text search capabilities.",
    period: "Aug 2024 — Mar 2025",
    role: "Backend Engineer · Heckerbella",
    tech: ["Django", "PostgreSQL", "Celery", "Redis"],
    visual: "image",
    image: jobApi,
  },
  {
    id: "4",
    title: "Linux Workstation",
    description:
      "Maintain a custom Arch-based (Hyprland) development environment. Proficient in shell scripting and system resource management.",
    period: "Ongoing",
    role: "Personal Project",
    tech: ["Arch Linux", "Hyprland", "Shell Scripting"],
    visual: "terminal",
  },
  {
    id: "5",
    title: "libp2p Decentralized Protocols",
    description:
      "Active interest in the libp2p ecosystem and decentralized network protocols.",
    period: "Ongoing",
    role: "Open Source",
    tech: ["libp2p", "Decentralized Networks"],
    visual: "mesh",
  },
  {
    id: "6",
    title: "Ibukun Odedele — Portfolio",
    description:
      "Designed and built a portfolio site for a Lagos-based content creator and videographer, giving her work and her café lifestyle magazine, One Sip at a Time, a home of their own.",
    period: "2026",
    role: "Creative Developer · Client Work",
    tech: ["React", "Vercel"],
    visual: "site",
    url: "https://ibukun-odedele.vercel.app/",
  },
  {
    id: "7",
    title: "Glory Bamgboye — Portfolio",
    description:
      "Designed and built a personal site for a brand and content storyteller, presenting her story and work in a clean, editorial layout.",
    period: "2026",
    role: "Creative Developer · Client Work",
    tech: ["React", "Vercel"],
    visual: "site",
    url: "https://oh-gloria.vercel.app/",
  },
  {
    id: "8",
    title: "Emida Properties",
    description:
      "Designed and built the website for Emida Properties Ltd., a real estate company, presenting the brand and its property offerings online.",
    period: "2026",
    role: "Creative Developer · Client Work",
    tech: ["React", "Cloudflare"],
    visual: "site",
    url: "https://emida.ng",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Covers — drawn, not faked: each one diagrams what the project is.   */
/* ------------------------------------------------------------------ */
const gold = "var(--color-accent)";

const SchemaCover = () => {
  const tables = [
    { x: 40, y: 50, w: 120, rows: 4, label: "students" },
    { x: 250, y: 30, w: 120, rows: 3, label: "courses" },
    { x: 250, y: 170, w: 120, rows: 3, label: "enrolments" },
    { x: 440, y: 90, w: 110, rows: 4, label: "badges" },
  ];
  return (
    <svg viewBox="0 0 590 300" className="h-full w-full">
      {[
        "M160 80 C 205 80, 205 200, 250 200",
        "M310 100 L 310 170",
        "M370 200 C 405 200, 405 120, 440 120",
        "M160 110 C 210 110, 200 60, 250 60",
      ].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
         
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="4 5"
          className="cover-flow" style={{ stroke: gold }}
        />
      ))}
      {tables.map((t) => (
        <g key={t.label}>
          <rect x={t.x} y={t.y} width={t.w} height={28 + t.rows * 18} rx="10" style={{ fill: "var(--color-canvas)", stroke: "rgb(var(--ink-rgb)/0.12)" }} />
          <rect x={t.x} y={t.y} width={t.w} height="26" rx="10" style={{ fill: "rgb(var(--accent-rgb)/0.14)" }} />
          <text x={t.x + 12} y={t.y + 17} fontSize="10" fontFamily="Space Grotesk, monospace" letterSpacing="1.5" style={{ fill: gold }}>
            {t.label.toUpperCase()}
          </text>
          {Array.from({ length: t.rows }).map((_, r) => (
            <rect key={r} x={t.x + 12} y={t.y + 36 + r * 18} width={t.w * (0.45 + ((r * 37) % 40) / 100)} height="6" rx="3" style={{ fill: "rgb(var(--ink-rgb)/0.14)" }} />
          ))}
        </g>
      ))}
    </svg>
  );
};

const RbacCover = () => (
  <svg viewBox="0 0 590 300" className="h-full w-full">
    {[120, 88, 56].map((r, i) => (
      <circle key={r} cx="295" cy="150" r={r} fill="none" strokeOpacity={0.2 + i * 0.22} strokeWidth="1.2" className="cover-spin" style={{ stroke: gold, animationDuration: `${40 - i * 10}s`, transformOrigin: "295px 150px" }} strokeDasharray={i === 0 ? "2 8" : i === 1 ? "14 6" : undefined} />
    ))}
    <path d="M295 118 l26 10 v18 c0 18 -12 30 -26 36 c-14 -6 -26 -18 -26 -36 v-18 z" strokeWidth="1.4" style={{ fill: "rgb(var(--accent-rgb)/0.16)", stroke: gold }} />
    {[
      ["ADMIN", 70, 70],
      ["MEMBER", 450, 80],
      ["BILLING", 80, 230],
      ["GUEST", 455, 225],
    ].map(([l, x, y]) => (
      <g key={l as string}>
        <rect x={x as number} y={(y as number) - 14} width="78" height="24" rx="12" style={{ fill: "var(--color-canvas)", stroke: "rgb(var(--ink-rgb)/0.14)" }} />
        <text x={(x as number) + 39} y={(y as number) + 2} textAnchor="middle" fontSize="9" fontFamily="Space Grotesk, monospace" letterSpacing="1.5" style={{ fill: "rgb(var(--ink-rgb)/0.7)" }}>
          {l}
        </text>
      </g>
    ))}
  </svg>
);

const TerminalCover = () => (
  <div className="flex h-full w-full flex-col rounded-2xl border border-ink/10 bg-[#0d0c0b] font-tech text-[11px] leading-6 text-ink/60 sm:text-xs">
    <div className="flex items-center gap-1.5 border-b border-ink/10 px-4 py-2.5">
      <span className="h-2 w-2 rounded-full bg-ink/20" />
      <span className="h-2 w-2 rounded-full bg-ink/20" />
      <span className="h-2 w-2 rounded-full bg-accent/70" />
      <span className="ml-3 text-[10px] tracking-[0.3em] text-ink/35">~/.config/hypr</span>
    </div>
    <div className="flex-1 overflow-hidden px-4 py-3">
      <p><span className="text-accent">❯</span> uname -sr</p>
      <p className="text-ink/40">Linux 6.x-arch</p>
      <p><span className="text-accent">❯</span> hyprctl workspaces | rg id</p>
      <p className="text-ink/40">workspace ID 1 (code) · 2 (web) · 3 (term)</p>
      <p><span className="text-accent">❯</span> ./sync-dotfiles.sh --dry-run</p>
      <p className="text-ink/40">✓ 42 files in sync</p>
      <p>
        <span className="text-accent">❯</span>{" "}
        <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-accent/80" />
      </p>
    </div>
  </div>
);

const MeshCover = () => {
  const nodes: [number, number][] = [
    [90, 80], [200, 50], [320, 95], [470, 60], [130, 200], [260, 180], [390, 210], [510, 170], [300, 260],
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [5, 6], [6, 7], [3, 7], [5, 8], [6, 8], [1, 5],
  ];
  return (
    <svg viewBox="0 0 590 300" className="h-full w-full">
      {links.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" className="cover-flow" style={{ stroke: gold }} />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" style={{ fill: "rgb(var(--accent-rgb)/0.08)" }} />
          <circle cx={x} cy={y} r="5" strokeOpacity="0.8" style={{ fill: i === 5 ? gold : "var(--color-raised)", stroke: gold }} />
        </g>
      ))}
    </svg>
  );
};

const hostOf = (url?: string) => url?.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** Live, scaled-down iframe of a real site. Click to zoom into the full site. */
const SiteCover = ({ url, title }: { url?: string; title: string }) => {
  const boxRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(0.4);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1280));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!url) return null;
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = from;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const pad = vw < 640 ? 0 : 24;

  return (
    <>
      <button
        ref={boxRef}
        type="button"
        onClick={() => {
          setFrom(boxRef.current?.getBoundingClientRect() ?? null);
          setOpen(true);
        }}
        aria-label={`Open live preview of ${title}`}
        className="group/site relative flex h-full w-full cursor-zoom-in flex-col overflow-hidden rounded-2xl border border-ink/10 bg-[#0d0c0b] text-left"
      >
        <div className="flex items-center gap-1.5 border-b border-ink/10 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          <span className="ml-3 truncate rounded-full bg-ink/5 px-3 py-0.5 font-tech text-[10px] tracking-[0.15em] text-ink/45">
            {hostOf(url)}
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden bg-black">
          <iframe
            src={url}
            title={`${title} preview`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            style={{ width: 1280, height: 900, transform: `scale(${scale})`, transformOrigin: "top left" }}
            className="pointer-events-none absolute left-0 top-0 border-0"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-canvas/85 px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.25em] text-ink opacity-0 backdrop-blur transition-opacity group-hover/site:opacity-100 group-focus-visible/site:opacity-100">
            Click to explore ↗
          </span>
        </div>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && r && (
            <>
              <motion.div
                key="scrim"
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="panel"
                role="dialog"
                aria-modal="true"
                aria-label={`${title} live site`}
                data-lenis-prevent
                className="fixed z-[201] flex flex-col overflow-hidden border border-ink/15 bg-[#0d0c0b] shadow-2xl"
                initial={{ left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 16 }}
                animate={{ left: pad, top: pad, width: vw - pad * 2, height: vh - pad * 2, borderRadius: pad ? 20 : 0 }}
                exit={{ left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 16 }}
                transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex shrink-0 items-center gap-3 border-b border-ink/10 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close preview"
                    className="grid h-7 w-7 place-items-center rounded-full bg-ink/10 text-ink transition-colors hover:bg-accent hover:text-canvas"
                  >
                    ✕
                  </button>
                  <span className="min-w-0 flex-1 truncate rounded-full bg-ink/5 px-4 py-1 font-tech text-[11px] tracking-[0.15em] text-ink/60">
                    {hostOf(url)}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-tech text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:underline"
                  >
                    New tab ↗
                  </a>
                </div>
                <iframe src={url} title={`${title} live site`} className="h-full w-full flex-1 border-0 bg-white" />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

const Cover = ({ project }: { project: Project }) => {
  if (project.visual === "image" && project.image) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink/10 bg-black">
        <div className="flex items-center gap-1.5 border-b border-ink/10 bg-[#0d0c0b] px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
          <span className="h-2 w-2 rounded-full bg-ink/20" />
        </div>
        <img
          src={project.image}
          alt={`${project.title} interface`}
          loading="lazy"
          className="h-full w-full object-cover object-top opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
        />
      </div>
    );
  }
  const inner =
    project.visual === "site" ? (
      <SiteCover url={project.url} title={project.title} />
    ) : project.visual === "schema" ? (
      <SchemaCover />
    ) : project.visual === "rbac" ? (
      <RbacCover />
    ) : project.visual === "mesh" ? (
      <MeshCover />
    ) : (
      <TerminalCover />
    );
  return <div className="flex h-full w-full items-center justify-center">{inner}</div>;
};

/* ------------------------------------------------------------------ */
/* Card — sticks, then recedes as the next one slides over it.         */
/* ------------------------------------------------------------------ */
const Card = ({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) => {
  const reduced = useReducedMotion();
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - index) * 0.035]);
  const dim = useTransform(progress, [start, start + 1 / total], [0, 0.45]);

  return (
    <li
      className="md:sticky md:h-[100svh] md:pt-[14vh]"
      style={{ top: 0 }}
    >
      <motion.article
        aria-labelledby={`project-${project.id}`}
        style={reduced ? undefined : { scale, top: `${index * 14}px` }}
        className="group relative origin-top overflow-hidden rounded-[28px] border border-ink/10 bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] md:h-[72svh]"
      >
        {/* sheen */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgb(var(--ink-rgb)/0.05),transparent_40%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative grid h-full gap-8 p-6 sm:p-8 md:grid-cols-12 md:gap-10 md:p-12">
          <div className="flex flex-col md:col-span-5">
            <div className="flex items-center gap-4 font-tech text-[10px] font-bold uppercase tracking-[0.4em] text-ink/45">
              <span className="text-accent">{pad(index + 1)}</span>
              <span className="h-px flex-1 bg-ink/10" />
              <span>{project.period}</span>
            </div>
            <h3
              id={`project-${project.id}`}
              className="mt-8 font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-black leading-[0.95] tracking-[-0.035em] text-ink md:mt-10"
            >
              {project.title}
            </h3>
            <p className="mt-4 font-tech text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              {project.role}
            </p>
            <p className="mt-6 max-w-[48ch] text-[0.95rem] leading-relaxed text-ink/70">
              {project.description}
            </p>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 font-tech text-[11px] font-bold uppercase tracking-[0.25em] text-ink underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
              >
                Visit live site <span aria-hidden="true">↗</span>
              </a>
            )}
            <ul aria-label="Technologies" className="mt-auto flex flex-wrap gap-2 pt-8">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-ink/12 px-3.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-ink/70"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-ink/5 bg-canvas/60 p-4 sm:min-h-[280px] md:col-span-7 md:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgb(var(--accent-rgb)/0.12),transparent_60%)]" />
            <div className="relative h-full">
              <Cover project={project} />
            </div>
          </div>
        </div>

        {/* Receding veil as the next card covers this one */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: dim }}
            className="pointer-events-none absolute inset-0 hidden bg-canvas md:block"
          />
        )}
      </motion.article>
    </li>
  );
};

const ProjectsSection = () => {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="projects" className="px-4 pb-10 sm:px-6 lg:px-8">
      <h2 className="sr-only">Selected projects</h2>
      <ol
        ref={ref}
        className="mx-auto flex max-w-6xl list-none flex-col gap-6 p-0 md:gap-0"
      >
        {projectsData.map((project, i) => (
          <Card
            key={project.id}
            project={project}
            index={i}
            total={projectsData.length}
            progress={scrollYProgress}
          />
        ))}
      </ol>
    </section>
  );
};

export default ProjectsSection;
