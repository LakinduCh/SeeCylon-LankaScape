import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { destinationCardsData } from '../data/destinationCards';
import { destinationThemeMusic } from '../data/destinationMusic';
import './DestinationCard.css';

export default function DestinationCard({
  location,
  onClose,
  onAudioPlayStateChange,
  isMuted = false,
  onUnmute,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const audioRef = useRef(null);
  const musicTheme = location?.id ? destinationThemeMusic[location.id] : null;

  // Fallback to location data if specific card entry not found
  const cardData = location
    ? destinationCardsData[location.id] || {
        id: location.id,
        title: location.name,
        titleColor: '#d97706',
        btnColor: '#d97706',
        btnHoverColor: '#b45309',
        bgImage: '/assets/destinations/sigiriya/bg.jpeg',
        audioSrc: location.audioUrl || '/assets/destinations/sigiriya/audio.mp3',
        description: location.description,
        galleryItems: [
          { type: 'image', src: '/assets/destinations/sigiriya/image1.jpeg', alt: location.name },
        ],
      }
    : null;

  // Load persistent like state
  useEffect(() => {
    if (location?.id) {
      const savedLike = localStorage.getItem(`like_${location.id}`);
      setLiked(savedLike === 'true');
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, [location?.id]);

  // Handle destination audio instance
  useEffect(() => {
    if (cardData?.audioSrc) {
      const audio = new Audio(cardData.audioSrc);
      audio.volume = 0.6;
      audio.muted = isMuted;
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        onAudioPlayStateChange?.(false);
      };

      return () => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = null;
        onAudioPlayStateChange?.(false);
      };
    }
  }, [cardData?.audioSrc, onAudioPlayStateChange]);

  // Sync mute state with destination audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onAudioPlayStateChange?.(false);
    } else {
      if (isMuted && onUnmute) {
        onUnmute();
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onAudioPlayStateChange?.(true);
        })
        .catch((err) => {
          console.warn('Playback error or restricted:', err);
        });
    }
  };

  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    if (location?.id) {
      localStorage.setItem(`like_${location.id}`, newLiked ? 'true' : 'false');
    }
  };

  // Gallery Navigation
  const galleryItems = cardData?.galleryItems || [];
  const goToNext = () => {
    if (galleryItems.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
    }
  };

  const goToPrev = () => {
    if (galleryItems.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
    }
  };

  // Touch Swipe Handlers (Mobile)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;
    if (swipeDistance > swipeThreshold) {
      goToNext();
    } else if (swipeDistance < -swipeThreshold) {
      goToPrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse Drag Handlers (Desktop)
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
    const dragThreshold = 40;
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

  if (!location || !cardData) return null;

  const currentMedia = galleryItems[currentIndex];

  return (
    <aside className="destination-card-overlay" aria-label="Destination Information Card">
      <div
        className={`destination-card ${cardData.cardClass || ''}`}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.68)), url("${cardData.bgImage}")`,
        }}
      >
        {/* Hierarchical Breadcrumb Navigation (WEB-7.2) */}
        <nav className="destination-breadcrumbs" aria-label="Location Hierarchy Breadcrumbs">
          <span className="breadcrumb-category">
            {location.categoryName || 'Sri Lanka Destination'}
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-subcategory">
            {location.subcategoryName || 'Scenic Site'}
          </span>
        </nav>

        {/* Header */}
        <div className="destination-card-header">
          <h2
            className="destination-card-title"
            style={{ color: cardData.titleColor || '#0f172a' }}
          >
            {cardData.title}
          </h2>
          <button
            onClick={onClose}
            className="destination-card-close"
            aria-label="Close destination details"
          >
            ✕
          </button>
        </div>

        {/* Immersive Theme Music Live Banner */}
        {musicTheme && (
          <div className="destination-theme-banner" title={musicTheme.description}>
            <div className="theme-equalizer">
              <span className={`eq-bar eq-1 ${!isMuted ? 'animate-eq' : ''}`}></span>
              <span className={`eq-bar eq-2 ${!isMuted ? 'animate-eq' : ''}`}></span>
              <span className={`eq-bar eq-3 ${!isMuted ? 'animate-eq' : ''}`}></span>
            </div>
            <div className="theme-info">
              <span className="theme-label">
                {isMuted ? '🔇 Audio Muted' : '🎵 Immersive Sound Theme'}
              </span>
              <span className="theme-name">{musicTheme.title}</span>
            </div>
          </div>
        )}

        {/* Swipeable Gallery */}
        <div
          className="destination-gallery"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {currentMedia?.type === 'video' ? (
            <video
              className="destination-gallery-media"
              src={currentMedia.src}
              autoPlay
              loop
              muted
              playsInline
              key={currentMedia.src}
            />
          ) : (
            <img
              className="destination-gallery-media"
              src={currentMedia?.src}
              alt={currentMedia?.alt || cardData.title}
              draggable="false"
              key={currentMedia?.src}
            />
          )}

          {/* Left/Right Arrow Overlays */}
          {galleryItems.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-left"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                aria-label="Previous image"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-right"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next image"
              >
                <FaChevronRight size={12} />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {galleryItems.length > 1 && (
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
                    className={`swipe-dot ${index === currentIndex ? 'active' : ''}`}
                    style={{ width: size, height: size }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="destination-description">{cardData.description}</p>

        {/* Audio & Heart Actions */}
        <div className="destination-actions">
          {cardData.audioSrc && (
          <button
            className={`destination-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={toggleAudio}
            style={{
              backgroundColor: isPlaying ? undefined : cardData.btnColor || '#2E7D32',
            }}
          >
            {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
            <span>{isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
          </button>
          )}

          <button
            className={`destination-heart-btn ${liked ? 'liked' : ''}`}
            onClick={toggleLike}
            aria-label="Like destination"
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Explore Full Destination Showcase Link */}
        {cardData.route && (
          <Link to={cardData.route} className="destination-showcase-btn">
            <span>Explore Full Showcase</span>
            <span className="arrow">→</span>
          </Link>
        )}

        {/* Reset Camera View Button */}
        <button className="destination-reset-btn" onClick={onClose}>
          Reset 3D Map View
        </button>
      </div>
    </aside>
  );
}
