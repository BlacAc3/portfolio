import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const socials = [
  { href: "https://github.com/blacac3", label: "GitHub", Icon: FaGithub },
  { href: "https://linkedin.com/in/aaron-ezeala", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://twitter.com/blacac3_dev", label: "Twitter / X", Icon: FaTwitter },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-ink/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-ink transition-colors hover:text-accent"
          >
            Blacac3<span className="text-accent">.</span>
          </Link>
          <p className="mt-1 text-sm text-ink/60">
            © {currentYear} Aaron Ezeala. Designed &amp; engineered in-house.
          </p>
        </div>

        <ul className="flex items-center gap-2" aria-label="Social profiles">
          {socials.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
              >
                <Icon className="text-lg" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
