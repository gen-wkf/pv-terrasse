// @refresh reset
import React, { useEffect } from "react";
import "./App.css";
import "./styles.css";
import { AnnotationModal, PDFViewer, PhotoGallery, PhotoMenu, ProfileModal } from "./components/index";
import { I } from "./icons";
import { CURRENT_USER, SAMPLE_PVS, SURFACE_FIELDS, PARTIE_COURANTE_FIELDS, RELEVES_FIELDS, POINT_FIELDS } from "./schema";
import {
  createPdfDataFromPV,
  downloadPDF,
  pickImages,
  uid,
  useToast,
} from "./helpers";
import {
  useAppState,
  useReserveManagement,
  useParticipantManagement,
  useFormManagement,
  usePVOperations,
} from "./hooks/index";
import {
  renderStep1,
  renderStep2,
  renderStep3,
  renderStep4,
  renderStep5,
} from "./components/StepRenderers";
import { renderStep6 } from "./components/ParticipantStepRenderer";
import { renderReserveCard, renderReserveContent, renderReserveList } from "./components/ReserveRenderer";
import { renderSplashScreen, renderHomeScreen } from "./components/ScreenRenderers";
import SuccessScreen from "./components/SuccessScreen";
import type { PV, Reserve, SavePVResult } from "./types";

