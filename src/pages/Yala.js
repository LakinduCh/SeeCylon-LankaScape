import React, { useRef, useState } from "react";
import "../App.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import introAudio from "../assets/yala2.mp3";
import yalaAudio from "../assets/yala.wav";

import yalaVideo from "../assets/yala.mp4";
import yala1 from "../assets/yala1.jpeg";
import yala2 from "../assets/yala2.jpeg";
import yala3 from "../assets/yala3.jpeg";
import yala4 from "../assets/yala4.jpeg";

const galleryItems = [
  { type: "video", src: yalaVideo },
  { type: "image", src: yala1 },
  { type: "image", src: yala2 },
  { type: "image", src: yala3 },
  { type: "image", src: yala4 },
];

function YalaPage() {
  const audioRef = useRef(new Audio(yalaAudio));
  const backgroundAudioRef = useRef(new Audio(introAudio));
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
      <div
        className="card"
      >
        <h1 className="title yala-title">Yala</h1>

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
              alt={`Yala National Park ${currentIndex + 1}`}
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
                  className={`swipe-dot ${index === currentIndex ? "active" : ""}`}
                  style={{ width: size, height: size }}
                  onClick={() => setCurrentIndex(index)}
                />
              );
            })}
          </div>
        </div>

        <p className="description">
          Yala National Park is Sri Lanka&apos;s most famous wildlife sanctuary.
          It is home to leopards, elephants, sloth bears, deer, crocodiles,
          and many bird species. Experience the beauty of nature and wildlife
          in one unforgettable destination.
        </p>

        <div className="audio-buttons">
          <button
            className={`play-btn ${isPlaying ? "playing" : ""}`}
            onClick={toggleAudio}
          >
            {isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
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

export default YalaPage;
