import React, { useRef, useState } from "react";
import "../sigiriya.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import sigiriyaAudio from "../assets/sigiriya.wav";
import sigiriyaBackgroundAudio from "../assets/sigiriya2.mp3";

import sigiriyaVideo from "../assets/sigiriya.mp4";
import sigiriya1 from "../assets/sigiriya1.jpeg";
import sigiriya2 from "../assets/sigiriya 2.jpeg";
import sigiriya3 from "../assets/sigiriya 3.jpg";
import sigiriya4 from "../assets/sigiriya 4.jpeg";

const galleryItems = [
  { type: "video", src: sigiriyaVideo },
  { type: "image", src: sigiriya1 },
  { type: "image", src: sigiriya2 },
  { type: "image", src: sigiriya3 },
  { type: "image", src: sigiriya4 },
];

function SigiriyaPage() {
  const audioRef = useRef(new Audio(sigiriyaAudio));
  const backgroundAudioRef = useRef(new Audio(sigiriyaBackgroundAudio));

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
      <div className="card sigiriya-card">

        {/* Title */}
        <h1 className="title sigiriya-title">
          Sigiriya
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
              alt={`Sigiriya Rock ${currentIndex + 1}`}
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
          Sigiriya is one of Sri Lanka&apos;s most famous
          historical landmarks. It is an ancient rock
          fortress surrounded by beautiful gardens and
          natural scenery. Explore the historic site,
          admire the ancient paintings, and enjoy the
          amazing view from the top of the rock.
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

export default SigiriyaPage;