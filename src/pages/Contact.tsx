import ContactSection from "../components/Contact/ContactSection";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
        >
            <h1 className="text-[10vw] font-black tracking-[-0.06em] leading-[0.8] mb-12">
                LET'S <br />
                <span className="text-chocolate-accent">TALK</span>
            </h1>
            <p className="max-w-xl text-2xl text-white/40 font-light">
                Have an idea that needs a high-fidelity touch? Let's build something exceptional together.
            </p>
        </motion.div>
      </div>
      <ContactSection />
    </div>
  );
};

export default Contact;
