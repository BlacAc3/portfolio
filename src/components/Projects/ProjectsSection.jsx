import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useCursor } from "../../contexts/CursorContext";
import ProjectCard from "./ProjectCard";

const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const filterButtons = [
    { name: "All", filter: "all" },
    { name: "Contributions", filter: "contributions" },
    { name: "Freelance", filter: "freelance" },
    { name: "Personal", filter: "personal" },
    { name: "Affiliations", filter: "affiliations" },
  ];

  // Sample project data
  const projects = [
    {
      id: 1,
      title: "React Performance Toolkit",
      description:
        "A set of tools and utilities to optimize React applications, reducing bundle size by 40% and improving render performance.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "contributions",
      tag: "Contribution",
      subTag: "Open Source",
      tagColor: "bg-chocolate-accent text-chocolate-dark",
      technologies: ["React", "Webpack", "Babel"],
      links: [
        { text: "View Project", url: "#" },
        { text: "GitHub", url: "#" },
      ],
    },
    {
      id: 2,
      title: "Luxury Watch Store",
      description:
        "A high-end e-commerce platform for luxury watches with AR try-on feature, integrated payment processing, and inventory management.",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      category: "freelance",
      tag: "Freelance",
      subTag: "E-commerce",
      tagColor: "bg-blue-500 text-white",
      technologies: ["Next.js", "Node.js", "Stripe", "AR.js"],
      links: [
        { text: "View Project", url: "#" },
        { text: "Case Study", url: "#" },
      ],
    },
    {
      id: 3,
      title: "FocusFlow",
      description:
        "A Pomodoro timer app with task management, analytics, and distraction blocking features to boost productivity.",
      image:
        "https://images.unsplash.com/photo-1555774698-0f77e70ac3f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "personal",
      tag: "Personal",
      subTag: "Productivity",
      tagColor: "bg-purple-500 text-white",
      technologies: ["Electron", "React", "IndexedDB", "D3.js"],
      links: [
        { text: "View Project", url: "#" },
        { text: "GitHub", url: "#" },
        { text: "Download", url: "#" },
      ],
    },
    {
      id: 4,
      title: "Cloud Migration Toolkit",
      description:
        "Developed as part of Google Cloud's partner program, this toolkit helps enterprises migrate legacy systems to cloud infrastructure.",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "affiliations",
      tag: "Affiliation",
      subTag: "Google",
      tagColor: "bg-green-500 text-white",
      technologies: ["GCP", "Terraform", "Python", "Kubernetes"],
      links: [
        { text: "View Project", url: "#" },
        { text: "Documentation", url: "#" },
      ],
    },
    {
      id: 5,
      title: "Firefox DevTools Extension",
      description:
        "Contributed to the Firefox DevTools extension API, enabling better debugging capabilities for web developers.",
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80",
      category: "contributions",
      tag: "Contribution",
      subTag: "Mozilla",
      tagColor: "bg-chocolate-accent text-chocolate-dark",
      technologies: ["JavaScript", "WebExtensions", "Firefox"],
      links: [
        { text: "View Project", url: "#" },
        { text: "GitHub", url: "#" },
      ],
    },
    {
      id: 6,
      title: "Telemedicine Platform",
      description:
        "A HIPAA-compliant telemedicine solution with video consultations, prescription management, and patient records.",
      image:
        "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      category: "freelance",
      tag: "Freelance",
      subTag: "Healthcare",
      tagColor: "bg-blue-500 text-white",
      technologies: ["React Native", "Node.js", "WebRTC", "MongoDB"],
      links: [
        { text: "Case Study", url: "#" },
        { text: "Testimonials", url: "#" },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-chocolate-dark"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 text-center section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-chocolate-light-accent">My</span>
          <span className="text-chocolate-accent"> Projects</span>
        </motion.h2>

        <motion.div
          className="mb-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {filterButtons.map((button, index) => (
              <motion.button
                key={index}
                type="button"
                className={`
                        px-4 py-2 text-sm font-medium
                        ${index === 0 ? "rounded-l-lg" : index === filterButtons.length - 1 ? "rounded-r-lg" : ""}
                        border border-chocolate-accent
                        ${activeFilter === button.filter ? "bg-chocolate-accent text-chocolate-dark" : "text-chocolate-light-accent hover:bg-chocolate-medium"}
                      `}
                onClick={() => setActiveFilter(button.filter)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {button.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.a
            href="#"
            className="px-6 py-3 border-2 border-chocolate-accent text-chocolate-light-accent font-medium rounded-lg hover:bg-chocolate-accent hover:text-chocolate-dark transition inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Projects
            <i className="fas fa-arrow-right ml-2"></i>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
