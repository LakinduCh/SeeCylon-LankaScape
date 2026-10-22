import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import "../anuradhapura.css";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import anuradhapuraVideo from "../assets/anuradhapura.mp4";
import anuradhapura1 from "../assets/anuradhapura.jpeg";
import anuradhapura2 from "../assets/anuradhapura 1.jpeg";
import anuradhapura3 from "../assets/anuradhapura 2.jpeg";
import anuradhapura4 from "../assets/anuradhapura 3.jpeg";
import anuradhapura5 from "../assets/anuradhapura 4.jpeg";

const galleryItems = [
	{ type: "video", src: anuradhapuraVideo, poster: anuradhapura1 },
	{ type: "image", src: anuradhapura1 },
	{ type: "image", src: anuradhapura2 },
	{ type: "image", src: anuradhapura3 },
	{ type: "image", src: anuradhapura4 },
	{ type: "image", src: anuradhapura5 },
];

function AnuradhapuraPage() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [liked, setLiked] = useState(false);
	const videoRef = useRef(null);
	const touchStartX = useRef(0);
	const touchEndX = useRef(0);
	const dragStartX = useRef(0);
	const dragEndX = useRef(0);
	const isDragging = useRef(false);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying) {
			video.muted = false;
			video.play().catch((error) => {
				console.warn("Anuradhapura video playback failed:", error);
				setIsPlaying(false);
			});
		} else {
			video.pause();
		}
	}, [currentIndex, isPlaying]);

	const changeSlide = (index) => {
		setCurrentIndex(index);
		setIsPlaying(false);
	};

	const goToNext = () => {
		changeSlide((currentIndex + 1) % galleryItems.length);
	};

	const goToPrev = () => {
		changeSlide(currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1);
	};

	const handleTouchEnd = () => {
		const distance = touchStartX.current - touchEndX.current;
		if (distance > 50) goToNext();
		else if (distance < -50) goToPrev();
		touchStartX.current = 0;
		touchEndX.current = 0;
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

	const toggleVideo = () => {
		if (currentIndex !== 0) {
			setCurrentIndex(0);
			setIsPlaying(true);
			return;
		}
		setIsPlaying((previous) => !previous);
	};

	const currentSlide = galleryItems[currentIndex];

	return (
		<div className="container">
			<div className="card anuradhapura-card">
				<h1 className="title anuradhapura-title">Anuradhapura</h1>

				<div
					className="gallery"
					onTouchStart={(event) => {
						touchStartX.current = event.touches[0].clientX;
					}}
					onTouchMove={(event) => {
						touchEndX.current = event.touches[0].clientX;
					}}
					onTouchEnd={handleTouchEnd}
					onMouseDown={(event) => {
						isDragging.current = true;
						dragStartX.current = event.clientX;
					}}
					onMouseMove={(event) => {
						if (isDragging.current) dragEndX.current = event.clientX;
					}}
					onMouseUp={handleMouseUp}
					onMouseLeave={() => {
						isDragging.current = false;
					}}
				>
					{currentSlide.type === "video" ? (
						<video
							ref={videoRef}
							className="gallery-image"
							src={currentSlide.src}
							poster={currentSlide.poster}
							loop
							playsInline
						/>
					) : (
						<img
							className="gallery-image"
							src={currentSlide.src}
							alt={`Anuradhapura ${currentIndex}`}
							draggable="false"
						/>
					)}

					<div className="gallery-dots">
						{galleryItems.map((_, index) => {
							const distance = Math.abs(index - currentIndex);
							const size = distance === 0 ? 9 : distance === 1 ? 7 : distance === 2 ? 5 : 4;

							return (
								<button
									key={index}
									type="button"
									className={`swipe-dot ${index === currentIndex ? "active" : ""}`}
									style={{ width: size, height: size }}
									onClick={() => changeSlide(index)}
									aria-label={`Show slide ${index + 1}`}
								/>
							);
						})}
					</div>
				</div>

				<p className="description">
					Anuradhapura is an ancient capital of Sri Lanka, celebrated for its sacred
					sites, colossal stupas, and remarkable ruins. Discover a city shaped by
					centuries of history and devotion.
				</p>

				<div className="audio-buttons">
					<button
						className={`play-btn ${isPlaying ? "playing" : ""}`}
						onClick={toggleVideo}
						aria-label={isPlaying ? "Pause Anuradhapura video" : "Play Anuradhapura video"}
					>
						{isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
						{isPlaying ? "Pause" : "Play"}
					</button>
				</div>

				<button
					className={`heart-btn ${liked ? "liked" : ""}`}
					onClick={() => setLiked((previous) => !previous)}
					aria-label={liked ? "Unlike Anuradhapura" : "Like Anuradhapura"}
				>
					{liked ? <FaHeart /> : <FaRegHeart />}
				</button>
			</div>
		</div>
	);
}

export default AnuradhapuraPage;
