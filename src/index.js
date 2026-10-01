import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import YalaPage from "./pages/Yala";
import SigiriyaPage from "./pages/Sigiriya";
import ArugambayPage from "./pages/Arugambay";
import MirissaPage from "./pages/Mirissa";
import GalleFortPage from "./pages/GalleFort";
import HortonPlainsPage from "./pages/HortonPlains";
import NineArchBridgePage from "./pages/Ninearch";
import AdamsPeakPage from "./pages/Adam'sPeak";
import DelftPage from "./pages/Delft";
import KandyPage from "./pages/Kandy";
import LotusTowerPage from "./pages/LotusTower";
import PinnawalaPage from "./pages/Pinnawala";
import WilpattuPage from "./pages/Wilpattu";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/yala" replace />} />
        <Route path="/yala" element={<YalaPage />} />
        <Route path="/sigiriya" element={<SigiriyaPage />} />
        <Route path="/arugambay" element={<ArugambayPage />} />
        <Route path="/mirissa" element={<MirissaPage />} />
        <Route path="/galle-fort" element={<GalleFortPage />} />
        <Route path="/horton-plains" element={<HortonPlainsPage />} />
        <Route path="/nine-arch" element={<NineArchBridgePage />} />
        <Route path="/adams-peak" element={<AdamsPeakPage />} />
        <Route path="/delft" element={<DelftPage />} />
        <Route path="/kandy" element={<KandyPage />} />
        <Route path="/lotus-tower" element={<LotusTowerPage />} />
        <Route path="/pinnawala" element={<PinnawalaPage />} />
        <Route path="/wilpattu" element={<WilpattuPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();