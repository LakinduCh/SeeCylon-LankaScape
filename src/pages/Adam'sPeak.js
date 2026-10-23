import React, { useRef, useState } from "react";
import "../adamspeak.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import adamAudio from "../assets/adam.wav";
import adamBackgroundAudio from "../assets/adams.mp3";
import adamVideo from "../assets/adams.mp4";
import adam1 from "../assets/adam1.jpeg";
import adam2 from "../assets/adam2.jpeg";
import adam3 from "../assets/adam3.jpeg";
import adam4 from "../assets/adam4.jpeg";

const galleryItems = [
  { type: "video", src: adamVideo },
  { type: "image", src: adam1 },
  { type: "image", src: adam2 },
  { type: "image", src: adam3 },
  { type: "image", src: adam4 },
];

function AdamsPeakPage() {
  const audioRef = useRef(new Audio(adamAudio));
  const backgroundAudioRef = useRef(new Audio(adamBackgroundAudio));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  useBackgroundAudio(backgroundAudioRef);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

  // Play / Pause audio
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

  // Next image/video
  const goToNext = () => {
    setCurrentIndex(
      (prev) => (prev + 1) % galleryItems.length
    );
  };

  // Previous image/video
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
    touchEndX.current = e.touches[0].clientX;
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

  // ---------------- MOUSE DRAG ----------------

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

  // Like button
  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="card adam-card">

        {/* Title */}
        <h1 className="title adam-title">
          Adam&apos;s Peak
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
              alt={`Adam's Peak ${currentIndex + 1}`}
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

              if (distance === 0) size = 9;
              else if (distance === 1) size = 7;
              else if (distance === 2) size = 5;

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
                    height: size,
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
          Adam&apos;s Peak is one of Sri Lanka&apos;s most
          iconic mountains and a popular destination for
          pilgrims and travelers. The mountain is famous
          for its sacred footprint, beautiful surrounding
          scenery, and breathtaking views from the summit.
          Experience the peaceful journey and stunning
          landscapes of this remarkable destination.
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

        {/* Heart button */}
        <button
          className={`heart-btn ${
            liked ? "liked" : ""
          }`}
          onClick={toggleLike}
          aria-label="Like this destination"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>

      </div>
    </div>
  );
}

export default AdamsPeakPage;