import React, { useEffect, useState } from 'react';
import LankaScapeCanvas from './components/LankaScapeCanvas';
import WalkHud from './game/WalkHud';
import { vehicleFor, nextVehicle } from './game/rides';
import DestinationCard from './components/DestinationCard';
import HierarchicalFilter from './components/HierarchicalFilter';
import AudioMuteToggle from './components/AudioMuteToggle';
import { useSoundMute } from './utils/audioManager';
import locations from './data/locations.json';
import './App.css';

export default function App() {
  const { isMuted, setMute } = useSoundMute();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCardAudioPlaying, setIsCardAudioPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const activeStyle = 'realistic';
  const [walkMode, setWalkMode] = useState(false);
  // Destinations reached on this walk; cleared when walking stops, like the coins
  const [stamps, setStamps] = useState([]);

  // Rupee coins found on this walk: { coinId: value }. Every walk starts fresh, so
  // stopping (button or Esc) puts all the coins back and zeroes the rupees.
  const [coinsFound, setCoinsFound] = useState({});
  const [lastPickup, setLastPickup] = useState(null);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    if (!walkMode) {
      setCoinsFound({});
      setLastPickup(null);
      setStamps([]);
    }
  }, [walkMode]);

  const rupees = Object.values(coinsFound).reduce((sum, v) => sum + v, 0);

  const handleCollect = (coin) => {
    setCoinsFound((prev) => (coin.id in prev ? prev : { ...prev, [coin.id]: coin.value }));
    setLastPickup({ value: coin.value, key: Date.now() });
  };

  // Health hit zero: end the walk (which resets coins and stamps) and show the death screen
  const handleDeath = () => {
    setWalkMode(false);
    setDead(true);
  };

  const handleRetry = () => {
    setDead(false);
    setWalkMode(true);
  };

  const handleResetCoins = () => {
    setCoinsFound({});
    setLastPickup(null);
  };

  useEffect(() => {
    if (!walkMode) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setWalkMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [walkMode]);

  // Walking into a destination collects its stamp and opens its card
  const handleArrive = (loc) => {
    setStamps((prev) => (prev.includes(loc.id) ? prev : [...prev, loc.id]));
    setSelectedLocation(loc);
    setIsCardAudioPlaying(false);
  };

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
      {/* Unified Top Navigation Bar (Header + Hierarchical Filter) */}
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

          {/* Hierarchical Category & Subcategory Filter UI */}
          <div className="pointer-events-auto flex lg:justify-end flex-grow max-w-full overflow-x-auto scrollbar-none">
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

      {/* Bottom-Left Map Controls Toolbar (Sound Mute Toggle) */}
      <div className="bottom-map-controls-group">
        <AudioMuteToggle />
      </div>

      {/* 3D WebGL Canvas with Dynamic Visibility & Style Engine */}
      <LankaScapeCanvas
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        isCardAudioPlaying={isCardAudioPlaying}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        activeStyle={activeStyle}
        isMuted={isMuted}
        walkMode={walkMode}
        onArrive={handleArrive}
        onCollect={handleCollect}
        onDeath={handleDeath}
        rupees={rupees}
        collectedCoinIds={Object.keys(coinsFound)}
      />

      <WalkHud
        walking={walkMode}
        onToggle={() => setWalkMode((w) => !w)}
        stampCount={stamps.length}
        total={locations.length}
        rupees={rupees}
        ride={vehicleFor(rupees)}
        nextRide={nextVehicle(rupees)}
        coinsFound={Object.keys(coinsFound).filter((id) => !id.startsWith('reward:')).length}
        lastPickup={lastPickup}
        onResetCoins={handleResetCoins}
        dead={dead}
        onRetry={handleRetry}
        onCloseDeath={() => setDead(false)}
      />

      {/* Hierarchical Breadcrumb Destination Detail Card */}
      <DestinationCard
        location={selectedLocation}
        onClose={handleReset}
        onAudioPlayStateChange={setIsCardAudioPlaying}
        isMuted={isMuted}
        onUnmute={() => setMute(false)}
      />
    </main>
  );
}
