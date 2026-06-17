import { useState } from "react";
import { pickImages, uid } from "../helpers";
import type { Photo, Reserve, ReserveForm } from "../types";

const EMPTY_RESERVE_FORM: ReserveForm = { localisation: "", detail: "", photos: [], localisationPhoto: null };

export const useReserveManagement = (toast: (msg: string, type?: string) => void) => {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [rForm, setRForm] = useState<ReserveForm>(EMPTY_RESERVE_FORM);
  const [editResId, setEditResId] = useState<number | null>(null);
  const [detailErr, setDetailErr] = useState<boolean>(false);

  const addPhotoToResCard = async (id: number) => {
    const images = await pickImages();
    if (!images.length) return;
    setReserves((prev) =>
      prev.map((reserve) =>
        reserve.id === id ? { ...reserve, photos: [...(reserve.photos || []), ...images] } : reserve,
      ),
    );
    toast(`${images.length} photo(s) ajoutée(s)`, "success");
  };

  const deleteRes = (id: number) => {
    setReserves((prev) => prev.filter((reserve) => reserve.id !== id));
    toast("Réserve supprimée", "error");
  };

  const openEditRes = (reserve: Reserve) => {
    setRForm({
      localisation: reserve.localisation || "",
      detail: reserve.detail || "",
      photos: [...(reserve.photos || [])],
      localisationPhoto: reserve.localisationPhoto || null,
    });
    setDetailErr(false);
    setEditResId(reserve.id);
  };

  const openAddRes = () => {
    setRForm(EMPTY_RESERVE_FORM);
    setDetailErr(false);
    setEditResId(null);
  };

  const saveReserve = (): boolean => {
    if (!rForm.detail.trim()) {
      setDetailErr(true);
      toast("Le détail est requis", "error");
      return false;
    }

    setDetailErr(false);
    if (editResId) {
      setReserves((prev) =>
        prev.map((reserve) => (reserve.id === editResId ? { ...reserve, ...rForm } : reserve)),
      );
      toast("Réserve mise à jour !", "success");
    } else {
      setReserves((prev) => [...prev, { id: uid(), ...rForm }]);
      toast("Réserve ajoutée !", "success");
    }
    return true;
  };

  const updateRFormLocalisationPhotoUrl = (newUrl: string) => {
    setRForm((current) => ({
      ...current,
      localisationPhoto: current.localisationPhoto
        ? { ...current.localisationPhoto, url: newUrl }
        : { id: uid(), url: newUrl },
    }));
  };

  const saveAndAddAnother = () => {
    if (!rForm.detail.trim()) {
      setDetailErr(true);
      toast("Le détail est requis", "error");
      return;
    }

    setDetailErr(false);
    if (editResId) {
      setReserves((prev) =>
        prev.map((reserve) => (reserve.id === editResId ? { ...reserve, ...rForm } : reserve)),
      );
    } else {
      setReserves((prev) => [...prev, { id: uid(), ...rForm }]);
    }
    setRForm(EMPTY_RESERVE_FORM);
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

  const removeRFormPhoto = (id: number) => {
    setRForm((current) => ({ ...current, photos: current.photos.filter((photo) => photo.id !== id) }));
  };

  const replaceRFormPhoto = async (id: number) => {
    const images = await pickImages();
    if (images.length) {
      setRForm((current) => ({
        ...current,
        photos: current.photos.map((photo) => (photo.id === id ? { ...photo, url: images[0].url } : photo)),
      }));
    }
  };

  const updateRFormPhotoUrl = (id: number, newUrl: string) => {
    setRForm((current) => ({
      ...current,
      photos: current.photos.map((photo: Photo) => (photo.id === id ? { ...photo, url: newUrl } : photo)),
    }));
  };

  const resetReserves = () => {
    setReserves([]);
    setRForm(EMPTY_RESERVE_FORM);
    setEditResId(null);
    setDetailErr(false);
  };

  return {
    reserves,
    setReserves,
    rForm,
    setRForm,
    editResId,
    setEditResId,
    detailErr,
    setDetailErr,
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
    updateRFormLocalisationPhotoUrl,
    resetReserves,
  };
};
