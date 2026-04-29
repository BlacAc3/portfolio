import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { RiMenu4Line, RiCloseLine } from "react-icons/ri";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure scroll to top on route change and close mobile menu
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-6 py-4 ${
          isScrolled ? "py-3" : "py-6"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all border-white/0 duration-500 flex items-center justify-between px-6 md:px-8 ${
            isScrolled
              ? "bg-white/5 backdrop-blur-xl border border-white/1 py-3 "
              : "bg-transparent py-3"
          }`}
        >
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl md:text-2xl font-black tracking-tighter text-white hover:text-chocolate-accent transition-colors"
            >
              Blacac3<span className="opacity-40">.</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-[10px] lg:text-xs uppercase tracking-[0.2em] font-bold transition-all relative group ${
                  location.pathname === link.href
                    ? "text-chocolate-accent"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-chocolate-accent transition-all duration-300 ${
                    location.pathname === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}

            <Link
              to="/contact"
              className="px-6 py-2 bg-white text-black rounded-full text-xs uppercase tracking-widest font-black hover:scale-105 transition-transform"
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <RiCloseLine size={28} />
            ) : (
              <RiMenu4Line size={28} />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-chocolate-dark md:hidden flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-3xl font-black uppercase tracking-tighter transition-all ${
                    location.pathname === link.href
                      ? "text-chocolate-accent"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="mt-8 px-10 py-4 bg-white text-black rounded-full text-sm uppercase tracking-widest font-black"
              >
                Hire Me
              </Link>
            </div>
            
            <div className="absolute bottom-12 left-0 w-full px-8 flex justify-between items-end opacity-20">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Blacac3 Portfolio</p>
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
