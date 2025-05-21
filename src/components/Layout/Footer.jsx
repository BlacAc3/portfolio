import React from "react";
import { motion } from "framer-motion";
import { useCursor } from "../../contexts/CursorContext";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-chocolate-dark border-t border-chocolate-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            className="mb-4 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              className="text-xl font-bold text-chocolate-accent"
              whileHover={{ scale: 1.05 }}
            >
              Blacac3 Portfolio
            </motion.span>
            <p className="text-chocolate-light-accent mt-1">
              © {currentYear} Blacac3 Developer. All rights reserved.
            </p>
          </motion.div>

          <motion.div
            className="flex space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.a
              href="https://github.com/blacac3"
              target="_blank"
              className="text-chocolate-light-accent hover:text-chocolate-accent transition"
              whileHover={{ y: -5 }}
            >
              <FaGithub className="text-xl" />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/aaron-ezeala"
              target="_blank"
              className="text-chocolate-light-accent hover:text-chocolate-accent transition"
              whileHover={{ y: -5 }}
            >
              <FaLinkedin className="text-xl" />
            </motion.a>
            <motion.a
              href="https://twitter.com/blacac3_dev"
              target="_blank"
              className="text-chocolate-light-accent hover:text-chocolate-accent transition"
              whileHover={{ y: -5 }}
            >
              <FaTwitter className="text-xl" />
            </motion.a>
            {/* <motion.a
              href="#"
              className="text-chocolate-light-accent hover:text-chocolate-accent transition"
              whileHover={{ y: -5 }}
            >
              <FaInstagram className="text-xl" />
            </motion.a> */}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
