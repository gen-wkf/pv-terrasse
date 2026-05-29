import { formatPVTimestamp, genPVRef, uid } from "../helpers.js";

export const buildCurrentPVData = (form, reserves, etatSurface, releves, points, participants, savedPV) => ({
  form: { ...form },
  reserves: [...reserves],
  etatSurface: { ...etatSurface },
  releves: { ...releves },
  points: { ...points },
  participants,
  savedPV,
});

export const usePVOperations = () => {
  const savePV = (pvList, setPvList, form, reserves, etatSurface, releves, points, capturedParticipants, editPvId, toast) => {
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
      participants: capturedParticipants,
    };

    if (editPvId) {
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
                participants: capturedParticipants,
                savedDate: dateStr,
                versions: [...(pv.versions || []), snapshot],
              }
            : pv,
        ),
      );
      return { ref, dateStr, chantier: form.chantier || "Nouveau Chantier", isEdit: true, pv: { ...existing, name: form.chantier || existing?.name, agency: form.agence || existing?.agency, date: dateStr, reserves: [...reserves], etatSurface: { ...etatSurface }, releves: { ...releves }, points: { ...points }, participants: capturedParticipants, savedRef: ref } };
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
      participants: capturedParticipants,
      savedRef: ref,
      savedDate: dateStr,
      versions: [snapshot],
    };

    setPvList((list) => [newPV, ...list]);
    return { ref, dateStr, chantier: form.chantier || "Nouveau Chantier", isEdit: false, pv: newPV };
  };

  return {
    savePV,
  };
};
