import { useState, useEffect, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jumpTo } from "../../lib/jump";
import { RiMenu4Line, RiCloseLine } from "react-icons/ri";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/work" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const MOBILE_MENU_ID = "mobile-menu";

/** True when the keystroke is meant for a form control / editable region. */
const isTypingTarget = (el: Element | null) => {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (el as HTMLElement).isContentEditable
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Vim motions (h / l) for route navigation — ignored while typing or with modifiers.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (isTypingTarget(document.activeElement)) return;
      if (e.key !== "h" && e.key !== "l") return;

      const currentIndex = navLinks.findIndex(
        (link) => link.href === location.pathname
      );
      const validIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        e.key === "h"
          ? (validIndex - 1 + navLinks.length) % navLinks.length
          : (validIndex + 1) % navLinks.length;
      navigate(navLinks[nextIndex].href);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [location.pathname, navigate]);

  // Already home? Cut straight back to the top (blur veil) instead of
  // scrolling back through the whole bento story.
  const homeJump = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (href !== "/" || location.pathname !== "/") return;
    e.preventDefault();
    setIsMobileMenuOpen(false);
    jumpTo(0);
  };

  // Scroll to top and close the mobile menu on route change.
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Mobile menu: Escape closes it, page behind it doesn't scroll.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-5 focus:py-3 focus:rounded-full focus:bg-chocolate-accent focus:text-chocolate-dark focus:font-bold focus:text-sm"
      >
        Skip to content
      </a>

      <motion.nav
        aria-label="Primary"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-6 ${
          isScrolled ? "py-3" : "py-6"
        }`}
      >
        {/* Fade behind the floating pill so scrolled content never collides
            with the nav in the gap above it. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150%] bg-gradient-to-b from-chocolate-dark via-chocolate-dark/75 to-transparent transition-opacity duration-500 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center justify-between px-6 md:px-8 py-3 border ${
            isScrolled
              ? "bg-chocolate-dark/60 backdrop-blur-xl border-white/10"
              : "bg-transparent border-transparent"
          }`}
        >
          <Link
            to="/"
            aria-label="Blacac3 — home"
            onClick={homeJump("/")}
            className="text-xl md:text-2xl font-black tracking-tighter text-white hover:text-chocolate-accent transition-colors"
          >
            Blacac3<span className="text-chocolate-accent">.</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <ul className="flex items-center gap-8 lg:gap-12">
              {navLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={homeJump(link.href)}
                      className={`text-[11px] lg:text-xs uppercase tracking-[0.2em] font-bold transition-colors relative group py-2 ${
                        active
                          ? "text-chocolate-accent"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {link.name}
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0 left-0 h-[2px] bg-chocolate-accent transition-all duration-300 ${
                          active ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/contact"
              className="px-6 py-2.5 bg-white text-chocolate-dark rounded-full text-xs uppercase tracking-widest font-black hover:bg-chocolate-accent transition-colors"
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile menu toggle — 44px touch target */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden -mr-2 w-11 h-11 flex items-center justify-center text-white"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls={MOBILE_MENU_ID}
          >
            {isMobileMenuOpen ? (
              <RiCloseLine size={28} aria-hidden="true" />
            ) : (
              <RiMenu4Line size={28} aria-hidden="true" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id={MOBILE_MENU_ID}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-chocolate-dark md:hidden flex flex-col items-center justify-center"
          >
            <ul className="flex flex-col items-center gap-8">
              {navLinks.map((link) => {
                const active = location.pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={homeJump(link.href)}
                      className={`text-4xl font-black uppercase tracking-tighter transition-colors ${
                        active
                          ? "text-chocolate-accent"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/contact"
                  className="mt-6 inline-block px-10 py-4 bg-white text-chocolate-dark rounded-full text-sm uppercase tracking-widest font-black"
                >
                  Hire Me
                </Link>
              </li>
            </ul>

            <div
              aria-hidden="true"
              className="absolute bottom-12 left-0 w-full px-8 flex justify-between items-end text-white/40"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.5em]">
                Blacac3 Portfolio
              </p>
              <p className="text-[11px] font-black uppercase tracking-[0.5em]">
                {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
