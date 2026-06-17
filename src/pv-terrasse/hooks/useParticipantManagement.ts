import { useState, useRef, useEffect } from "react";
import { createParticipants, uid } from "../helpers";
import type { Participant, Reserve, Step5Errors } from "../types";

export const useParticipantManagement = (
  toast: (msg: string, type?: string) => void,
  reserves: Reserve[],
) => {
  const [participants, setParticipants] = useState<Participant[]>(createParticipants);
  const [step5Errors, setStep5Errors] = useState<Step5Errors>({ nom: false, sig: false });
  const canvasElements = useRef<(HTMLCanvasElement | undefined)[]>([]);

  useEffect(() => {
    const reception = reserves.length > 0 ? "NON" : "OUI";
    setParticipants((prev) => prev.map((participant) => ({ ...participant, reception })));
  }, [reserves.length]);

  const addParticipant = () => {
    if (participants.length >= 4) {
      toast("Maximum 3 participants additionnels", "error");
      return;
    }
    setParticipants((prev) => [...prev, createParticipants()[0]]);
  };

  const updateParticipant = (id: number, key: string, value: string | boolean) => {
    setParticipants((prev) =>
      prev.map((participant) => (participant.id === id ? { ...participant, [key]: value } : participant)),
    );
  };

  const removeParticipant = (id: number) => {
    if (participants.length > 1) {
      setParticipants((prev) => prev.filter((participant) => participant.id !== id));
    }
  };

  const captureSignatures = (): Participant[] =>
    participants.map((participant, index) => {
      const canvas = canvasElements.current[index];
      if (!canvas) return { ...participant, signed: false, sigDataUrl: null };

      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;

      const dataUrl = canvas.toDataURL("image/png");
      const isBlank = dataUrl === blank.toDataURL("image/png");

      return {
        ...participant,
        sigDataUrl: isBlank ? null : dataUrl,
        signed: !isBlank,
      };
    });

  const resetParticipants = () => {
    setParticipants(createParticipants());
    setStep5Errors({ nom: false, sig: false });
    canvasElements.current = [];
  };

  return {
    participants,
    setParticipants,
    step5Errors,
    setStep5Errors,
    canvasElements,
    addParticipant,
    updateParticipant,
    removeParticipant,
    captureSignatures,
    resetParticipants,
  };
};
