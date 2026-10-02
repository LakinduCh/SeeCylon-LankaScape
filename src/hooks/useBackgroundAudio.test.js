import { act, render } from "@testing-library/react";
import useBackgroundAudio from "./useBackgroundAudio";

function BackgroundAudio({ audioRef }) {
  useBackgroundAudio(audioRef);
  return null;
}

test("starts muted when audible autoplay is blocked, then enables sound on interaction", async () => {
  const audio = {
    loop: false,
    muted: false,
    volume: 1,
    preload: "",
    currentTime: 0,
    play: jest
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("Autoplay blocked"), {
          name: "NotAllowedError",
        })
      )
      .mockResolvedValue(undefined),
    pause: jest.fn(),
  };
  const audioRef = { current: audio };
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

  const { unmount } = render(<BackgroundAudio audioRef={audioRef} />);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(audio.play).toHaveBeenCalledTimes(2);
  expect(audio.muted).toBe(true);

  await act(async () => {
    window.dispatchEvent(new Event("pointerdown"));
    await Promise.resolve();
  });

  expect(audio.play).toHaveBeenCalledTimes(3);
  expect(audio.muted).toBe(false);

  unmount();
  expect(audio.pause).toHaveBeenCalled();
  warn.mockRestore();
});
