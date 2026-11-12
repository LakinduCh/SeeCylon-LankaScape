import React, { useEffect } from 'react';
import './AudioMuteToggle.css';

/**
 * Turns the cartoon map outline on or off. Keyboard shortcut: press 'O'.
 * Reuses the sound toggle's look so the two controls match.
 */
export default function OutlineToggle({ enabled, onToggle }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'o' || e.key === 'O') onToggle();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return (
    <aside className="audio-mute-switcher-wrapper" aria-label="Map outline controller">
      <div className="audio-mute-switcher-container">
        <button
          type="button"
          onClick={onToggle}
          className={`audio-mute-btn ${enabled ? 'sound-active' : 'sound-muted'}`}
          title={enabled ? 'Hide map outline [Shortcut: O]' : 'Show map outline [Shortcut: O]'}
          aria-pressed={enabled}
        >
          <svg
            className="audio-mute-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* a shape drawn with a bold outline */}
            <path d="M12 3 21 9v9l-9 3-9-3V9z" strokeDasharray={enabled ? undefined : '3 3'} />
          </svg>
          <span className="audio-mute-label">{enabled ? 'Outline On' : 'Outline Off'}</span>
          <span className={`audio-mute-indicator ${enabled ? 'active' : 'muted'}`} />
        </button>
      </div>
    </aside>
  );
}
