import { useState } from "react";
import { createInitialForm, createInitialEtatSurface, createInitialReleves, createInitialPoints } from "../helpers.js";

export const useFormManagement = () => {
  const [form, setForm] = useState(createInitialForm);
  const [etatSurface, setEtatSurface] = useState(createInitialEtatSurface);
  const [releves, setReleves] = useState(createInitialReleves);
  const [points, setPoints] = useState(createInitialPoints);
  const [savedPV, setSavedPV] = useState(null);
  const [editPvId, setEditPvId] = useState(null);

  const resetForm = () => {
    setForm(createInitialForm());
    setEtatSurface(createInitialEtatSurface());
    setReleves(createInitialReleves());
    setPoints(createInitialPoints());
    setSavedPV(null);
    setEditPvId(null);
  };

  const loadPVIntoForm = (pv) => {
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

  const getCurrentPVData = (reserves, participants) => ({
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
