
import React, { useRef, useState } from "react";
import "../nallur.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// Nallur audio assets
import introAudio from "../assets/nallur track.wav";
import nallurAudio from "../assets/nallur voice.wav";

// Nallur gallery assets
import nallurVideo from "../assets/nallur.mp4";
import nallur1 from "../assets/nallur 1.jpeg";
import nallur2 from "../assets/nallur 2.jpeg";
import nallur3 from "../assets/nallur 3.jpeg";
import nallur4 from "../assets/nallur 4.jpeg";

const galleryItems = [
  { type: "video", src: nallurVideo },
  { type: "image", src: nallur1 },
  { type: "image", src: nallur2 },
  { type: "image", src: nallur3 },
  { type: "image", src: nallur4 },
];

function NallurPage() {
  const audioRef = useRef(null);
  const backgroundAudioRef = useRef(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(nallurAudio);
  }

  if (!backgroundAudioRef.current) {
    backgroundAudioRef.current = new Audio(introAudio);
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const suppressClick = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

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
    setCurrentIndex(
      (prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1)
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    suppressClick.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      suppressClick.current = true;
      goToNext();
    } else if (distance < -50) {
      suppressClick.current = true;
      goToPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    suppressClick.current = false;
    dragStartX.current = e.clientX;
    dragEndX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      dragEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    const distance = dragStartX.current - dragEndX.current;

    if (distance > 50) {
      suppressClick.current = true;
      goToNext();
    } else if (distance < -50) {
      suppressClick.current = true;
      goToPrev();
    }

    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  const handleSideNavigation = (navigate) => (e) => {
    e.stopPropagation();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    navigate();
  };

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="card nallur-card">
        <h1 className="title nallur-title">Nallur</h1>

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
            onClick={handleSideNavigation(goToPrev)}
          />
          <button
            className="gallery-side gallery-side-next"
            type="button"
            aria-label="Next image"
            onClick={handleSideNavigation(goToNext)}
          />
          {galleryItems[currentIndex].type === "video" ? (
            <video
              key={galleryItems[currentIndex].src}
              className="gallery-image"
              src={galleryItems[currentIndex].src}
              autoPlay
              loop
              muted
              playsInline
              draggable="false"
            />
          ) : (
            <img
              className="gallery-image"
              src={galleryItems[currentIndex].src}
              alt={`Nallur Kandaswamy Temple ${currentIndex + 1}`}
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
          Nallur, located in Jaffna, is famous for the magnificent
          Nallur Kandaswamy Kovil, one of Sri Lanka's most important
          Hindu temples. Known for its beautiful Dravidian architecture,
          golden decorations, and vibrant annual Nallur Festival,
          it is a special destination for culture, spirituality,
          and Tamil heritage.
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
          aria-label="Like Nallur"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}

export default NallurPage;
