import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      backgroundColor: "rgba(212, 167, 106, 0.3)",
    },
  };

  return (
    <>
      <motion.div
        className="cursor-dot hidden md:block"
        variants={variants}
        animate="default"
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
      <motion.div
        className="cursor-ring hidden md:block"
        style={{
          position: "fixed",
          top: mousePosition.y - 4,
          left: mousePosition.x - 4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "rgba(212, 167, 106, 0.7)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  );
};

export default MouseTracker;
