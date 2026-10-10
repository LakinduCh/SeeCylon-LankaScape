import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import DestinationWrapper from './components/DestinationWrapper.jsx';

import YalaPage from './pages/Yala';
import SigiriyaPage from './pages/Sigiriya';
import ArugambayPage from './pages/Arugambay';
import MirissaPage from './pages/Mirissa';
import GalleFortPage from './pages/Gallefort';
import HortonPlainsPage from './pages/HortonPlains';
import NineArchBridgePage from './pages/Ninearch';
import AdamsPeakPage from "./pages/Adam'sPeak";
import DelftPage from './pages/Delft';
import KandyPage from './pages/Kandy';
import LotusTowerPage from './pages/LotusTower';
import PinnawalaPage from './pages/Pinnawala';
import WilpattuPage from './pages/Wilpattu';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/map" element={<App />} />
        <Route
          path="/yala"
          element={
            <DestinationWrapper>
              <YalaPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/sigiriya"
          element={
            <DestinationWrapper>
              <SigiriyaPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/arugambay"
          element={
            <DestinationWrapper>
              <ArugambayPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/mirissa"
          element={
            <DestinationWrapper>
              <MirissaPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/galle-fort"
          element={
            <DestinationWrapper>
              <GalleFortPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/horton-plains"
          element={
            <DestinationWrapper>
              <HortonPlainsPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/nine-arch"
          element={
            <DestinationWrapper>
              <NineArchBridgePage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/adams-peak"
          element={
            <DestinationWrapper>
              <AdamsPeakPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/delft"
          element={
            <DestinationWrapper>
              <DelftPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/kandy"
          element={
            <DestinationWrapper>
              <KandyPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/lotus-tower"
          element={
            <DestinationWrapper>
              <LotusTowerPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/pinnawala"
          element={
            <DestinationWrapper>
              <PinnawalaPage />
            </DestinationWrapper>
          }
        />
        <Route
          path="/wilpattu"
          element={
            <DestinationWrapper>
              <WilpattuPage />
            </DestinationWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
