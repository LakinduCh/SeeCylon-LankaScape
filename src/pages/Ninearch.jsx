
import React, { useRef, useState } from "react";
import "../ninearch.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import nineArchAudio from "../assets/ninearch.wav";
import nineArchBackgroundAudio from "../assets/hortonplains2.mp3";
import nineArchVideo from "../assets/ninearch.mp4";
import nineArch1 from "../assets/ninearch1.jpeg";
import nineArch2 from "../assets/ninearch2.jpeg";
import nineArch3 from "../assets/ninearch3.jpeg";
import nineArch4 from "../assets/ninearch4.jpeg";

const galleryItems = [
  { type: "video", src: nineArchVideo },
  { type: "image", src: nineArch1 },
  { type: "image", src: nineArch2 },
  { type: "image", src: nineArch3 },
  { type: "image", src: nineArch4 },
];

function NineArchBridgePage() {
  const audioRef = useRef(new Audio(nineArchAudio));
  const backgroundAudioRef = useRef(new Audio(nineArchBackgroundAudio));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useBackgroundAudio(backgroundAudioRef);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [liked, setLiked] = useState(false);

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

  // ---------------- NEXT / PREVIOUS ----------------

  const goToNext = () => {
    setCurrentIndex(
      (prev) => (prev + 1) % galleryItems.length
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  // ---------------- TOUCH / MOBILE SWIPE ----------------

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

  // ---------------- MOUSE DRAG / DESKTOP ----------------

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

  // ---------------- LIKE BUTTON ----------------

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="card ninearch-card">

        {/* TITLE */}
        <h1 className="title ninearch-title">Nine Arch Bridge</h1>

        {/* GALLERY */}
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
              className="gallery-image gallery-video-fit"
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
              alt={`Nine Arch Bridge ${currentIndex + 1}`}
              draggable="false"
            />
          )}

          {/* GALLERY DOTS */}
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
                    index === currentIndex ? "active" : ""
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

        {/* DESCRIPTION */}
        <p className="description">
          Nine Arch Bridge is one of Sri Lanka's most
          beautiful railway bridges, located between
          Ella and Demodara. Surrounded by green
          mountains and tea plantations, the bridge
          offers a stunning view and is a popular
          destination for both local and foreign
          tourists.
        </p>

        {/* AUDIO BUTTON */}
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

        {/* HEART BUTTON */}
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

export default NineArchBridgePage;