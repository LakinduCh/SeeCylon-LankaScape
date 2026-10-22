import React, { useRef, useState } from "react";
import "../mirissa.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import mirissaAudio from "../assets/mirissa.wav";
import mirissaBackgroundAudio from "../assets/mirissa2.mp3";
import mirissaVideo from "../assets/mirissa.mp4";
import mirissa1 from "../assets/mirissa1.jpeg";
import mirissa2 from "../assets/mirissa2.jpeg";
import mirissa3 from "../assets/mirissa3.jpeg";
import mirissa4 from "../assets/mirissa4.jpeg";

const galleryItems = [
  { type: "video", src: mirissaVideo },
  { type: "image", src: mirissa1 },
  { type: "image", src: mirissa2 },
  { type: "image", src: mirissa3 },
  { type: "image", src: mirissa4 },
];

function MirissaPage() {
  const audioRef = useRef(new Audio(mirissaAudio));
  const backgroundAudioRef = useRef(new Audio(mirissaBackgroundAudio));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [liked, setLiked] = useState(false);

  useBackgroundAudio(backgroundAudioRef);

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

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (swipeDistance > swipeThreshold) {
      goToNext();
    } else if (swipeDistance < -swipeThreshold) {
      goToPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragEndX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    dragEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const dragDistance = dragStartX.current - dragEndX.current;
    const dragThreshold = 50;

    if (dragDistance > dragThreshold) {
      goToNext();
    } else if (dragDistance < -dragThreshold) {
      goToPrev();
    }

    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="card mirissa-card">
        <h1 className="title mirissa-title">Mirissa</h1>

        <div
          className="gallery"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="gallery-side gallery-side-prev"
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
          />
          <button
            className="gallery-side gallery-side-next"
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          />
          {galleryItems[currentIndex].type === "video" ? (
            <video
              className="gallery-image"
              src={galleryItems[currentIndex].src}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              className="gallery-image"
              src={galleryItems[currentIndex].src}
              alt={`Mirissa Beach ${currentIndex + 1}`}
              draggable="false"
            />
          )}

          <div className="gallery-dots">
            {galleryItems.map((_, index) => {
              const distance = Math.abs(index - currentIndex);
              let size = 4;

              if (distance === 0) size = 9;
              else if (distance === 1) size = 7;
              else if (distance === 2) size = 5;

              return (
                <span
                  key={index}
                  className={`swipe-dot ${
                    index === currentIndex ? "active" : ""
                  }`}
                  style={{ width: size, height: size }}
                  onClick={() => setCurrentIndex(index)}
                />
              );
            })}
          </div>
        </div>

        <p className="description">
          Mirissa is a beautiful coastal destination in southern Sri Lanka.
          It is famous for its golden beach, clear blue water, relaxing
          atmosphere, and beautiful sunsets. Visitors can enjoy surfing,
          swimming, whale watching, and the peaceful beauty of the ocean.
        </p>

        <div className="audio-buttons">
          <button
            className={`play-btn ${isPlaying ? "playing" : ""}`}
            onClick={toggleAudio}
          >
            {isPlaying ? (
              <FaPause className="icon" />
            ) : (
              <FaPlay className="icon" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <button
          className={`heart-btn ${liked ? "liked" : ""}`}
          onClick={toggleLike}
          aria-label="Like this destination"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}

export default MirissaPage;