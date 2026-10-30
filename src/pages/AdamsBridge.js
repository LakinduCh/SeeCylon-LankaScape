import React from "react";
import DestinationCard from "../components/DestinationCard";
import "../adamsbridge.css";

import video from "../assets/adams bridge.mp4";
import image1 from "../assets/adams bridge.jpeg";
import image2 from "../assets/adam’s Bridge2.jpeg";
import image3 from "../assets/adams bridge3.jpeg";
import image4 from "../assets/Adam’s Bridge.jpeg";

const galleryItems = [
  { type: "video", src: video },
  { type: "image", src: image1, alt: "Adam’s Bridge" },
  { type: "image", src: image2, alt: "Adam’s Bridge from the coast" },
  { type: "image", src: image3, alt: "Adam’s Bridge and shallow waters" },
  { type: "image", src: image4, alt: "Adam’s Bridge seascape" },
];

function AdamsBridgePage() {
  return (
    <DestinationCard
      title="Adam’s Bridge"
      className="adams-bridge-card"
      galleryItems={galleryItems}
      description="Adam’s Bridge, also known as Rama’s Bridge or Ram Setu, is a chain of shallow shoals and sandbanks in the sea between Mannar Island in Sri Lanka and India. The pale formations stand out against the surrounding blue water, creating a striking coastal landscape best appreciated from a distance. The area is also notable for its rich natural and cultural associations, making it a fascinating part of the island’s north-western seascape."
    />
  );
}

export default AdamsBridgePage;
