import React, { useRef, useState } from "react";
import "../lotustower.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";

// Audio
import lotusAudio from "../assets/gallefort.mp3";
import lotusBackgroundAudio from "../assets/galle2.mp3";

// Video
import lotusVideo from "../assets/lotustower.mp4";

// Images
import lotus1 from "../assets/lotustower1.jpeg";
import lotus2 from "../assets/lotustower2.jpeg";
import lotus3 from "../assets/lotustower3.jpeg";
import lotus4 from "../assets/lotustower4.jpeg";

// Gallery
const galleryItems = [
  { type: "video", src: lotusVideo },
  { type: "image", src: lotus1 },
  { type: "image", src: lotus2 },
  { type: "image", src: lotus3 },
  { type: "image", src: lotus4 },
];

function LotusTowerPage() {
  // Audio
  const audioRef = useRef(new Audio(lotusAudio));
  const backgroundAudioRef = useRef(new Audio(lotusBackgroundAudio));
  const [isPlaying, setIsPlaying] = useState(false);

  useBackgroundAudio(backgroundAudioRef);

  // Gallery
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Like
  const [liked, setLiked] = useState(false);

  // Desktop drag
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

  // ---------------- AUDIO ----------------

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

  // ---------------- GALLERY ----------------

  const goToNext = () => {
    setCurrentIndex(
      (prev) => (prev + 1) % galleryItems.length
    );
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prev) =>
        prev === 0
          ? galleryItems.length - 1
          : prev - 1
    );
  };

  // ---------------- TOUCH SWIPE ----------------

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance =
      touchStartX.current - touchEndX.current;

    const swipeThreshold = 50;

    if (swipeDistance > swipeThreshold) {
      goToNext();
    } else if (swipeDistance < -swipeThreshold) {
      goToPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // ---------------- DESKTOP DRAG ----------------

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    dragEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const dragDistance =
      dragStartX.current - dragEndX.current;

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

  // ---------------- LIKE ----------------

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  // ---------------- UI ----------------

  return (
    <div className="container">

      <div className="card lotustower-card">

        <h1 className="title lotustower-title">
          Lotus Tower
        </h1>

        {/* Gallery */}
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
              alt={`Colombo Lotus Tower ${currentIndex + 1}`}
              draggable="false"
            />

          )}

          {/* Gallery dots */}
          <div className="gallery-dots">

            {galleryItems.map((_, index) => {

              const distance = Math.abs(
                index - currentIndex
              );

              let size = 4;

              if (distance === 0) {
                size = 9;
              } else if (distance === 1) {
                size = 7;
              } else if (distance === 2) {
                size = 5;
              }

              return (
                <span
                  key={index}
                  className={`swipe-dot ${
                    index === currentIndex
                      ? "active"
                      : ""
                  }`}
                  style={{
                    width: size,
                    height: size
                  }}
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                />
              );

            })}

          </div>

        </div>

        {/* Description */}
        <p className="description">
          Colombo Lotus Tower rises above the city
          with panoramic views, modern architecture,
          and a memorable evening skyline.
        </p>

        {/* Audio button */}
        <div className="audio-buttons">

          <button
            className={`play-btn ${
              isPlaying ? "playing" : ""
            }`}
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

        {/* Like button */}
        <button
          className={`heart-btn ${
            liked ? "liked" : ""
          }`}
          onClick={toggleLike}
          aria-label="Like this destination"
        >

          {liked ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}

        </button>

      </div>

    </div>
  );
}

export default LotusTowerPage;