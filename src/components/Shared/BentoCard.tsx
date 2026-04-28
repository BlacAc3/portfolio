import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  theme?: 'dark' | 'light' | 'accent' | 'glass';
}

const BentoCard = ({ 
  children, 
  className = '', 
  colSpan = 1, 
  rowSpan = 1,
  theme = 'dark' 
}: BentoCardProps) => {
  const colSpans: Record<number, string> = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
  };

  const rowSpans: Record<number, string> = {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
    3: 'md:row-span-3',
  };

  const themes: Record<string, string> = {
    dark: 'bg-chocolate-medium border-white/5 text-white',
    light: 'bg-white text-black border-black/5',
    accent: 'bg-chocolate-accent text-chocolate-dark border-chocolate-accent/20',
    glass: 'bg-white/5 backdrop-blur-2xl border-white/10 text-white'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 15,
        mass: 1
      }}
      className={`
        ${colSpans[colSpan] || ''} 
        ${rowSpans[rowSpan] || ''} 
        ${themes[theme]}
        rounded-[32px] 
        p-10 
        border 
        overflow-hidden
        flex flex-col
        justify-between
        relative
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default BentoCard;
