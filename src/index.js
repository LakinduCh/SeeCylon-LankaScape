import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import YalaPage from "./pages/YalaPage";
import SigiriyaPage from "./pages/SigiriyaPage";
import ArugambayPage from "./pages/ArugambayPage";
import MirissaPage from "./pages/MirissaPage";
import GalleFortPage from "./pages/Gallefort";
import HortonPlainsPage from "./pages/HortonPlains";
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
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
