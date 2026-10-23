
import React, { useRef, useState } from "react";
import "../minneriya.css";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// Minneriya audio assets
import introAudio from "../assets/wilpatthu.wav";
import minneriyaAudio from "../assets/minneriya voice.mp3";

// Minneriya gallery assets
import minneriyaVideo from "../assets/minneriya.mp4";
import minneriya1 from "../assets/minneriya 1.jpeg";
import minneriya2 from "../assets/minneriya 2.jpeg";
import minneriya3 from "../assets/minneriya 3.jpeg";
import minneriya4 from "../assets/minneriya 4.jpeg";

const galleryItems = [
  { type: "video", src: minneriyaVideo },
  { type: "image", src: minneriya1 },
  { type: "image", src: minneriya2 },
  { type: "image", src: minneriya3 },
  { type: "image", src: minneriya4 },
];

function MinneriyaPage() {
  const audioRef = useRef(new Audio(minneriyaAudio));
  const backgroundAudioRef = useRef(new Audio(introAudio));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
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
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) goToNext();
    else if (distance < -50) goToPrev();

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
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

    if (distance > 50) goToNext();
    else if (distance < -50) goToPrev();

    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="card minneriya-card">
        <h1 className="title minneriya-title">
          Minneriya
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
              alt={`Minneriya National Park ${
                currentIndex + 1
              }`}
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
          Minneriya National Park is famous for its spectacular
          Elephant Gathering, where large herds of wild Asian
          elephants gather around the Minneriya Tank during
          the dry season. Enjoy an exciting wildlife safari
          and discover elephants, deer, monkeys, and many
          beautiful bird species in their natural habitat.
        </p>

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

        <button
          className={`heart-btn ${liked ? "liked" : ""}`}
          onClick={toggleLike}
          aria-label="Like Minneriya"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
    </div>
  );
}

export default MinneriyaPage;
