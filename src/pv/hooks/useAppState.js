import { useState } from "react";

export const useAppState = () => {
  const [screen, setScreen] = useState("splash");
  const [step, setStep] = useState(1);
  const [showQuit, setShowQuit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [viewPV, setViewPV] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [photoMenu, setPhotoMenu] = useState(null);
  const [annotPhoto, setAnnotPhoto] = useState(null);
  const [reserveScreen, setReserveScreen] = useState("list");
  const [gallery, setGallery] = useState(null);

  return {
    screen,
    setScreen,
    step,
    setStep,
    showQuit,
    setShowQuit,
    showProfile,
    setShowProfile,
    lightbox,
    setLightbox,
    viewPV,
    setViewPV,
    pdfData,
    setPdfData,
    photoMenu,
    setPhotoMenu,
    annotPhoto,
    setAnnotPhoto,
    reserveScreen,
    setReserveScreen,
    gallery,
    setGallery,
  };
};
