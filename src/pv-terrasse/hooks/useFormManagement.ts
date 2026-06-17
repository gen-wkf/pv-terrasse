import { useState } from "react";
import { createInitialForm, createInitialEtatSurface, createInitialPartieCourante, createInitialReleves, createInitialPoints } from "../helpers";
import type { EtatSurface, Form, Participant, PartieCourante, Points, PV, Releves, Reserve, SavedPVRef } from "../types";

export const useFormManagement = () => {
  const [form, setForm] = useState<Form>(createInitialForm);
  const [etatSurface, setEtatSurface] = useState<EtatSurface>(createInitialEtatSurface);
  const [partieCourante, setPartieCourante] = useState<PartieCourante>(createInitialPartieCourante);
  const [releves, setReleves] = useState<Releves>(createInitialReleves);
  const [points, setPoints] = useState<Points>(createInitialPoints);
  const [savedPV, setSavedPV] = useState<SavedPVRef | null>(null);
  const [editPvId, setEditPvId] = useState<number | null>(null);

  const resetForm = () => {
    setForm(createInitialForm());
    setEtatSurface(createInitialEtatSurface());
    setPartieCourante(createInitialPartieCourante());
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
    setPartieCourante(pv.partieCourante || createInitialPartieCourante());
    setReleves(pv.releves || createInitialReleves());
    setPoints(pv.points || createInitialPoints());
    setEditPvId(pv.id);
  };

  const getCurrentPVData = (reserves: Reserve[], participants: Participant[]) => ({
    form: { ...form },
    reserves: [...reserves],
    etatSurface: { ...etatSurface },
    partieCourante: { ...partieCourante },
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
    partieCourante,
    setPartieCourante,
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
