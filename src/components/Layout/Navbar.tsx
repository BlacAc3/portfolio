import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Work", href: "/work" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
        isScrolled ? "py-3" : "py-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all border-white/0 duration-500 flex items-center justify-between px-8 ${
          isScrolled
            ? "bg-white/5 backdrop-blur-xl border border-white/1 py-3 "
            : "bg-transparent py-3"
        }`}
      >
        <div className="flex-shrink-0">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-white hover:text-chocolate-accent transition-colors"
          >
            Blacac3<span className="opacity-40">.</span>
          </Link>
        </div>

        <div className="flex items-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-all relative group ${
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
      </div>
    </motion.nav>
  );
};

export default Navbar;
