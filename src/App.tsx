import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import HomeSection from './components/HomeSection';
import NewsSection from './components/NewsSection';
import StocksSection from './components/StocksSection';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'news':
        return <NewsSection />;
      case 'stocks':
        return <StocksSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="App">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="main-content">
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderActiveSection()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="background-gradient" />
    </div>
  );
}

export default App;