export default function App() {
  const appState = useAppState();
  const { toasts, push: toast } = useToast();
  const [pvList, setPvList] = React.useState<PV[]>(SAMPLE_PVS);
  const [search, setSearch] = React.useState("");
  const [step2Errors, setStep2Errors] = React.useState<Record<string, { photo: boolean; comment: boolean }>>({});
  const [step3Errors, setStep3Errors] = React.useState<Record<string, { photo: boolean; comment: boolean }>>({});
  const [step4Errors, setStep4Errors] = React.useState<Record<string, { photo: boolean; comment: boolean }>>({});
  const [step5FieldErrors, setStep5FieldErrors] = React.useState<Record<string, { photo: boolean; comment: boolean }>>({});
  const [lastSavedResult, setLastSavedResult] = React.useState<SavePVResult | null>(null);

  const reserveManagement = useReserveManagement(toast);
  const participantMgmt = useParticipantManagement(toast, reserveManagement.reserves);
  const formMgmt = useFormManagement();
  const { savePV: savePVOperation } = usePVOperations();

  useEffect(() => {
    if (appState.screen !== "splash") return undefined;
    const timer = setTimeout(() => appState.setScreen("home"), 2000);
    return () => clearTimeout(timer);
  }, [appState.screen]);

  useEffect(() => {
    if (appState.step !== 6) return;
    const firstParticipant = participantMgmt.participants[0];
    if (!firstParticipant) return;
    const allValues = [
      ...SURFACE_FIELDS.map(([key]) => formMgmt.etatSurface[key] as string),
      ...PARTIE_COURANTE_FIELDS.map(([key]) => formMgmt.partieCourante[key] as string),
      ...RELEVES_FIELDS.map(([key]) => formMgmt.releves[key] as string),
      ...POINT_FIELDS.map(([key]) => formMgmt.points[key] as string),
    ];
    const hasNonConforme = allValues.some((v) => v === "Non Conforme");
    const hasReserves = reserveManagement.reserves.length > 0;
    const shouldBeNON = hasNonConforme || hasReserves;
    participantMgmt.updateParticipant(firstParticipant.id, "reception", shouldBeNON ? "NON" : "OUI");
    if (!shouldBeNON) {
      participantMgmt.updateParticipant(firstParticipant.id, "miseEnConformite", new Date().toISOString().split("T")[0]);
    } else {
      participantMgmt.updateParticipant(firstParticipant.id, "miseEnConformite", "");
    }
  }, [appState.step, formMgmt.etatSurface, formMgmt.partieCourante, formMgmt.releves, formMgmt.points, reserveManagement.reserves]);

  const goHome = () => {
    if (appState.screen === "form") {
      appState.setShowQuit(true);
      return;
    }
    appState.setScreen("home");
    appState.setViewPV(null);
  };

  const startNewPV = () => {
    formMgmt.resetForm();
    reserveManagement.resetReserves();
    participantMgmt.resetParticipants();
    appState.setStep(1);
    appState.setReserveScreen("list");
    appState.setScreen("form");
  };

  const startEditPV = (pv: PV, event?: { stopPropagation: () => void }) => {
    event?.stopPropagation();
    formMgmt.loadPVIntoForm(pv);
    reserveManagement.setReserves(
      pv.reserves
        ? pv.reserves.map((reserve) => ({ ...reserve, photos: [...(reserve.photos || [])] }))
        : [],
    );
    participantMgmt.setParticipants(
      pv.participants && pv.participants.length > 0
        ? pv.participants.map((participant) => ({
            ...participant,
            id: participant.id,
            titre: participant.titre || "",
            signed: false,
            sigDataUrl: null,
          }))
        : [],
    );
    appState.setStep(1);
    appState.setReserveScreen("list");
    appState.setViewPV(null);
    appState.setScreen("form");
  };

  const nextStep = () => {
    if (appState.step < 6) appState.setStep((current) => current + 1);
  };

  const prevStep = () => {
    if (appState.step > 1) appState.setStep((current) => current - 1);
  };

  const savePV = () => {
    const captured = participantMgmt.captureSignatures();
    const smacParticipant = captured[0];
    const nomErr = !smacParticipant.nom.trim();
    const sigErr = !smacParticipant.signed && !smacParticipant.sigDataUrl;
    const additionalUnsigned = captured
      .slice(1)
      .filter((participant) => participant.nom.trim().length > 0 && !participant.signed && !participant.sigDataUrl);

    if (nomErr || sigErr || additionalUnsigned.length > 0) {
      participantMgmt.setStep5Errors({ nom: nomErr, sig: sigErr });
      if (nomErr) toast("Le nom du Participant SMAC est requis", "error");
      else if (sigErr) toast("La signature du Participant SMAC est requise", "error");
      else toast("La signature est requise pour tous les participants", "error");
      return;
    }

    const result = savePVOperation(
      pvList,
      setPvList,
      formMgmt.form,
      reserveManagement.reserves,
      formMgmt.etatSurface,
      formMgmt.partieCourante,
      formMgmt.releves,
      formMgmt.points,
      captured,
      formMgmt.editPvId,
      toast,
    );

    setLastSavedResult(result);
    formMgmt.setSavedPV({ ref: result.ref, date: result.dateStr, chantier: result.chantier, dateStr: result.dateStr, isEdit: result.isEdit });
    appState.setScreen("success");
    appState.setStep(1);
    appState.setReserveScreen("list");
  };

  const openPDFForPV = (pv: PV, event?: React.MouseEvent) => {
    event?.stopPropagation();
    downloadPDF(createPdfDataFromPV(pv));
  };

  const filteredPVs = pvList.filter(
    (pv) =>
      pv.name.toLowerCase().includes(search.toLowerCase()) ||
      pv.agency.toLowerCase().includes(search.toLowerCase()),
  );

  const renderStep = () => {
    if (appState.screen !== "form") return null;

    if (appState.reserveScreen === "view-list" && appState.step === 1) {
      return renderReserveList(
        reserveManagement.reserves,
        () => appState.setReserveScreen("list"),
        () => { reserveManagement.openAddRes(); appState.setReserveScreen("add"); },
        (reserve) => { reserveManagement.openEditRes(reserve); appState.setReserveScreen("add"); },
        reserveManagement.deleteRes,
        appState.setLightbox,
      );
    }

    if (appState.reserveScreen !== "list" && appState.step === 1) {
      return renderReserveContent(
        reserveManagement.editResId,
        reserveManagement.reserves,
        reserveManagement.rForm,
        reserveManagement.detailErr,
        reserveManagement.addOnePhoto,
        reserveManagement.removeRFormPhoto,
        reserveManagement.replaceRFormPhoto,
        reserveManagement.updateRFormPhotoUrl,
        reserveManagement.pickLocalisationPhoto,
        reserveManagement.removeLocalisationPhoto,
        (val) => reserveManagement.setRForm((curr) => ({ ...curr, localisation: val })),
        (val) => reserveManagement.setRForm((curr) => ({ ...curr, detail: val })),
        () => appState.setReserveScreen("list"),
        () => { if (reserveManagement.saveReserve()) appState.setReserveScreen("view-list"); },
        reserveManagement.saveAndAddAnother,
        appState.setLightbox,
        (menu) => appState.setPhotoMenu(menu),
        reserveManagement.updateRFormLocalisationPhotoUrl,
        (reserve) => reserveManagement.openEditRes(reserve),
        reserveManagement.deleteRes,
        reserveManagement.reserves.length > 0 ? () => appState.setReserveScreen("view-list") : null,
      );
    }

    if (appState.step === 1) {
      return renderStep1(
        formMgmt.form,
        formMgmt.setForm,
        reserveManagement.reserves,
        () => { reserveManagement.openAddRes(); appState.setReserveScreen("add"); },
        (reserve: Reserve, index: number, onEdit: (reserve: Reserve) => void, onDelete: (id: number) => void) =>
          renderReserveCard(reserve, index, onEdit, onDelete, appState.setLightbox),
        reserveManagement.deleteRes,
        (reserve) => { reserveManagement.openEditRes(reserve); appState.setReserveScreen("add"); },
        () => appState.setReserveScreen("view-list"),
      );
    }

    if (appState.step === 2) {
      return renderStep2(
        formMgmt.etatSurface,
        formMgmt.setEtatSurface,
        step2Errors,
        async (key) => {
          const images = await pickImages();
          const current = (formMgmt.etatSurface[key + "Photos"] as { id: number; url: string }[]) || [];
          const slots = 5 - current.length;
          if (slots > 0) {
            formMgmt.setEtatSurface((curr) => ({
              ...curr,
              [key + "Photos"]: [...current, ...images.slice(0, slots).map((img) => ({ ...img, id: uid() }))],
            }));
          }
        },
        (key, photoId) => {
          formMgmt.setEtatSurface((curr) => ({
            ...curr,
            [key + "Photos"]: ((curr[key + "Photos"] as { id: number; url: string }[]) || []).filter((p) => p.id !== photoId),
          }));
        },
        (menu) => appState.setPhotoMenu(menu),
        (photos, title, key) => appState.setGallery({ photos: [...photos], title, key, stateSource: "etatSurface" }),
      );
    }

    if (appState.step === 3) {
      return renderStep3(
        formMgmt.partieCourante,
        formMgmt.setPartieCourante,
        async (key) => {
          const images = await pickImages();
          const current = (formMgmt.partieCourante[key + "Photos"] as { id: number; url: string }[]) || [];
          const slots = 5 - current.length;
          if (slots > 0) formMgmt.setPartieCourante((curr) => ({ ...curr, [key + "Photos"]: [...current, ...images.slice(0, slots).map((img) => ({ ...img, id: uid() }))] }));
        },
        (key, photoId) => formMgmt.setPartieCourante((curr) => ({ ...curr, [key + "Photos"]: ((curr[key + "Photos"] as { id: number; url: string }[]) || []).filter((p) => p.id !== photoId) })),
        (menu) => appState.setPhotoMenu(menu),
        (photos, title, key) => appState.setGallery({ photos: [...photos], title, key, stateSource: "partieCourante" }),
        step3Errors,
      );
    }

    if (appState.step === 4) {
      return renderStep4(
        formMgmt.releves,
        formMgmt.setReleves,
        async (key) => {
          const images = await pickImages();
          const current = (formMgmt.releves[key + "Photos"] as { id: number; url: string }[]) || [];
          const slots = 5 - current.length;
          if (slots > 0) formMgmt.setReleves((curr) => ({ ...curr, [key + "Photos"]: [...current, ...images.slice(0, slots).map((img) => ({ ...img, id: uid() }))] }));
        },
        (key, photoId) => formMgmt.setReleves((curr) => ({ ...curr, [key + "Photos"]: ((curr[key + "Photos"] as { id: number; url: string }[]) || []).filter((p) => p.id !== photoId) })),
        (menu) => appState.setPhotoMenu(menu),
        (photos, title, key) => appState.setGallery({ photos: [...photos], title, key, stateSource: "releves" }),
        step4Errors,
      );
    }

    if (appState.step === 5) {
      return renderStep5(
        formMgmt.points,
        formMgmt.setPoints,
        async (key) => {
          const images = await pickImages();
          const current = (formMgmt.points[key + "Photos"] as { id: number; url: string }[]) || [];
          const slots = 5 - current.length;
          if (slots > 0) formMgmt.setPoints((curr) => ({ ...curr, [key + "Photos"]: [...current, ...images.slice(0, slots).map((img) => ({ ...img, id: uid() }))] }));
        },
        (key, photoId) => formMgmt.setPoints((curr) => ({ ...curr, [key + "Photos"]: ((curr[key + "Photos"] as { id: number; url: string }[]) || []).filter((p) => p.id !== photoId) })),
        (menu) => appState.setPhotoMenu(menu),
        (photos, title, key) => appState.setGallery({ photos: [...photos], title, key, stateSource: "points" }),
        step5FieldErrors,
      );
    }

    if (appState.step === 6) {
      return renderStep6(
        participantMgmt.participants,
        reserveManagement.reserves,
        participantMgmt.step5Errors,
        participantMgmt.canvasElements,
        participantMgmt.addParticipant,
        participantMgmt.updateParticipant,
        participantMgmt.removeParticipant,
      );
    }

    return null;
  };

  const showNavBar = appState.reserveScreen === "list" && appState.screen === "form";

  if (appState.screen === "splash") {
    return renderSplashScreen(toasts);
  }

  if (appState.screen === "home") {
    return (
      <>
        {renderHomeScreen(
          appState.viewPV,
          filteredPVs,
          search,
          setSearch,
          appState.setViewPV,
          startNewPV,
          (pv) => startEditPV(pv, { stopPropagation: () => {} }),
          openPDFForPV,
          goHome,
          toasts,
          CURRENT_USER,
        )}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: "env(safe-area-inset-bottom, 0px)", zIndex: 30 }}>
          <div onClick={goHome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 32px 10px", cursor: "pointer", color: "#D32F2F" }}>
            <I.Home />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>Accueil PSA</span>
          </div>
        </div>
      </>
    );
  }

  if (appState.screen === "success") {
    const savedResult = formMgmt.savedPV;
    const savedPVObj = lastSavedResult?.pv;
    return (
      <div className="shell">
        <SuccessScreen
          savedResult={savedResult}
          reserveCount={reserveManagement.reserves.length}
          onDownloadPDF={() => savedPVObj && downloadPDF(createPdfDataFromPV(savedPVObj))}
          onViewPV={() => {
            if (savedPVObj) {
              appState.setViewPV(savedPVObj);
              formMgmt.setEditPvId(null);
            }
            appState.setScreen("home");
          }}
          onGoHome={() => {
            formMgmt.setEditPvId(null);
            appState.setViewPV(null);
            appState.setScreen("home");
          }}
          onShareEmail={() => {
            const email = savedPVObj?.participants?.[0]?.email || "";
            if (email && savedResult) window.location.href = `mailto:${email}?subject=PV ${savedResult.ref}`;
          }}
        />
      </div>
    );
  }

  if (appState.screen !== "form") return null;

  return (
    <>
      <div className="shell">
        <div className="scr">
          <div className="step-hdr">
            <button
              className="step-back"
              onClick={() => {
                if (appState.reserveScreen !== "list") {
                  appState.setReserveScreen("list");
                } else {
                  appState.setShowQuit(true);
                }
              }}
            >
              <I.Back />
            </button>
            <div className="step-hdr-title">
              {appState.reserveScreen === "view-list"
                ? "Toutes les réserves"
                : appState.reserveScreen !== "list"
                  ? "Réserves à ajouter"
                  : formMgmt.editPvId
                    ? "Modifier PV"
                    : "Nouveau PV"}
            </div>
            <div className="step-label">Étape {appState.step} sur 6</div>
          </div>

          <div className="prog-wrap">
            <div className="prog-dots">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className={`prog-dot ${index <= appState.step ? "done" : ""}`} />
              ))}
            </div>
          </div>

          {renderStep()}

          {showNavBar && appState.step < 6 && (
            <div style={{ padding: "12px 20px 80px", display: "flex", gap: 10, justifyContent: appState.step === 1 ? "flex-end" : "space-between" }}>
              {appState.step > 1 && (
                <button className="btn-gray" onClick={prevStep}><I.Back /> Précédent</button>
              )}
              <button className="btn-red" onClick={nextStep}>Suivant <I.Arrow /></button>
            </div>
          )}

          {showNavBar && appState.step === 6 && (
            <div style={{ padding: "12px 16px 80px", display: "flex", gap: 8 }}>
              <button className="btn-gray" onClick={prevStep} style={{ minWidth: 0 }}><I.Back /> Précédent</button>
              <button className="btn-red" onClick={savePV} style={{ flex: 1 }}><I.Check /> Enregistrer</button>
            </div>
          )}
        </div>
      </div>

      {appState.showQuit && (
        <div className="modal-bg" onClick={() => appState.setShowQuit(false)}>
          <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="modal-warn"><I.Warn /></div>
            <div className="modal-title">Quitter le formulaire ?</div>
            <div className="modal-body">Souhaitez-vous vraiment quitter ce formulaire ? Cette action est irréversible pour la session en cours.</div>
            <div className="modal-actions">
              <button className="btn-red btn-full" onClick={() => { appState.setShowQuit(false); appState.setScreen("home"); appState.setStep(1); appState.setReserveScreen("list"); formMgmt.setEditPvId(null); }}>Quitter</button>
              <button className="btn-gray btn-full" onClick={() => appState.setShowQuit(false)}>Rester</button>
            </div>
          </div>
        </div>
      )}

      {appState.photoMenu && (
        <PhotoMenu
          photo={appState.photoMenu.photo}
          onAnnotate={() => {
            const photo = appState.photoMenu!.photo;
            const update = appState.photoMenu!.onUpdate;
            appState.setPhotoMenu(null);
            appState.setAnnotPhoto({
              url: photo.url,
              onSave: (newUrl) => {
                update(newUrl);
                appState.setAnnotPhoto(null);
                toast("Image annotée !", "success");
              },
            });
          }}
          onReplace={() => { appState.photoMenu!.onReplace(); }}
          onClose={() => appState.setPhotoMenu(null)}
        />
      )}

      {appState.annotPhoto && (
        <AnnotationModal src={appState.annotPhoto.url} onSave={appState.annotPhoto.onSave} onClose={() => appState.setAnnotPhoto(null)} />
      )}
      {appState.pdfData && <PDFViewer pvData={appState.pdfData} onClose={() => appState.setPdfData(null)} />}
      {appState.gallery && (
        <PhotoGallery
          photos={appState.gallery.photos}
          title={appState.gallery.title}
          onClose={() => appState.setGallery(null)}
          onPhotoClick={(photo) => {
            const key = appState.gallery?.key;
            const source = appState.gallery?.stateSource;
            appState.setPhotoMenu({
              photo,
              onReplace: () => {},
              onUpdate: (newUrl) => {
                if (key) {
                  const updater = (curr: { [k: string]: string | { id: number; url: string }[] }) => ({
                    ...curr,
                    [key + "Photos"]: ((curr[key + "Photos"] as { id: number; url: string }[]) || []).map((p) =>
                      p.id === photo.id ? { ...p, url: newUrl } : p,
                    ),
                  });
                  if (source === "partieCourante") formMgmt.setPartieCourante((curr) => updater(curr) as typeof curr);
                  else if (source === "releves") formMgmt.setReleves((curr) => updater(curr) as typeof curr);
                  else if (source === "points") formMgmt.setPoints((curr) => updater(curr) as typeof curr);
                  else formMgmt.setEtatSurface((curr) => updater(curr) as typeof curr);
                }
                appState.setGallery((prev) =>
                  prev ? { ...prev, photos: prev.photos.map((p) => (p.id === photo.id ? { ...p, url: newUrl } : p)) } : null,
                );
              },
            });
          }}
        />
      )}

      {appState.lightbox && (
        <div className="lightbox" onClick={() => appState.setLightbox(null)}>
          <button className="lb-close"><I.X /></button>
          <img src={appState.lightbox} alt="" onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      {appState.showProfile && (
        <ProfileModal
          user={CURRENT_USER}
          onClose={() => appState.setShowProfile(false)}
          onLogout={() => { appState.setShowProfile(false); toast("Déconnexion réussie", "success"); }}
        />
      )}

      <div className="toast-wrap">
        {toasts.map((toastItem) => (
          <div key={toastItem.id} className={`toast ${toastItem.type}`}>{toastItem.msg}</div>
        ))}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: "env(safe-area-inset-bottom, 0px)", zIndex: 30 }}>
        <div onClick={goHome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 32px 10px", cursor: "pointer", color: "#D32F2F" }}>
          <I.Home />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>Accueil PSA</span>
        </div>
      </div>
    </>
  );
}
