import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

const HeroSection = () => {
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.to(titleRef.current, {
      backgroundPosition: "0% center",
      duration: 3.5,
      ease: "steps(40)",
    });
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden hero-gradient"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-chocolate-dark"></div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-8"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-chocolate-accent pulse">
            <img
              src="public/me.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-chocolate-light-accent">
          <span className="text-chocolate-accent typewriter inline-block">
            Hi, I'm <span className="text-chocolate-light-accent">Aaron</span>
          </span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-chocolate-light-accent">
          Full Stack
          <span className="text-chocolate-accent ml-2">Software Engineer</span>
        </h2>

        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-chocolate-light-accent">
          I build exceptional digital experiences with clean, efficient code and
          innovative solutions.
        </p>

        <div className="flex justify-center space-x-4">
          <motion.a
            href="#projects"
            className="px-6 py-3 bg-chocolate-accent text-chocolate-dark font-medium rounded-lg hover:bg-opacity-90 transition shadow-lg shadow-chocolate-accent/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
          </motion.a>
          <motion.a
            href="#contact"
            className="px-6 py-3 border-2 border-chocolate-accent text-chocolate-light-accent font-medium rounded-lg hover:bg-chocolate-accent hover:text-chocolate-dark transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Me
          </motion.a>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <a href="#about" className="text-chocolate-accent">
          <i className="fas fa-chevron-down text-2xl"></i>
        </a>
      </motion.div>
    </section>
  );
};

export default HeroSection;
