import { Link } from "react-router-dom";
import { MODEL_CREDITS } from "../components/Journey/chapters";

const linkCls = "underline decoration-ink/25 underline-offset-2 hover:text-accent hover:decoration-accent";

/** CC BY 4.0 attribution for the 3D models in the About page's drive. */
const Credits = () => (
  <div className="min-h-[100dvh] pt-32">
    <article className="mx-auto max-w-3xl px-6 pb-24">
      <p className="font-tech text-[11px] font-bold uppercase tracking-[0.3em] text-accent md:text-xs">Credits</p>
      <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] md:text-6xl">3D models</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-ink/70">
        The drive on the{" "}
        <Link className={linkCls} to="/about">
          About page
        </Link>{" "}
        uses these models from Sketchfab, under{" "}
        <a className={linkCls} href="https://creativecommons.org/licenses/by/4.0/" rel="license noopener" target="_blank">
          Creative Commons Attribution 4.0
        </a>
        . Thank you to their authors.
      </p>

      <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        {MODEL_CREDITS.map((c) => (
          <li key={c.url} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <a className={`${linkCls} font-semibold text-ink`} href={c.url} target="_blank" rel="noopener">
              {c.title}
            </a>
            <span className="text-sm text-ink/60">
              by{" "}
              <a className={linkCls} href={c.authorUrl} target="_blank" rel="noopener">
                {c.author}
              </a>{" "}
              · CC BY 4.0
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-lg font-bold">Changes made</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        All models were optimised for the web (simplified meshes, compressed textures). Badges and lettering were
        removed from both Ferraris, the F12 also lost its plates and some small cabin parts and was repainted, and
        materials were restyled in the browser. The 812 is re-rigged for the exploded view, and its engine,
        transaxle and tyres are drawn in code.
      </p>

      <p className="mt-10 text-sm leading-relaxed text-ink/50">
        Ferrari and Ducati are trademarks of their respective owners. This site is not affiliated with or endorsed
        by either.
      </p>
    </article>
  </div>
);

export default Credits;
