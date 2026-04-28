import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MouseTracker from "./components/Home/MouseTracker";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Particles from "./components/magicui/particles";

// Pages
import HomePage from "./pages/Home";
import WorkPage from "./pages/Work";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <div className="app relative min-h-screen">
      {/* Global Background Particles - Fixed to viewport */}
      <Particles
        className="fixed inset-0 z-0 pointer-events-none"
        quantity={250}
        ease={50}
        color="#FFFFFF"
        refresh
      />

      <MouseTracker />
      <Navbar />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/work"
              element={
                <PageTransition>
                  <WorkPage />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <AboutPage />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <ContactPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default App;
