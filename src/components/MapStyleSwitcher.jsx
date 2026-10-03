import React from 'react';
import { mapStyles } from '../data/mapStyles';
import './MapStyleSwitcher.css';

export default function MapStyleSwitcher({ activeStyle, onStyleChange }) {
  const stylesList = Object.values(mapStyles);

  return (
    <aside className="map-style-switcher-wrapper" aria-label="3D Map Environment Style Switcher">
      <div className="map-style-switcher-container">
        {stylesList.map((style) => {
          const isActive = activeStyle === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange(style.id)}
              className={`map-style-btn ${isActive ? 'active' : ''}`}
              title={style.description}
              aria-pressed={isActive}
            >
              <span className="map-style-icon">{style.icon}</span>
              <span className="map-style-label">{style.shortName}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
