import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import "../nallur.css";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

import nallurVideo from "../assets/nallur.mp4";
import nallur1 from "../assets/nallur 1.jpeg";
import nallur2 from "../assets/nallur 2.jpeg";
import nallur3 from "../assets/nallur 3.jpeg";
import nallur4 from "../assets/nallur 4.jpeg";

const galleryItems = [
	{ type: "video", src: nallurVideo, poster: nallur1 },
	{ type: "image", src: nallur1 },
	{ type: "image", src: nallur2 },
	{ type: "image", src: nallur3 },
	{ type: "image", src: nallur4 },
];

function NallurPage() {
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
				console.warn("Nallur video playback failed:", error);
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
			<div className="card nallur-card">
				<h1 className="title nallur-title">Nallur Kovil</h1>

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
							alt={`Nallur Kovil ${currentIndex}`}
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
					Nallur Kandaswamy Kovil is one of Jaffna&apos;s most revered Hindu temples.
					Its striking architecture and vibrant annual festival make it a treasured
					place of worship and culture.
				</p>

				<div className="audio-buttons">
					<button
						className={`play-btn ${isPlaying ? "playing" : ""}`}
						onClick={toggleVideo}
						aria-label={isPlaying ? "Pause Nallur video" : "Play Nallur video"}
					>
						{isPlaying ? <FaPause className="icon" /> : <FaPlay className="icon" />}
						{isPlaying ? "Pause" : "Play"}
					</button>
				</div>

				<button
					className={`heart-btn ${liked ? "liked" : ""}`}
					onClick={() => setLiked((previous) => !previous)}
					aria-label={liked ? "Unlike Nallur Kovil" : "Like Nallur Kovil"}
				>
					{liked ? <FaHeart /> : <FaRegHeart />}
				</button>
			</div>
		</div>
	);
}

export default NallurPage;
