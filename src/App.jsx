import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LankaScapeCanvas from './components/LankaScapeCanvas';
import DestinationCard from './components/DestinationCard';
import HierarchicalFilter from './components/HierarchicalFilter';
import CameraModeToggle from './components/CameraModeToggle';
import { DESTINATIONS } from './components/DestinationWrapper';
import locations from './data/locations.json';
import './App.css';

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCardAudioPlaying, setIsCardAudioPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const activeStyle = 'realistic';
  const [cameraMode, setCameraMode] = useState('birdseye'); // 'birdseye' | 'free'
  const [showDestinationsMenu, setShowDestinationsMenu] = useState(false);

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
      {/* Unified Top Navigation Bar (Header + Hierarchical Filter + Destination Quick Links) */}
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

          {/* Destination Showcase Pages Quick Menu */}
          <div className="pointer-events-auto relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowDestinationsMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/30 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg transition-all"
            >
              <span>🏛️ Showcases ({DESTINATIONS.length})</span>
              <span className="text-[10px]">{showDestinationsMenu ? '▲' : '▼'}</span>
            </button>

            {showDestinationsMenu && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-slate-950/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Destination Showcases
                </div>
                {DESTINATIONS.map((d) => (
                  <Link
                    key={d.path}
                    to={d.path}
                    onClick={() => setShowDestinationsMenu(false)}
                    className="block px-3 py-2 text-xs text-slate-200 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors font-medium"
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            )}
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
