import { useEffect } from "react";
import { getIsMuted } from "../utils/audioManager";

function useBackgroundAudio(audioRef) {
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const initialMuted = getIsMuted();
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = initialMuted;
    audio.preload = "auto";

    let isDisposed = false;
    let hasLoggedAutoplayBlock = false;

    const handleMuteChange = (e) => {
      const isMuted = Boolean(e.detail?.isMuted);
      audio.muted = isMuted;
    };

    window.addEventListener("seeceylon_mute_change", handleMuteChange);

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("touchstart", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
    };

    const retryPlayback = async () => {
      try {
        audio.muted = getIsMuted();
        await audio.play();
        if (!isDisposed) removeInteractionListeners();
      } catch (error) {
        if (error && error.name === "NotAllowedError") {
          if (!hasLoggedAutoplayBlock) {
            console.warn(
              "Background audio autoplay was blocked by the browser; waiting for user interaction."
            );
            hasLoggedAutoplayBlock = true;
          }

          audio.muted = true;
          try {
            await audio.play();
          } catch (mutedPlaybackError) {
            if (
              mutedPlaybackError &&
              mutedPlaybackError.name !== "NotAllowedError"
            ) {
              console.error(
                "Muted background audio playback failed:",
                mutedPlaybackError
              );
            }
          }
          return;
        }

        console.error("Background audio playback failed:", error);
      }
    };

    window.addEventListener("pointerdown", retryPlayback);
    window.addEventListener("touchstart", retryPlayback);
    window.addEventListener("keydown", retryPlayback);
    void retryPlayback();

    return () => {
      isDisposed = true;
      removeInteractionListeners();
      window.removeEventListener("seeceylon_mute_change", handleMuteChange);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioRef]);
}

export default useBackgroundAudio;
