import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AudioMuteToggle from './AudioMuteToggle';
import './DestinationNavbar.css';

export const DESTINATIONS = [
  { path: '/yala', label: 'Yala' },
  { path: '/sigiriya', label: 'Sigiriya' },
  { path: '/galle-fort', label: 'Galle Fort' },
  { path: '/mirissa', label: 'Mirissa' },
  { path: '/nine-arch', label: 'Nine Arch Bridge' },
  { path: '/horton-plains', label: 'Horton Plains' },
  { path: '/arugambay', label: 'Arugam Bay' },
  { path: '/adams-peak', label: "Adam's Peak" },
  { path: '/delft', label: 'Delft Island' },
  { path: '/kandy', label: 'Kandy' },
  { path: '/lotus-tower', label: 'Lotus Tower' },
  { path: '/pinnawala', label: 'Pinnawala' },
  { path: '/wilpattu', label: 'Wilpattu' },
];

export default function DestinationWrapper({ children }) {
  const location = useLocation();

  return (
    <div className="destination-page-wrapper">
      <header className="destination-nav-container">
        <Link to="/" className="destination-back-btn">
          <span>←</span>
          <span>3D Map</span>
        </Link>

        <nav className="destination-links-scroll" aria-label="Destinations List">
          {DESTINATIONS.map((dest) => {
            const isActive = location.pathname === dest.path;
            return (
              <Link
                key={dest.path}
                to={dest.path}
                className={`destination-pill-link ${isActive ? 'active' : ''}`}
              >
                {dest.label}
              </Link>
            );
          })}
        </nav>

        <div className="destination-mute-container flex-shrink-0">
          <AudioMuteToggle />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
