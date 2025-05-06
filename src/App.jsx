import React from "react";
import { CursorProvider } from "./contexts/CursorContext";
import MouseTracker from "./components/Home/MouseTracker";
import Navbar from "./components/Layout/Navbar";
import HeroSection from "./components/Home/HeroSection";
import AboutSection from "./components/About/AboutSection";
import ProjectsSection from "./components/Projects/ProjectsSection";
import ContactSection from "./components/Contact/ContactSection";
import Footer from "./components/Layout/Footer";

const App = () => {
  return (
    <div className="app bg-chocolate-dark">
      <MouseTracker />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
