import React, { useEffect, useState } from 'react';
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    console.log(booted ? 'System booted successfully.' : 'System is booting...');
  }, [booted]);

  console.log("test");

  return (
    <ThemeProvider>
      {!booted ? (
        <BootScreen onComplete={() => setBooted(true)} />
      ) : (
        <Desktop />
      )}
    </ThemeProvider>
  );
};

export default App;