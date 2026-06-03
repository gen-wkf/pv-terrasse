import { AGENCES, ETABLISSEMENTS, SURFACE_FIELDS, RELEVES_FIELDS, POINT_FIELDS } from "../schema";
import ToggleGroup from "./ToggleGroup";
import { I } from "../icons";
import Dictaphone from "./Dictaphone";
import type { EtatSurface, Form, Photo, PhotoMenuState, Points, Releves, Reserve, Step2Errors } from "../types";

export const renderStep1 = (
  form: Form,
  setForm: React.Dispatch<React.SetStateAction<Form>>,
  reserves: Reserve[],
  onOpenAddRes: () => void,
  renderReserveCard: (reserve: Reserve, index: number, onEdit: (reserve: Reserve) => void, onDelete: (id: number) => void) => React.ReactNode,
  onDeleteRes: (id: number) => void,
  onEditRes: (reserve: Reserve) => void,
  onViewReserves: () => void,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div className="hint-box">
      <div className="hint-ico"><I.Doc /></div>
      <div className="hint-text">Veuillez renseigner les informations d'identification du chantier pour débuter le PV de réception.</div>
    </div>

    <div className="field-wrap">
      <label className="lbl">Agence</label>
      <div className="select-wrap">
        <select className="sel" value={form.agence} onChange={(event) => setForm((current) => ({ ...current, agence: event.target.value }))}>
          <option value="">Sélectionner une agence</option>
          {AGENCES.map((agency) => <option key={agency}>{agency}</option>)}
        </select>
        <span className="sel-arrow">▾</span>
      </div>
    </div>

    <div className="field-wrap">
      <label className="lbl">Établissement</label>
      <div className="select-wrap">
        <select className="sel" value={form.etablissement} onChange={(event) => setForm((current) => ({ ...current, etablissement: event.target.value }))}>
          <option value="">Sélectionner l'établissement</option>
          {ETABLISSEMENTS.map((establishment) => <option key={establishment}>{establishment}</option>)}
        </select>
        <span className="sel-arrow">▾</span>
      </div>
    </div>

    <div className="field-wrap">
      <label className="lbl">Chantier</label>
      <input className="inp" placeholder="Nom du projet ou référence client" value={form.chantier} onChange={(event) => setForm((current) => ({ ...current, chantier: event.target.value }))} autoComplete="off" />
    </div>

    <div className="field-wrap">
      <label className="lbl">Zone / Bâtiment</label>
      <input className="inp" placeholder="Ex: Bâtiment B - Toiture" value={form.zone} onChange={(event) => setForm((current) => ({ ...current, zone: event.target.value }))} autoComplete="off" />
    </div>

    <div className="field-wrap">
      <label className="lbl">Date d'inspection</label>
      <input className="inp" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
    </div>

    <div className="field-wrap">
      <label className="lbl">Responsable Chantier</label>
      <input className="inp" placeholder="Nom du conducteur de travaux" value={form.responsable} onChange={(event) => setForm((current) => ({ ...current, responsable: event.target.value }))} autoComplete="off" />
    </div>

    <div style={{ background: "#f3f4f6", borderRadius: 16, padding: 18, border: "1.5px solid #f0ece8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, background: "#D32F2F", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", flexShrink: 0 }}><I.Doc /></div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#1a1a1a" }}>Gestion des Réserves</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>Ajoutez les détails et actions à mener sur vos réserves</div>
        </div>
      </div>

      {reserves.length === 0 ? (
        <button className="btn-red btn-full" onClick={onOpenAddRes}>+ Ajouter une réserve</button>
      ) : (
        <button onClick={onViewReserves} style={{ width: "100%", padding: "12px", background: "white", color: "#D32F2F", border: "1.5px solid #D32F2F", borderRadius: 999, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          + Voir les réserves ({reserves.length})
        </button>
      )}
    </div>

    <div style={{ height: 8 }} />
  </div>
);

export const renderStep2 = (
  etatSurface: EtatSurface,
  setEtatSurface: React.Dispatch<React.SetStateAction<EtatSurface>>,
  step2Errors: Step2Errors,
  onAddPhoto: (key: string) => void,
  onRemovePhoto: (key: string, photoId: number) => void,
  onPhotoMenu: (menu: PhotoMenuState) => void,
  onOpenGallery: (photos: Photo[], title: string, key: string) => void,
): React.ReactElement => {
  const nonConformeExtras = (key: string, label: string) => {
    const photos = (etatSurface[key + "Photos"] as Photo[]) || [];
    const comment = (etatSurface[key + "Comment"] as string) || "";
    const fieldErr = step2Errors?.[key];
    const photoErr = fieldErr?.photo;
    const commentErr = fieldErr?.comment;
    const VISIBLE = 2;
    const shownPhotos = photos.slice(0, VISIBLE);
    const hiddenCount = photos.length - VISIBLE;

    return (
      <div style={{ marginTop: 10, marginBottom: 4, padding: 14, background: "#fff8f8", borderRadius: 12, border: `1.5px solid ${photoErr || commentErr ? "#D32F2F" : "#fdd"}` }}>
        <div>
          <label className="lbl" style={{ color: "#D32F2F" }}>
            Photos <span className="req-star">*</span> ({photos.length}/5)
          </label>
          {photos.length === 0 ? (
            <div className="img-upload-empty" onClick={() => onAddPhoto(key)} style={photoErr ? { borderColor: "#D32F2F", background: "#fff5f5" } : {}}>
              <div className="img-upload-empty-icon"><I.ImgPlus /></div>
              <div className="img-upload-empty-lbl">Ajouter une photo</div>
              <div className="img-upload-empty-sub">Appuyez pour sélectionner</div>
            </div>
          ) : (
            <>
              <div className="photo-grid">
                {shownPhotos.map((photo, i) => {
                  const isLast = i === VISIBLE - 1 && hiddenCount > 0;
                  return (
                    <div key={photo.id} className="ph-wrap" style={{ position: "relative" }}>
                      <img
                        src={photo.url}
                        alt=""
                        className="ph-img"
                        style={isLast ? { filter: "brightness(0.35)" } : {}}
                        onClick={() =>
                          isLast
                            ? onOpenGallery(photos, label, key)
                            : onPhotoMenu({
                                photo,
                                onReplace: () => {},
                                onUpdate: (url) =>
                                  setEtatSurface((curr) => ({
                                    ...curr,
                                    [key + "Photos"]: (curr[key + "Photos"] as Photo[]).map((p) =>
                                      p.id === photo.id ? { ...p, url } : p,
                                    ),
                                  })),
                              })
                        }
                      />
                      {isLast && (
                        <div onClick={() => onOpenGallery(photos, label, key)} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "inherit", zIndex: 1 }}>
                          <span style={{ color: "white", fontSize: 22, fontWeight: 800 }}>+{hiddenCount}</span>
                        </div>
                      )}
                      <div className="ph-remove" style={{ zIndex: 2 }} onClick={() => onRemovePhoto(key, photo.id)}>×</div>
                    </div>
                  );
                })}
                {photos.length < 5 && (
                  <div className="ph-add-tile" onClick={() => onAddPhoto(key)} title="Ajouter"><I.PlusCircle /></div>
                )}
              </div>
              {hiddenCount > 0 && (
                <button onClick={() => onOpenGallery(photos, label, key)} style={{ marginTop: 10, width: "100%", background: "#fff0f0", border: "1.5px solid #fdd", borderRadius: 10, padding: "9px 0", color: "#D32F2F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Voir toutes les photos ({photos.length})
                </button>
              )}
            </>
          )}
          {photoErr && <span className="err-msg" style={{ marginTop: 6, display: "block" }}>Au moins une photo est requise</span>}
        </div>

        <div className="field-wrap" style={{ marginTop: 12 }}>
          <label className="lbl">Commentaire <span className="req-star">*</span></label>
          <Dictaphone
            value={comment}
            onChange={(v) => setEtatSurface((curr) => ({ ...curr, [key + "Comment"]: v }))}
            hasError={!!commentErr}
          />
          {commentErr && <span className="err-msg">Le commentaire est obligatoire</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="cnt fade-in">
      <div className="sec">
        <div className="sec-hdr">
          <div style={{ fontSize: 20 }}>▦</div>
          <div className="sec-title">Etat de Surface</div>
        </div>
        {SURFACE_FIELDS.map(([key, label], index) => (
          <div key={key}>
            <ToggleGroup
              label={label}
              value={etatSurface[key] as string}
              onChange={(value) =>
                setEtatSurface((current) => ({
                  ...current,
                  [key]: value,
                  ...(value !== "Non Conforme" ? { [key + "Photos"]: [], [key + "Comment"]: "" } : {}),
                }))
              }
            />
            {etatSurface[key] === "Non Conforme" && nonConformeExtras(key, label)}
            {index < SURFACE_FIELDS.length - 1 && <div className="sec-divider" />}
          </div>
        ))}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
};

export const renderStep3 = (
  releves: Releves,
  setReleves: React.Dispatch<React.SetStateAction<Releves>>,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div className="sec">
      <div className="sec-hdr">
        <div style={{ fontSize: 20, color: "#D32F2F" }}>◎</div>
        <div className="sec-title">Relevés d'Étanchéité</div>
      </div>
      {RELEVES_FIELDS.map(([key, label], index) => (
        <div key={key}>
          <ToggleGroup label={label} value={releves[key]} onChange={(value) => setReleves((current) => ({ ...current, [key]: value }))} />
          {index < RELEVES_FIELDS.length - 1 && <div className="sec-divider" />}
        </div>
      ))}
    </div>
    <div style={{ height: 8 }} />
  </div>
);

export const renderStep4 = (
  points: Points,
  setPoints: React.Dispatch<React.SetStateAction<Points>>,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div className="sec">
      <div className="sec-hdr">
        <div style={{ fontSize: 18 }}>⊹</div>
        <div className="sec-title">Points Singuliers</div>
      </div>
      {POINT_FIELDS.map(([key, label], index) => (
        <div key={key}>
          <ToggleGroup label={label} value={points[key]} onChange={(value) => setPoints((current) => ({ ...current, [key]: value }))} />
          {index < POINT_FIELDS.length - 1 && <div className="sec-divider" />}
        </div>
      ))}
      <div className="sec-divider" />
      <div style={{ padding: "0 0 4px" }}>
        <div className="sec-title" style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#1a1a1a", marginBottom: 12 }}>
          Autres Écarts & Observations
        </div>
        <textarea className="inp" placeholder="Précisez ici toute observation complémentaire..." value={points.observations} onChange={(event) => setPoints((current) => ({ ...current, observations: event.target.value }))} />
      </div>
    </div>
    <div style={{ height: 8 }} />
  </div>
);
