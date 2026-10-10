import { useState, useEffect, useCallback } from 'react';

const MUTE_STORAGE_KEY = 'seeceylon_sound_muted';
const MUTE_EVENT = 'seeceylon_mute_change';

/**
 * Get current mute state from localStorage
 */
export function getIsMuted() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
}

/**
 * Set mute state globally and dispatch event to all listeners
 */
export function setGlobalMuted(muted) {
  if (typeof window === 'undefined') return;
  const isMuted = Boolean(muted);
  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  window.dispatchEvent(
    new CustomEvent(MUTE_EVENT, {
      detail: { isMuted },
    })
  );
}

/**
 * Toggle global mute state
 */
export function toggleGlobalMuted() {
  const next = !getIsMuted();
  setGlobalMuted(next);
  return next;
}

/**
 * Hook to read and toggle global mute state in any React component
 */
export function useSoundMute() {
  const [isMuted, setIsMutedState] = useState(() => getIsMuted());

  useEffect(() => {
    const handleMuteChange = (e) => {
      setIsMutedState(Boolean(e.detail?.isMuted));
    };

    const handleStorage = (e) => {
      if (e.key === MUTE_STORAGE_KEY) {
        setIsMutedState(e.newValue === 'true');
      }
    };

    window.addEventListener(MUTE_EVENT, handleMuteChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(MUTE_EVENT, handleMuteChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleMute = useCallback(() => {
    return toggleGlobalMuted();
  }, []);

  const setMute = useCallback((value) => {
    setGlobalMuted(value);
  }, []);

  return { isMuted, toggleMute, setMute };
}
