import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MouseTracker from "./components/Home/MouseTracker";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Particles from "./components/magicui/particles";
import { usePalette } from "./contexts/ThemeContext";

// Pages: Home ships with the first load; the rest load on demand and are
// prefetched once the browser is idle, so navigating still feels instant.
import HomePage from "./pages/Home";
const loadWork = () => import("./pages/Work");
const loadAbout = () => import("./pages/About");
const loadContact = () => import("./pages/Contact");
const CreditsPage = lazy(() => import("./pages/Credits"));
const WorkPage = lazy(loadWork);
const AboutPage = lazy(loadAbout);
const ContactPage = lazy(loadContact);

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <Suspense fallback={<div className="min-h-screen" />}>{children}</Suspense>
  </motion.div>
);

const usePrefetchPages = () =>
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => {
      loadWork();
      loadAbout();
      loadContact();
    });
    return () => cancel(id);
  }, []);

import { useLenisSetup } from "./hooks/useLenisSetup";

const App = () => {
  const location = useLocation();
  useLenisSetup();
  usePrefetchPages();
  const palette = usePalette();

  return (
    <div className="app relative min-h-screen">
      {/* Global Background Particles - Fixed to viewport */}
      <Particles
        className="fixed inset-0 z-0 pointer-events-none"
        quantity={250}
        ease={50}
        color={palette.particles}
        refresh
      />

      <MouseTracker />
      <Navbar />

      <main id="main-content" tabIndex={-1} className="relative z-10 outline-none">
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
            <Route
              path="/credits"
              element={
                <PageTransition>
                  <CreditsPage />
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
