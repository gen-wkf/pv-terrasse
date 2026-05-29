import { useEffect, useRef, useState } from "react";
import {
  createInitialEtatSurface,
  createInitialForm,
  createInitialPoints,
  createInitialReleves,
  createPdfDataFromPV,
  createParticipants,
  formatPVTimestamp,
  genPVRef,
  pickImages,
  uid,
  useToast,
} from "./helpers.js";
import { SAMPLE_PVS } from "./schema.js";

const INITIAL_RESERVE_FORM = {
  localisation: "",
  detail: "",
  photos: [],
  localisationPhoto: null,
};

const buildCurrentPVData = (form, reserves, etatSurface, releves, points, participants, savedPV) => ({
  form: { ...form },
  reserves: [...reserves],
  etatSurface: { ...etatSurface },
  releves: { ...releves },
  points: { ...points },
  participants,
  savedPV,
});

export function usePvAppController() {
  const [screen, setScreen] = useState("splash");
  const [pvList, setPvList] = useState(SAMPLE_PVS);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [showQuit, setShowQuit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [viewPV, setViewPV] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [photoMenu, setPhotoMenu] = useState(null);
  const [annotPhoto, setAnnotPhoto] = useState(null);
  const [step5Errors, setStep5Errors] = useState({ nom: false, sig: false });
  const [form, setForm] = useState(createInitialForm);
  const [reserves, setReserves] = useState([]);
  const [reserveScreen, setReserveScreen] = useState("list");
  const [editResId, setEditResId] = useState(null);
  const [rForm, setRForm] = useState(INITIAL_RESERVE_FORM);
  const [detailErr, setDetailErr] = useState(false);
  const [etatSurface, setEtatSurface] = useState(createInitialEtatSurface);
  const [releves, setReleves] = useState(createInitialReleves);
  const [points, setPoints] = useState(createInitialPoints);
  const [participants, setParticipants] = useState(createParticipants);
  const [savedPV, setSavedPV] = useState(null);
  const [editPvId, setEditPvId] = useState(null);
  const canvasElements = useRef([]);

  const { toasts, push: toast } = useToast();

  useEffect(() => {
    if (screen !== "splash") return undefined;
    const timer = setTimeout(() => setScreen("home"), 2000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    const reception = reserves.length > 0 ? "NON" : "OUI";
    setParticipants((prev) => prev.map((participant) => ({ ...participant, reception })));
  }, [reserves.length]);

  const resetForm = () => {
    setForm(createInitialForm());
    setEtatSurface(createInitialEtatSurface());
    setReleves(createInitialReleves());
    setPoints(createInitialPoints());
    setParticipants(createParticipants());
    setReserves([]);
    setRForm(INITIAL_RESERVE_FORM);
    setStep5Errors({ nom: false, sig: false });
    canvasElements.current = [];
  };

  const startNewPV = () => {
    resetForm();
    setStep(1);
    setReserveScreen("list");
    setEditPvId(null);
    setScreen("form");
  };

  const startEditPV = (pv, event) => {
    event?.stopPropagation();
    resetForm();
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
    setReserves(pv.reserves ? pv.reserves.map((reserve) => ({ ...reserve, photos: [...(reserve.photos || [])] })) : []);
    setParticipants(
      pv.participants && pv.participants.length > 0
        ? pv.participants.map((participant) => ({
            ...participant,
            id: participant.id || uid(),
            titre: participant.titre || "",
            signed: false,
            sigDataUrl: null,
          }))
        : createParticipants(),
    );
    setStep(1);
    setReserveScreen("list");
    setEditPvId(pv.id);
    setViewPV(null);
    setScreen("form");
  };

  const goHome = () => {
    if (screen === "form") {
      setShowQuit(true);
      return;
    }
    setScreen("home");
    setViewPV(null);
  };

  const nextStep = () => {
    if (step < 6) setStep((current) => current + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((current) => current - 1);
  };

  const addParticipant = () => {
    if (participants.length >= 4) {
      toast("Maximum 3 participants additionnels", "error");
      return;
    }
    setParticipants((prev) => [...prev, createParticipants()[0]]);
  };

  const updateParticipant = (id, key, value) => {
    setParticipants((prev) => prev.map((participant) => (participant.id === id ? { ...participant, [key]: value } : participant)));
  };

  const removeParticipant = (id) => {
    if (participants.length > 1) {
      setParticipants((prev) => prev.filter((participant) => participant.id !== id));
    }
  };

  const captureSignatures = () =>
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

  const getCurrentPVData = (participantsOverride = participants) =>
    buildCurrentPVData(form, reserves, etatSurface, releves, points, participantsOverride, savedPV);

  const savePV = () => {
    const captured = captureSignatures();
    const smacParticipant = captured[0];
    const nomErr = !smacParticipant.nom.trim();
    const sigErr = !smacParticipant.signed && !smacParticipant.sigDataUrl;
    const additionalUnsigned = captured.slice(1).filter((participant) => participant.nom.trim().length > 0 && !participant.signed && !participant.sigDataUrl);

    if (nomErr || sigErr || additionalUnsigned.length > 0) {
      setStep5Errors({ nom: nomErr, sig: sigErr });
      if (nomErr) toast("Le nom du Participant SMAC est requis", "error");
      else if (sigErr) toast("La signature du Participant SMAC est requise", "error");
      else toast("La signature est requise pour tous les participants", "error");
      return;
    }

    setStep5Errors({ nom: false, sig: false });

    const now = new Date();
    const dateStr = formatPVTimestamp(now);
    const existing = editPvId ? pvList.find((pv) => pv.id === editPvId) : null;
    const ref = existing?.savedRef || genPVRef();

    const snapshot = {
      id: uid(),
      savedDate: dateStr,
      ref,
      chantier: form.chantier || "Nouveau Chantier",
      agency: form.agence || "",
      etablissement: form.etablissement || "",
      zone: form.zone || "",
      date: form.date || "",
      responsable: form.responsable || "",
      reserves: [...reserves],
      etatSurface: { ...etatSurface },
      releves: { ...releves },
      points: { ...points },
      participants: captured,
    };

    if (editPvId) {
      setSavedPV({ ref, date: dateStr, chantier: form.chantier || "Nouveau Chantier" });
      setPvList((list) =>
        list.map((pv) =>
          pv.id === editPvId
            ? {
                ...pv,
                name: form.chantier || pv.name,
                agency: form.agence || pv.agency,
                etablissement: form.etablissement || pv.etablissement,
                zone: form.zone || pv.zone || "",
                date: form.date || pv.date,
                responsable: form.responsable || pv.responsable,
                reserves: [...reserves],
                etatSurface: { ...etatSurface },
                releves: { ...releves },
                points: { ...points },
                participants: captured,
                savedDate: dateStr,
                versions: [...(pv.versions || []), snapshot],
              }
            : pv,
        ),
      );
      setStep(6);
      return;
    }

    const newPV = {
      id: uid(),
      num: ref,
      name: form.chantier || "Nouveau Chantier",
      agency: form.agence || "Agence",
      date: dateStr,
      etablissement: form.etablissement || "Établissement",
      zone: form.zone || "",
      responsable: form.responsable || "—",
      reserves: [...reserves],
      etatSurface: { ...etatSurface },
      releves: { ...releves },
      points: { ...points },
      participants: captured,
      savedRef: ref,
      savedDate: dateStr,
      versions: [snapshot],
    };

    setSavedPV({ ref, date: dateStr, chantier: form.chantier || "Nouveau Chantier" });
    setPvList((list) => [newPV, ...list]);
    setStep(6);
  };

  const addPhotoToResCard = async (id) => {
    const images = await pickImages();
    if (!images.length) return;
    setReserves((prev) => prev.map((reserve) => (reserve.id === id ? { ...reserve, photos: [...(reserve.photos || []), ...images] } : reserve)));
    toast(`${images.length} photo(s) ajoutée(s)`, "success");
  };

  const deleteRes = (id) => {
    setReserves((prev) => prev.filter((reserve) => reserve.id !== id));
    toast("Réserve supprimée", "error");
  };

  const openEditRes = (reserve) => {
    setRForm({
      localisation: reserve.localisation || "",
      detail: reserve.detail || "",
      photos: [...(reserve.photos || [])],
      localisationPhoto: reserve.localisationPhoto || null,
    });
    setDetailErr(false);
    setEditResId(reserve.id);
    setReserveScreen("edit");
  };

  const openAddRes = () => {
    setRForm(INITIAL_RESERVE_FORM);
    setDetailErr(false);
    setEditResId(null);
    setReserveScreen("add");
  };

  const saveReserve = () => {
    if (!rForm.detail.trim()) {
      setDetailErr(true);
      toast("Le détail est requis", "error");
      return;
    }

    setDetailErr(false);
    if (editResId) {
      setReserves((prev) => prev.map((reserve) => (reserve.id === editResId ? { ...reserve, ...rForm } : reserve)));
      toast("Réserve mise à jour !", "success");
    } else {
      setReserves((prev) => [...prev, { id: uid(), ...rForm }]);
      toast("Réserve ajoutée !", "success");
    }
    setReserveScreen("list");
  };

  const saveAndAddAnother = () => {
    if (!rForm.detail.trim()) {
      setDetailErr(true);
      toast("Le détail est requis", "error");
      return;
    }

    setDetailErr(false);
    if (editResId) {
      setReserves((prev) => prev.map((reserve) => (reserve.id === editResId ? { ...reserve, ...rForm } : reserve)));
    } else {
      setReserves((prev) => [...prev, { id: uid(), ...rForm }]);
    }
    setRForm(INITIAL_RESERVE_FORM);
    setEditResId(null);
    toast("Réserve sauvegardée !", "success");
  };

  const addOnePhoto = async () => {
    if (rForm.photos.length >= 8) {
      toast("Maximum 8 images par réserve", "error");
      return;
    }
    const images = await pickImages();
    if (images.length) {
      setRForm((current) => ({ ...current, photos: [...current.photos, images[0]] }));
    }
  };

  const pickLocalisationPhoto = async () => {
    const images = await pickImages();
    if (images.length) {
      setRForm((current) => ({ ...current, localisationPhoto: { id: uid(), url: images[0].url } }));
    }
  };

  const removeLocalisationPhoto = () => {
    setRForm((current) => ({ ...current, localisationPhoto: null }));
  };

  const removeRFormPhoto = (id) => {
    setRForm((current) => ({ ...current, photos: current.photos.filter((photo) => photo.id !== id) }));
  };

  const replaceRFormPhoto = async (id) => {
    const images = await pickImages();
    if (images.length) {
      setRForm((current) => ({
        ...current,
        photos: current.photos.map((photo) => (photo.id === id ? { ...photo, url: images[0].url } : photo)),
      }));
    }
  };

  const updateRFormPhotoUrl = (id, newUrl) => {
    setRForm((current) => ({
      ...current,
      photos: current.photos.map((photo) => (photo.id === id ? { ...photo, url: newUrl } : photo)),
    }));
  };

  const filteredPVs = pvList.filter(
    (pv) => pv.name.toLowerCase().includes(search.toLowerCase()) || pv.agency.toLowerCase().includes(search.toLowerCase()),
  );

  const openPDFForPV = (pv, event) => {
    event?.stopPropagation();
    setPdfData(createPdfDataFromPV(pv));
  };

  const showNavBar = step < 6 && reserveScreen === "list";

  return {
    screen,
    setScreen,
    pvList,
    setPvList,
    search,
    setSearch,
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
    step5Errors,
    setStep5Errors,
    form,
    setForm,
    reserves,
    setReserves,
    reserveScreen,
    setReserveScreen,
    editResId,
    setEditResId,
    rForm,
    setRForm,
    detailErr,
    setDetailErr,
    etatSurface,
    setEtatSurface,
    releves,
    setReleves,
    points,
    setPoints,
    participants,
    setParticipants,
    savedPV,
    setSavedPV,
    editPvId,
    setEditPvId,
    canvasElements,
    toasts,
    toast,
    resetForm,
    startNewPV,
    startEditPV,
    goHome,
    nextStep,
    prevStep,
    addParticipant,
    updateParticipant,
    removeParticipant,
    captureSignatures,
    getCurrentPVData,
    savePV,
    addPhotoToResCard,
    deleteRes,
    openEditRes,
    openAddRes,
    saveReserve,
    saveAndAddAnother,
    addOnePhoto,
    pickLocalisationPhoto,
    removeLocalisationPhoto,
    removeRFormPhoto,
    replaceRFormPhoto,
    updateRFormPhotoUrl,
    filteredPVs,
    openPDFForPV,
    showNavBar,
  };
}
