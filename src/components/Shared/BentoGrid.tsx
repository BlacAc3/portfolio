import { ReactNode, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

const BentoGrid = ({ children, className = '' }: BentoGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = containerRef.current?.children;
      
      if (cards && cards.length > 0) {
        // Set initial state via GSAP to avoid flashes
        gsap.set(cards, { y: 60, opacity: 0 });

        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%", 
            toggleActions: "play none none none",
            once: true, // Ensures it only ever runs once
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 py-6 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
