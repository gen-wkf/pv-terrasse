import { useState } from "react";
import { createInitialForm, createInitialEtatSurface, createInitialReleves, createInitialPoints } from "../helpers";
import type { EtatSurface, Form, Participant, Points, PV, Releves, Reserve, SavedPVRef } from "../types";

export const useFormManagement = () => {
  const [form, setForm] = useState<Form>(createInitialForm);
  const [etatSurface, setEtatSurface] = useState<EtatSurface>(createInitialEtatSurface);
  const [releves, setReleves] = useState<Releves>(createInitialReleves);
  const [points, setPoints] = useState<Points>(createInitialPoints);
  const [savedPV, setSavedPV] = useState<SavedPVRef | null>(null);
  const [editPvId, setEditPvId] = useState<number | null>(null);

  const resetForm = () => {
    setForm(createInitialForm());
    setEtatSurface(createInitialEtatSurface());
    setReleves(createInitialReleves());
    setPoints(createInitialPoints());
    setSavedPV(null);
    setEditPvId(null);
  };

  const loadPVIntoForm = (pv: PV) => {
    setForm({
      agence: pv.agency || "",
      etablissement: pv.etablissement || "",
      chantier: pv.name || "",
      zone: pv.zone || "",
      date: pv.date || "",
      responsable: pv.responsable || "",
    });
    setEtatSurface(pv.etatSurface || createInitialEtatSurface());
    setReleves(pv.releves || createInitialReleves());
    setPoints(pv.points || createInitialPoints());
    setEditPvId(pv.id);
  };

  const getCurrentPVData = (reserves: Reserve[], participants: Participant[]) => ({
    form: { ...form },
    reserves: [...reserves],
    etatSurface: { ...etatSurface },
    releves: { ...releves },
    points: { ...points },
    participants,
    savedPV,
  });

  return {
    form,
    setForm,
    etatSurface,
    setEtatSurface,
    releves,
    setReleves,
    points,
    setPoints,
    savedPV,
    setSavedPV,
    editPvId,
    setEditPvId,
    resetForm,
    loadPVIntoForm,
    getCurrentPVData,
  };
};
