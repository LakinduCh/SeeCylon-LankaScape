import React, { useEffect, useRef, useState } from "react";
import { FaHeart, FaPause, FaPlay, FaRegHeart } from "react-icons/fa";
import temporaryAudio from "../assets/gallefort.wav";
import backgroundAudio from "../assets/mirissa2.mp3";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

function DestinationCard({ title, description, className, galleryItems }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const touchStartX = useRef(0);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);
  const isDragging = useRef(false);

  if (audioRef.current === null) {
    audioRef.current = new Audio(temporaryAudio);
  }

  if (backgroundAudioRef.current === null) {
    backgroundAudioRef.current = new Audio(backgroundAudio);
  }

  useBackgroundAudio(backgroundAudioRef);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const goToNext = () => {
    setCurrentIndex((index) => (index + 1) % galleryItems.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (index) => (index === 0 ? galleryItems.length - 1 : index - 1)
    );
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const distance = touchStartX.current - event.changedTouches[0].clientX;

    if (distance > 50) goToNext();
    else if (distance < -50) goToPrev();
  };

  const handleMouseDown = (event) => {
    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragEndX.current = event.clientX;
  };

  const handleMouseMove = (event) => {
    if (isDragging.current) dragEndX.current = event.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    const distance = dragStartX.current - dragEndX.current;
    if (distance > 50) goToNext();
    else if (distance < -50) goToPrev();
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const toggleAudio = async () => {
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  };

  const currentItem = galleryItems[currentIndex];

  return (
    <div className="container">
      <article className={`card destination-card ${className}`}>
        <h2 className={`title ${className.replace(/-card$/, "")}-title`}>
          {title}
        </h2>

        <div
          className="gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="gallery-side gallery-side-prev"
            type="button"
            aria-label={`Previous ${title} image`}
            onClick={goToPrev}
          />
          <button
            className="gallery-side gallery-side-next"
            type="button"
            aria-label={`Next ${title} image`}
            onClick={goToNext}
          />

          {currentItem.type === "video" ? (
            <video
              key={currentItem.src}
              className="gallery-image"
              src={currentItem.src}
              autoPlay
              loop
              muted
              playsInline
              aria-label={`${title} video`}
            />
          ) : (
            <img
              className="gallery-image"
              src={currentItem.src}
              alt={currentItem.alt}
              draggable="false"
            />
          )}

          <div className="gallery-dots">
            {galleryItems.map((item, index) => {
              const distance = Math.abs(index - currentIndex);
              const size = distance === 0 ? 9 : distance === 1 ? 7 : 5;

              return (
                <button
                  key={item.src}
                  type="button"
                  className={`swipe-dot ${index === currentIndex ? "active" : ""}`}
                  style={{ width: size, height: size }}
                  aria-label={`Show ${title} item ${index + 1}`}
                  aria-current={index === currentIndex ? "true" : undefined}
                  onClick={() => setCurrentIndex(index)}
                />
              );
            })}
          </div>
        </div>

        <p className="description">{description}</p>

        <div className="audio-buttons">
          <button
            className={`play-btn ${isPlaying ? "playing" : ""}`}
            type="button"
            onClick={toggleAudio}
            aria-label={`${isPlaying ? "Pause" : "Play"} ${title} audio`}
          >
            {isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <button
          className={`heart-btn ${liked ? "liked" : ""}`}
          type="button"
          onClick={() => setLiked((previous) => !previous)}
          aria-label={`${liked ? "Unlike" : "Like"} ${title}`}
          aria-pressed={liked}
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </article>
    </div>
  );
}

export default DestinationCard;
