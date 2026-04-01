import React, { useState } from 'react';
import Home from './components/Home';
import Arena from './components/Arena';
import About from './components/About';

const App = () => {
  const [view, setView] = useState('home');

  const navigateTo = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {view === 'home' && (
        <Home 
          onEnterArena={() => navigateTo('arena')} 
          onNavigate={navigateTo}
        />
      )}
      {view === 'arena' && (
        <Arena 
          onBackToHome={() => navigateTo('home')} 
          onNavigate={navigateTo}
        />
      )}
      {view === 'about' && (
        <About 
          onNavigate={navigateTo}
        />
      )}
    </>
  );
};

export default App;
