import React, { useRef, useState } from "react";
import "../gallefort.css";

import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import galleFortAudio from "../assets/gallefort.mp3";
import galleFortVideo from "../assets/gallefort.mp4";
import galleFort1 from "../assets/gallefort1.jpeg";
import galleFort2 from "../assets/gallefort2.jpeg";
import galleFort3 from "../assets/gallefort3.jpeg";
import galleFort4 from "../assets/gallefort4.jpeg";

const galleryItems = [
  { type: "video", src: galleFortVideo },
  { type: "image", src: galleFort1 },
  { type: "image", src: galleFort2 },
  { type: "image", src: galleFort3 },
  { type: "image", src: galleFort4 },
];

function GalleFortPage() {
  const audioRef = useRef(new Audio(galleFortAudio));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [liked, setLiked] = useState(false);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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
      <div className="card gallefort-card">
        <h1 className="title gallefort-title">Galle Fort</h1>

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
              alt={`Galle Fort ${currentIndex + 1}`}
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
          Galle Fort is a historic landmark on the southern coast
          of Sri Lanka. It is famous for its old stone walls,
          colonial buildings, charming streets, and beautiful
          ocean views. Explore the historic fort, discover its
          unique culture, and enjoy the beautiful coastal scenery.
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

export default GalleFortPage;