import React from "react";
import { motion } from "framer-motion";
import { useCursor } from "../../contexts/CursorContext";

const ProjectCard = ({ project }) => {
  return (
    <motion.div
      className="project-card"
      data-category={project.category}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <div className="h-full rounded-lg overflow-hidden shadow-lg">
        <div className="h-48 overflow-hidden">
          <motion.img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="p-6">
          <div className="flex items-center mb-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${project.tagColor} mr-2`}
            >
              {project.tag}
            </span>
            <span className="text-xs text-chocolate-light-accent">
              {project.subTag}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-chocolate-light-accent">
            {project.title}
          </h3>
          <p className="text-chocolate-light-accent mb-4">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded bg-chocolate-medium text-chocolate-light-accent"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex space-x-3">
            {project.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-chocolate-accent hover:underline"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
