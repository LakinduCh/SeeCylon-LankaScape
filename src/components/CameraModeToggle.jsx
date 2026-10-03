import React from 'react';
import './CameraModeToggle.css';

/**
 * CameraModeToggle Component
 * Allows seamless switching between:
 * - 'birdseye': Aerial top-down map overview of Sri Lanka
 * - 'free': Unconstrained 3D perspective orbit camera
 */
export default function CameraModeToggle({ cameraMode = 'birdseye', onCameraModeChange }) {
  return (
    <aside className="camera-mode-switcher-wrapper" aria-label="Camera Perspective View Switcher">
      <div className="camera-mode-switcher-container">
        {/* Bird's-Eye View Button */}
        <button
          type="button"
          onClick={() => onCameraModeChange('birdseye')}
          className={`camera-mode-btn ${cameraMode === 'birdseye' ? 'active' : ''}`}
          title="Bird's-Eye View: Top-down aerial perspective map [Shortcut: V]"
          aria-pressed={cameraMode === 'birdseye'}
        >
          <svg
            className="camera-mode-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Aerial / Compass Top-Down Icon */}
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v4" />
            <path d="M12 17v4" />
            <path d="M3 12h4" />
            <path d="M17 12h4" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
          <span className="camera-mode-label">Bird's-Eye</span>
          {cameraMode === 'birdseye' && <span className="camera-mode-indicator" />}
        </button>

        {/* Free Cam Button */}
        <button
          type="button"
          onClick={() => onCameraModeChange('free')}
          className={`camera-mode-btn ${cameraMode === 'free' ? 'active' : ''}`}
          title="Free Cam: Full 3D perspective orbit and tilt controls [Shortcut: V]"
          aria-pressed={cameraMode === 'free'}
        >
          <svg
            className="camera-mode-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* 3D Perspective Orbit Camera Icon */}
            <path d="m15 10 4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.9L15 14v-4z" />
            <rect width="13" height="12" x="2" y="6" rx="2" />
            <circle cx="8.5" cy="12" r="2" />
          </svg>
          <span className="camera-mode-label">Free Cam</span>
          {cameraMode === 'free' && <span className="camera-mode-indicator" />}
        </button>
      </div>
    </aside>
  );
}
