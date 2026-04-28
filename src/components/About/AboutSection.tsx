import { motion } from "framer-motion";
import BentoGrid from "../Shared/BentoGrid";
import BentoCard from "../Shared/BentoCard";
import me from "../../public/me.webp";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const AboutSection = () => {
  const skills = [
    "Golang", "TypeScript", "React", "Node.js", "Python", 
    "Django", "AWS", "Docker", "Kubernetes", "GraphQL", "FastAPI"
  ];

  return (
    <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 bg-chocolate-dark">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
            THE <span className="text-chocolate-accent">CRAFTSMAN</span>
          </h2>
          <p className="text-xl text-white/40 uppercase tracking-widest font-medium">Core Philosophy & Expertise</p>
        </div>

        <BentoGrid>
          {/* Main Profile Card */}
          <BentoCard colSpan={2} rowSpan={2} theme="glass" className="group">
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <h3 className="text-4xl font-bold mb-6 leading-tight">
                  Bridging the gap between <span className="text-chocolate-accent">logic</span> and <span className="text-white/60 italic">aesthetics.</span>
                </h3>
                <p className="text-xl text-white/70 leading-relaxed mb-8">
                  I'm a Full Stack Engineer with 3+ years of experience building scalable systems and polished interfaces. My obsession lies in crafting software that doesn't just work, but feels exceptional to use.
                </p>
              </div>
              <div className="flex gap-4">
                <a href="https://github.com/blacac3" target="_blank" className="p-4 bg-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                  <FaGithub size={24} />
                </a>
                <a href="https://linkedin.com/in/aaron-ezeala" target="_blank" className="p-4 bg-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                  <FaLinkedin size={24} />
                </a>
                <a href="https://twitter.com/blacac3_dev" target="_blank" className="p-4 bg-white/10 rounded-2xl hover:bg-white hover:text-black transition-all">
                  <FaTwitter size={24} />
                </a>
              </div>
            </div>
          </BentoCard>

          {/* Image Card */}
          <BentoCard colSpan={2} rowSpan={1} className="p-0 border-0 overflow-hidden">
            <img src={me} alt="Aaron" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
          </BentoCard>

          {/* Skills Card */}
          <BentoCard colSpan={1} rowSpan={1} theme="accent">
            <div>
              <h4 className="text-sm uppercase tracking-widest font-bold mb-4 opacity-60">Toolkit</h4>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 6).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-black/10 rounded-lg text-sm font-semibold">{skill}</span>
                ))}
              </div>
            </div>
            <p className="text-sm font-medium mt-4">Continuous evolution through exploration.</p>
          </BentoCard>

          {/* Experience Card */}
          <BentoCard colSpan={1} rowSpan={1} theme="dark">
            <div>
              <h4 className="text-sm uppercase tracking-widest font-bold mb-4 opacity-40">Experience</h4>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-lg">Techivate</p>
                  <p className="text-sm opacity-60">Backend Engineer</p>
                </div>
                <div>
                  <p className="font-bold text-lg">Jaa Africa</p>
                  <p className="text-sm opacity-60">Python Dev (Django)</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Stats/Minor Card */}
          <BentoCard colSpan={2} rowSpan={1} theme="glass">
            <div className="grid grid-cols-2 gap-8 h-full items-center">
              <div className="text-center border-r border-white/10">
                <p className="text-6xl font-black text-chocolate-accent">3+</p>
                <p className="text-xs uppercase tracking-tighter opacity-40 font-bold">Years of Engineering</p>
              </div>
              <div className="text-center">
                <p className="text-6xl font-black text-white">20+</p>
                <p className="text-xs uppercase tracking-tighter opacity-40 font-bold">Projects Delivered</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
};

export default AboutSection;
