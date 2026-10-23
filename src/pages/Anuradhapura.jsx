
import React, { useRef, useState } from "react";
import "../anuradhapura.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// Import Anuradhapura assets
import introAudio from "../assets/anuradapura.mp3";
import anuradhapuraAudio from "../assets/anuradhapura voice.mp3";

import anuradhapuraVideo from "../assets/anuradhapura.mp4";
import anuradhapura1 from "../assets/anuradhapura 1.jpeg";
import anuradhapura2 from "../assets/anuradhapura 2.jpeg";
import anuradhapura3 from "../assets/anuradhapura 3.jpeg";
import anuradhapura4 from "../assets/anuradhapura 4.jpeg";

const galleryItems = [
  { type: "video", src: anuradhapuraVideo },
  { type: "image", src: anuradhapura1 },
  { type: "image", src: anuradhapura2 },
  { type: "image", src: anuradhapura3 },
  { type: "image", src: anuradhapura4 },
];

function AnuradhapuraPage() {
  const audioRef = useRef(new Audio(anuradhapuraAudio));
  const backgroundAudioRef = useRef(new Audio(introAudio));

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
    if (isDragging.current) {
      isDragging.current = false;
      dragStartX.current = 0;
      dragEndX.current = 0;
    }
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
      <div className="card anuradhapura-card">
        <h1 className="title anuradhapura-title">
          Anuradhapura
        </h1>

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
              alt={`Anuradhapura ancient city ${currentIndex + 1}`}
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
          Anuradhapura is one of Sri Lanka's most important ancient
          cities, famous for its sacred Buddhist sites, enormous
          stupas, and ancient ruins. Explore the sacred Sri Maha
          Bodhi tree, Ruwanwelisaya Stupa, Jetavanaramaya, and
          the rich history of Sri Lanka's ancient kingdom.
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
          aria-label="Like Anuradhapura"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}

export default AnuradhapuraPage;
