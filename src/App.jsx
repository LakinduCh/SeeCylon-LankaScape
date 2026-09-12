import React, { useState } from 'react';
import LankaScapeCanvas from './components/LankaScapeCanvas';
import InfoPanel from './components/InfoPanel';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  console.log("App component rendering. Selected location:", selectedLocation);

  const handleReset = () => {
    setSelectedLocation(null);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <header className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
          SeeCeylon-LankaScape <span className="text-amber-400 text-sm font-normal">3D Tourism</span>
        </h1>
        <p className="text-xs text-slate-400">Click on any destination node to explore</p>
      </header>
      <LankaScapeCanvas
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />
      <InfoPanel location={selectedLocation} onClose={handleReset} />
    </main>
  );
}
