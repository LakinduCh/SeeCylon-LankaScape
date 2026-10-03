import React, { useState, useEffect } from 'react';
import LankaScapeCanvas from './components/LankaScapeCanvas';
import DestinationCard from './components/DestinationCard';
import HierarchicalFilter from './components/HierarchicalFilter';
import CameraModeToggle from './components/CameraModeToggle';
import locations from './data/locations.json';
import './App.css';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCardAudioPlaying, setIsCardAudioPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const activeStyle = 'realistic';
  const [cameraMode, setCameraMode] = useState('birdseye'); // 'birdseye' | 'free'

  // Keyboard shortcut listener: Press 'V' or 'C' to toggle between Bird's-Eye View and Free Cam
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
        setCameraMode((prev) => (prev === 'birdseye' ? 'free' : 'birdseye'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReset = () => {
    setSelectedLocation(null);
    setIsCardAudioPlaying(false);
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsCardAudioPlaying(false);
  };

  const handleSelectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory('all');
  };

  const handleSelectSubcategory = (subcategoryId) => {
    setActiveSubcategory(subcategoryId);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Unified Top Navigation Bar (Header + Hierarchical Filter) - Responsive across all screens from mobile to 2K/4K */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 sm:px-6 sm:py-4 pointer-events-none select-none">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Taxonomy Subtitle */}
          <div className="pointer-events-auto flex flex-col flex-shrink-0">
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-white tracking-wide drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] flex items-center gap-2 flex-wrap">
              <span>SeeCeylon-LankaScape</span>
              <span className="text-amber-400 text-[10px] sm:text-xs 2xl:text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm whitespace-nowrap">
                3D Tourism
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs 2xl:text-sm text-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-medium mt-0.5 max-w-[280px] sm:max-w-none">
              Two-Tier Hierarchical Taxonomy & Dynamic 3D Map Theming
            </p>
          </div>

          {/* Centered / Aligned Hierarchical Category & Subcategory Filter UI */}
          <div className="pointer-events-auto flex lg:justify-center flex-grow max-w-full overflow-x-auto scrollbar-none">
            <HierarchicalFilter
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              onSelectCategory={handleSelectCategory}
              onSelectSubcategory={handleSelectSubcategory}
              locations={locations}
            />
          </div>
        </div>
      </header>

      {/* Bottom-Left Map Controls Toolbar (Camera Mode Toggle) */}
      <div className="bottom-map-controls-group">
        <CameraModeToggle
          cameraMode={cameraMode}
          onCameraModeChange={setCameraMode}
        />
      </div>

      {/* 3D WebGL Canvas with Dynamic Visibility & Style Engine */}
      <LankaScapeCanvas
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        isCardAudioPlaying={isCardAudioPlaying}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        activeStyle={activeStyle}
        cameraMode={cameraMode}
      />

      {/* Hierarchical Breadcrumb Destination Detail Card */}
      <DestinationCard
        location={selectedLocation}
        onClose={handleReset}
        onAudioPlayStateChange={setIsCardAudioPlaying}
      />
    </main>
  );
}
