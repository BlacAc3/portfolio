import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaMedium,
  FaDev,
} from "react-icons/fa";
import me from "../../public/me.webp";

const AboutSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const skills = [
    "Golang",
    "Go",
    "Gin",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Django",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "FastAPI",
  ];

  const socialLinks = [
    { icon: <FaGithub />, url: "https://github.com/blacac3" },
    { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/aaron-ezeala/" },
    { icon: <FaTwitter />, url: "https://twitter.com/blacac3_dev" },
    // { icon: <FaInstagram />, url: "" },
    // { icon: <FaMedium />, url: "#" },
    // { icon: <FaDev />, url: "#" },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 section-gradient">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-chocolate-light-accent">About</span>
          <span className="text-chocolate-accent"> Me</span>
        </motion.h2>

        <motion.div
          ref={ref}
          className="flex flex-col lg:flex-row items-center gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.div
            className="lg:w-1/3 flex justify-center"
            variants={itemVariants}
          >
            <motion.div
              className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-chocolate-accent"
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <img
                src={me}
                alt="About Me"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

          <motion.div className="lg:w-2/3" variants={itemVariants}>
            <motion.h3
              className="text-2xl font-semibold mb-4 text-chocolate-accent"
              variants={itemVariants}
            >
              Who am I?
            </motion.h3>
            <motion.p
              className="text-chocolate-light-accent mb-6"
              variants={itemVariants}
            >
              I'm a passionate Full Stack Software Engineer with over 3 years of
              experience in building web applications, Command Line Interfaces,
              REST APIs, backend services, and digital solutions. My journey in
              tech started when I was 15, and since then I've been obsessed with
              creating elegant solutions to complex problems.
            </motion.p>

            <motion.div className="mb-8" variants={itemVariants}>
              <h4 className="text-xl font-semibold mb-4 text-chocolate-light-accent">
                My Skills
              </h4>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    className="skill-badge px-4 py-2 rounded-full text-chocolate-light-accent"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#d4a76a",
                      color: "#1d1b1a",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              variants={itemVariants}
            >
              {/* <div className="flex-1">
                <h4 className="text-xl font-semibold mb-3 text-chocolate-light-accent">
                  Education
                </h4>
                <div className="pl-4 border-l-2 border-chocolate-accent">
                  <div className="mb-4">
                    <h5 className="font-medium text-chocolate-accent">
                      Bachelor of Arts in French Language
                    </h5>
                    <p className="text-chocolate-light-accent">
                      University of Lagos (2022 - present)
                    </p>
                  </div>
                </div>
              </div> */}

              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-3 text-chocolate-light-accent">
                  Experience
                </h4>
                <div className="pl-4 border-l-2 border-chocolate-accent">
                  <div className="mb-6">
                    <h5 className="font-medium text-chocolate-accent">
                      Backend Engineer
                    </h5>
                    <p className="text-chocolate-light-accent">
                      Techivate (2023)
                    </p>
                  </div>
                  <div className="mb-6">
                    <h5 className="font-medium text-chocolate-accent">
                      Python Developer(Django)
                    </h5>
                    <p className="text-chocolate-light-accent">
                      Jaa Africa (April 2025 - present)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="mt-8" variants={itemVariants}>
              <h4 className="text-xl font-semibold mb-4 text-chocolate-light-accent">
                Connect With Me
              </h4>
              <div className="flex space-x-6">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    className="social-icon text-2xl text-chocolate-light-accent hover:text-chocolate-accent"
                    whileHover={{ scale: 1.2, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
