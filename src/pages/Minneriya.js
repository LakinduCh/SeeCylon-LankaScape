import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import "../minneriya.css";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import minneriyaVideo from "../assets/minneriya.mp4";
import minneriya1 from "../assets/minneriya 1.jpeg";
import minneriya2 from "../assets/minneriya 2.jpeg";
import minneriya3 from "../assets/minneriya 3.jpeg";
import minneriya4 from "../assets/minneriya 4.jpeg";

const galleryItems = [
	{ type: "video", src: minneriyaVideo, poster: minneriya1 },
	{ type: "image", src: minneriya1 },
	{ type: "image", src: minneriya2 },
	{ type: "image", src: minneriya3 },
	{ type: "image", src: minneriya4 },
];

function MinneriyaPage() {
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
				console.warn("Minneriya video playback failed:", error);
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
			<div className="card minneriya-card">
				<h1 className="title minneriya-title">Minneriya</h1>

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
							alt={`Minneriya National Park ${currentIndex}`}
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
					Minneriya National Park is known for its vast reservoir, rich wildlife,
					and seasonal gatherings of elephants. Explore open grasslands and
					forest landscapes in the heart of Sri Lanka.
				</p>

				<div className="audio-buttons">
					<button
						className={`play-btn ${isPlaying ? "playing" : ""}`}
						onClick={toggleVideo}
						aria-label={isPlaying ? "Pause Minneriya video" : "Play Minneriya video"}
					>
						{isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
						{isPlaying ? "Pause" : "Play"}
					</button>
				</div>

				<button
					className={`heart-btn ${liked ? "liked" : ""}`}
					onClick={() => setLiked((previous) => !previous)}
					aria-label={liked ? "Unlike Minneriya" : "Like Minneriya"}
				>
					{liked ? <FaHeart /> : <FaRegHeart />}
				</button>
			</div>
		</div>
	);
}

export default MinneriyaPage;
