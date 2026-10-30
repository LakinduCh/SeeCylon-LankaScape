import React from "react";
import DestinationCard from "../components/DestinationCard";
import "../Hiriketiya.css";

import video from "../assets/hiriketiya.mp4";
import image1 from "../assets/hiriketiya1.jpeg";
import image2 from "../assets/hiriketiya2.jpeg";
import image3 from "../assets/hiriketiya3.jpeg";
import image4 from "../assets/hiriketiya4.jpeg";

const galleryItems = [
  { type: "video", src: video },
  { type: "image", src: image1, alt: "Hiriketiya beach" },
  { type: "image", src: image2, alt: "Hiriketiya coastline" },
  { type: "image", src: image3, alt: "Hiriketiya bay" },
  { type: "image", src: image4, alt: "Hiriketiya beach scenery" },
];

function HiriketiyaPage() {
  return (
    <DestinationCard
      title="Hiriketiya"
      className="hiriketiya-card"
      galleryItems={galleryItems}
      description="Hiriketiya is a small, crescent-shaped bay on Sri Lanka’s southern coast, near the town of Dikwella. Palm-fringed sands curve around clear water, creating a scenic setting for a swim or a slow afternoon by the shore. The bay is also a popular surf spot, with waves that draw both learners and experienced surfers, while nearby cafés give the village its laid-back, welcoming feel."
    />
  );
}

export default HiriketiyaPage;