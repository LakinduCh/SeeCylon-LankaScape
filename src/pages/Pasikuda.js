import React from "react";
import DestinationCard from "../components/DestinationCard";
import "../Pasikuda.css";

import video from "../assets/pasikuda.mp4";
import image1 from "../assets/pasikuda4.jpeg";
import image2 from "../assets/Pasikudah2.jpeg";
import image3 from "../assets/pasikuda3.jpeg";
import image4 from "../assets/Pasikuda1.jpeg";

const galleryItems = [
  { type: "video", src: video },
  { type: "image", src: image1, alt: "Pasikuda beach" },
  { type: "image", src: image2, alt: "Pasikuda coast" },
  { type: "image", src: image3, alt: "Pasikuda bay" },
  { type: "image", src: image4, alt: "Pasikuda beach scenery" },
];

function PasikudaPage() {
  return (
    <DestinationCard
      title="Pasikuda"
      className="pasikuda-card"
      galleryItems={galleryItems}
      description="Pasikuda, on Sri Lanka’s eastern coast near Batticaloa, is famed for its long sweep of pale sand and clear, shallow water. The gently sloping bay is ideal for a relaxed swim and an unhurried day by the sea. Take in the open coastline, watch the light shift across the water, and enjoy a quieter side of the island’s east coast."
    />
  );
}

export default PasikudaPage;