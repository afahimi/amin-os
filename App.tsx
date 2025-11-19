import React, { useEffect, useState } from 'react';
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';

const App: React.FC = () => {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    console.log(booted ? 'System booted successfully.' : 'System is booting...');
  }, [booted]);

  console.log("test");

  return (
    <>
      {!booted ? (
        <BootScreen onComplete={() => setBooted(true)} />
      ) : (
        <Desktop />
      )}
    </>
  );
};

export default App;