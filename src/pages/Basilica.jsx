import React from "react";
import DestinationCard from "../components/DestinationPageCard";
import "../Basilica.css";

import video from "../assets/basilica.mp4";
import image1 from "../assets/basilica.jpg";
import image2 from "../assets/basilica1.jpeg";
import image3 from "../assets/basilica5.jpg";
import image4 from "../assets/basilica6.jpg";

const galleryItems = [
  { type: "video", src: video },
  { type: "image", src: image1, alt: "Basilica exterior" },
  { type: "image", src: image2, alt: "Basilica architecture" },
  { type: "image", src: image3, alt: "Basilica details" },
  { type: "image", src: image4, alt: "Basilica interior" },
];

function BasilicaPage() {
  return (
    <DestinationCard
      title="Basilica"
      className="basilica-card"
      galleryItems={galleryItems}
      description="The Basilica of Our Lady of Lanka at Tewatte, near Ragama, is one of Sri Lanka’s best-known Catholic pilgrimage sites. Its spacious design brings together traditional basilica features with local artistic influences, creating a distinctive place for prayer and reflection. Visitors can admire the architecture, take in the peaceful grounds, and learn about the devotion that draws pilgrims here throughout the year."
    />
  );
}

export default BasilicaPage;