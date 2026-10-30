import React from "react";
import DestinationCard from "../components/DestinationCard";
import "../Nilaveli.css";

import video from "../assets/nilaveli.mp4";
import image1 from "../assets/nilaveli1.jpeg";
import image2 from "../assets/Nila.jpeg";
import image3 from "../assets/Nilaveli2.jpeg";
import image4 from "../assets/nilaveli4.jpeg";

const galleryItems = [
  { type: "video", src: video },
  { type: "image", src: image1, alt: "Nilaveli beach" },
  { type: "image", src: image2, alt: "Nilaveli shoreline" },
  { type: "image", src: image3, alt: "Nilaveli coast" },
  { type: "image", src: image4, alt: "Nilaveli beach scenery" },
];

function NilaveliPage() {
  return (
    <DestinationCard
      title="Nilaveli"
      className="nilaveli-card"
      galleryItems={galleryItems}
      description="Just north of Trincomalee, Nilaveli is a tranquil stretch of white sand bordered by the clear waters of Sri Lanka’s east coast. Its calm shoreline is a welcome place to swim, stroll, or simply pause beneath the palms. From the beach, visitors can take a boat to Pigeon Island National Park, where coral reefs and tropical fish make snorkeling a memorable way to explore the coast."
    />
  );
}

export default NilaveliPage;