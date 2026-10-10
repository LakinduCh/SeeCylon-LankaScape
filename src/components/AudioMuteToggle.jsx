import React, { useEffect } from 'react';
import { useSoundMute } from '../utils/audioManager';
import './AudioMuteToggle.css';

/**
 * AudioMuteToggle Component
 * Allows users to easily mute and unmute all audio in the application.
 * Keyboard shortcut: Press 'M' to toggle mute.
 */
export default function AudioMuteToggle() {
  const { isMuted, toggleMute } = useSoundMute();

  // Keyboard shortcut listener: Press 'M' to toggle mute
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  return (
    <aside className="audio-mute-switcher-wrapper" aria-label="Audio Mute Controller">
      <div className="audio-mute-switcher-container">
        <button
          type="button"
          onClick={toggleMute}
          className={`audio-mute-btn ${isMuted ? 'sound-muted' : 'sound-active'}`}
          title={isMuted ? 'Unmute sounds [Shortcut: M]' : 'Mute sounds [Shortcut: M]'}
          aria-label={isMuted ? 'Sound muted. Click or press M to unmute.' : 'Sound playing. Click or press M to mute.'}
          aria-pressed={isMuted}
        >
          {isMuted ? (
            /* Muted Speaker Icon with Slash */
            <svg
              className="audio-mute-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            /* Unmuted Speaker Icon with Audio Waves */
            <svg
              className="audio-mute-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}

          <span className="audio-mute-label">{isMuted ? 'Muted' : 'Sound On'}</span>
          <span className={`audio-mute-indicator ${isMuted ? 'muted' : 'active'}`} />
        </button>
      </div>
    </aside>
  );
}
