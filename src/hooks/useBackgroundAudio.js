import { useEffect } from "react";

function useBackgroundAudio(audioRef) {
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = false;
    audio.preload = "auto";

    let isDisposed = false;
    let hasLoggedAutoplayBlock = false;

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", retryPlayback);
      window.removeEventListener("touchstart", retryPlayback);
      window.removeEventListener("keydown", retryPlayback);
    };

    const retryPlayback = async () => {
      try {
        audio.muted = false;
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
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audioRef]);
}

export default useBackgroundAudio;
