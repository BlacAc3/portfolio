import { AnimatePresence, motion } from "framer-motion";
import { RiMoonClearLine, RiSunLine } from "react-icons/ri";
import { useTheme } from "../../contexts/ThemeContext";

/** Sun/moon switch. The icon shows the theme you'll get, not the current one. */
const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === "dark";
  const label = toLight ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => toggleTheme()}
      className={`relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-ink/[0.04] text-ink/80 transition-colors hover:border-accent/50 hover:text-accent ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
          aria-hidden="true"
        >
          {toLight ? <RiSunLine size={18} /> : <RiMoonClearLine size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
