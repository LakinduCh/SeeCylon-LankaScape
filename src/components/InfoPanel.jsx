import React, { useEffect } from 'react';

export default function InfoPanel({ location, onClose }) {
  useEffect(() => {
    if (location?.audioUrl) {
      // Web Audio controller integration with ambient playback (WEB-2.3)
      const audio = new Audio(location.audioUrl);
      audio.volume = 0.4;
      audio.play().catch(() => {
        console.log("Autoplay restricted or audio resource pending.");
      });
      return () => {
        audio.pause();
      };
    }
  }, [location]);

  if (!location) return null;

  return (
    <div className="fixed top-6 right-6 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-6 rounded-2xl shadow-2xl transition-all duration-300 z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-400 m-0 border-none p-0">{location.name}</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white font-bold text-lg bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        {location.description}
      </p>
      <button
        onClick={onClose}
        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors border-none cursor-pointer"
      >
        Reset Camera View
      </button>
    </div>
  );
}
