import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Work", href: "#projects" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
        isScrolled ? "py-3" : "py-6"
      }`}
    >
      <div className={`max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center justify-between px-8 ${
        isScrolled 
          ? "bg-white/5 backdrop-blur-xl border border-white/10 py-3 shadow-2xl" 
          : "bg-transparent py-0"
      }`}>
        <div className="flex-shrink-0">
          <a href="#home" className="text-2xl font-black tracking-tighter text-white hover:text-chocolate-accent transition-colors">
            AARON<span className="opacity-40">.</span>
          </a>
        </div>
        
        <div className="flex items-center space-x-12">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 hover:text-white transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-chocolate-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          
          <a
            href="#contact"
            className="px-6 py-2 bg-white text-black rounded-full text-xs uppercase tracking-widest font-black hover:scale-105 transition-transform"
          >
            Hire Me
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
