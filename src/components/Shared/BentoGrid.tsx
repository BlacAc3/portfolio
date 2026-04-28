import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

const BentoGrid = ({ children, className = '' }: BentoGridProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-6 ${className}`}>
      {children}
    </div>
  );
};

export default BentoGrid;
