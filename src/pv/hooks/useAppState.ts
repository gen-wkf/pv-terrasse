import { useState } from "react";
import type { AnnotPhotoState, GalleryState, PdfData, PhotoMenuState, PV } from "../types";

export const useAppState = () => {
  const [screen, setScreen] = useState<string>("splash");
  const [step, setStep] = useState<number>(1);
  const [showQuit, setShowQuit] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [viewPV, setViewPV] = useState<PV | null>(null);
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [photoMenu, setPhotoMenu] = useState<PhotoMenuState | null>(null);
  const [annotPhoto, setAnnotPhoto] = useState<AnnotPhotoState | null>(null);
  const [reserveScreen, setReserveScreen] = useState<string>("list");
  const [gallery, setGallery] = useState<GalleryState | null>(null);

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
