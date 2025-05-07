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
      title: "Multi-Tenant Subscription Management API (SaaS)",
      description:
        "A backend API service for managing multi-tenant SaaS subscriptions, handling user management, billing, and access control with flexible plans, automation, and integrations.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "personal",
      tag: "Personal",
      subTag: "Open Source",
      tagColor: "bg-chocolate-accent text-chocolate-dark",
      technologies: ["FastAPI", "REST", "Python"],
      links: [
        { text: "GitHub", url: "https://github.com/BlacAc3/subscription-saas" },
      ],
    },
    {
      id: 2,
      title: "Zloan",
      description:
        "A comprehensive loan management application that helps users apply for loans, track payments, and manage repayment schedules.",
      image:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      category: "personal",
      tag: "personal",
      subTag: "Finance",
      tagColor: "bg-blue-500 text-white",
      technologies: ["Django", "React", "PostgreSQL"],
      links: [{ text: "View Project", url: "https://zloan.vercel.app" }],
    },
    {
      id: 3,
      title: "Job Management API",
      description:
        "A RESTful API service for job management that enables tracking applications, interviews, and offers with status updates and deadline notifications for job seekers.",
      image:
        "https://images.unsplash.com/photo-1555774698-0f77e70ac3f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "personal",
      tag: "Personal",
      subTag: "Productivity",
      tagColor: "bg-purple-500 text-white",
      technologies: ["Node.js", "Express", "MongoDB"],
      links: [
        {
          text: "GitHub",
          url: "https://github.com/BlacAc3/job-management-site",
        },
      ],
    },
    {
      id: 4,
      title: "Telegram Channel Copy Bot",
      description:
        "A Telegram bot that automatically copies messages, media, files and other content from public channels to target channels, preserving formatting and attachments for seamless content syndication.",
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=765&q=80",
      category: "personal",
      tag: "Personal",
      subTag: "Open source",
      tagColor: "bg-green-500 text-white",
      technologies: ["Telegram", "Python"],
      links: [{ text: "GitHub", url: "https://github.com/BlacAc3/tele-copy" }],
    },
    {
      id: 5,
      title: "Programming Language Compiler",
      description:
        "A custom compiler for a simple programming language, implementing lexical analysis, parsing, semantic analysis, and code generation. Features include basic syntax validation, type checking, and compilation to a target bytecode or machine code.",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "personal",
      tag: "personal",
      subTag: "Programming",
      tagColor: "bg-chocolate-accent text-chocolate-dark",
      technologies: ["Python"],
      links: [
        { text: "GitHub", url: "https://github.com/BlacAc3/ace_compiler" },
      ],
    },
    {
      id: 6,
      title: "PrimersGPT",
      description:
        "A specialized AI chatbot designed to provide concise, accurate information on complex topics. It transforms technical concepts into easy-to-understand primers, offering personalized learning paths based on user expertise and adapting its responses to match individual learning styles. The bot is fully tailored for the company's specific needs, preferences, and incorporates company details to ensure consistent brand voice and domain-specific knowledge alignment.",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "freelance",
      tag: "Freelance",
      subTag: "AI Chatbot",
      tagColor: "bg-chocolate-accent text-chocolate-dark",
      technologies: ["React", "n8n"],
      links: [{ text: "View Project", url: "https://primersgpt.vercel.app/" }],
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
