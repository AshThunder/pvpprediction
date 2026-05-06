import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import Arena from './components/Arena';
import About from './components/About';
import { ToastProvider } from './components/Toast';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const App = () => {
  const [view, setView] = useState('home');

  const navigateTo = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <Home 
              onEnterArena={() => navigateTo('arena')} 
              onNavigate={navigateTo}
            />
          </motion.div>
        )}
        {view === 'arena' && (
          <motion.div
            key="arena"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <Arena 
              onBackToHome={() => navigateTo('home')} 
              onNavigate={navigateTo}
            />
          </motion.div>
        )}
        {view === 'about' && (
          <motion.div
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <About 
              onNavigate={navigateTo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  );
};

export default App;
