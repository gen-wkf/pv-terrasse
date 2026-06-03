import { I } from "../icons";
import Dictaphone from "./Dictaphone";
import type { Photo, PhotoMenuState, Reserve, ReserveForm } from "../types";

export const renderReserveList = (
  reserves: Reserve[],
  onBack: () => void,
  onAdd: () => void,
  onEdit: (reserve: Reserve) => void,
  onDelete: (id: number) => void,
  onLightbox: (url: string) => void,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>Toutes les réserves</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>{String(reserves.length).padStart(2, "0")} / 08</div>
    </div>

    {reserves.map((reserve, index) => (
      <div key={reserve.id} onClick={() => onEdit(reserve)} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #f0ece8", marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", display: "flex", cursor: "pointer" }}>
        <div style={{ width: 4, background: "#D32F2F", flexShrink: 0, borderRadius: "12px 0 0 12px" }} />
        <div style={{ flex: 1, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#D32F2F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>Réserve #{String(index + 1).padStart(2, "0")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{reserve.localisation || "Sans localisation"}</div>
              {reserve.detail && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{reserve.detail}</div>}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); onEdit(reserve); }} style={{ width: 34, height: 34, borderRadius: 8, background: "#f3f4f6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><I.Annotate /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(reserve.id); }} style={{ width: 34, height: 34, borderRadius: 8, background: "#fff0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D32F2F" }}><I.Trash /></button>
            </div>
          </div>

          {((reserve.photos || []).length > 0 || reserve.localisationPhoto) && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {reserve.localisationPhoto && (
                <img src={reserve.localisationPhoto.url} alt="Loc" onClick={(e) => { e.stopPropagation(); onLightbox(reserve.localisationPhoto!.url); }} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "2px solid #D32F2F", cursor: "pointer", flexShrink: 0 }} />
              )}
              {(reserve.photos || []).map((photo) => (
                <img key={photo.id} src={photo.url} alt="" onClick={(e) => { e.stopPropagation(); onLightbox(photo.url); }} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1.5px solid #e5e7eb", cursor: "pointer", flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    ))}

    {reserves.length < 8 && (
      <button onClick={onAdd} style={{ width: "100%", padding: "18px", background: "white", color: "#D32F2F", border: "1.5px dashed #D32F2F", borderRadius: 14, fontSize: 13, fontWeight: 800, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #D32F2F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1 }}>+</div>
        Ajouter une réserve
      </button>
    )}

    <div style={{ height: 8 }} />
  </div>
);

export const renderReserveCard = (
  reserve: Reserve,
  index: number,
  onEdit: (reserve: Reserve) => void,
  onDelete: (id: number) => void,
  onLightbox: (url: string) => void,
): React.ReactElement => (
  <div key={reserve.id} className="reserve-card-item">
    <div className="rc-row">
      <div>
        <div className="rc-tag">Réserve #{String(index + 1).padStart(2, "0")}</div>
        <div className="rc-name">{reserve.localisation || "(sans localisation)"}</div>
        {reserve.detail && <div className="rc-desc">{reserve.detail}</div>}
      </div>
      <div className="rc-acts">
        <button className="card-ico-btn" onClick={() => onEdit(reserve)}><I.Pencil /></button>
        <button className="card-ico-btn" onClick={() => onDelete(reserve.id)}><I.Trash /></button>
      </div>
    </div>
    <div className="rc-photos">
      {reserve.localisationPhoto && (
        <img src={reserve.localisationPhoto.url} alt="Loc" className="rc-ph" style={{ border: "2px solid #D32F2F" }} onClick={() => onLightbox(reserve.localisationPhoto!.url)} title="Photo de localisation" />
      )}
      {(reserve.photos || []).map((photo) => (
        <img key={photo.id} src={photo.url} alt="" className="rc-ph" onClick={() => onLightbox(photo.url)} />
      ))}
    </div>
  </div>
);

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export const renderReserveContent = (
  editResId: number | null,
  reserves: Reserve[],
  rForm: ReserveForm,
  detailErr: boolean,
  onAddPhoto: () => void,
  onRemovePhoto: (id: number) => void,
  onReplacePhoto: (id: number) => void,
  onUpdatePhotoUrl: (id: number, url: string) => void,
  onPickLocalisationPhoto: () => void,
  onRemoveLocalisationPhoto: () => void,
  onChangeLocalisation: (val: string) => void,
  onChangeDetail: (val: string) => void,
  onBack: () => void,
  onSave: () => void,
  onSaveAndAddAnother: () => void,
  onLightbox: (url: string) => void,
  onPhotoMenu: (menu: PhotoMenuState) => void,
  onUpdateLocalisationPhotoUrl: (url: string) => void,
  onEditReserve: (reserve: Reserve) => void,
  onDeleteReserve: (id: number) => void,
  onViewAll: (() => void) | null,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>
        Réserve #{String(editResId ? reserves.findIndex((r) => r.id === editResId) + 1 : reserves.length + 1).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>
        Veuillez ajouter vos réserves ici. Chaque réserve est accompagnée d'une localisation précise et d'une preuve photographique.
      </div>
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label className="lbl" style={{ margin: 0 }}>Photos de la réserve</label>
        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{rForm.photos.length}/8</span>
      </div>
      {rForm.photos.length === 0 ? (
        <div onClick={onAddPhoto} style={{ border: "1.5px dashed #e5e7eb", borderRadius: 12, background: "#fafafa", padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <CameraIcon />
          <span style={{ fontSize: 12, fontWeight: 800, color: "#D32F2F", letterSpacing: 0.8, textTransform: "uppercase" }}>Prendre / Importer une photo</span>
        </div>
      ) : (
        <div className="photo-grid">
          {rForm.photos.map((photo: Photo) => (
            <div key={photo.id} className="ph-wrap">
              <img src={photo.url} alt="" className="ph-img" onClick={() => onPhotoMenu({ photo, onReplace: () => onReplacePhoto(photo.id), onUpdate: (url) => onUpdatePhotoUrl(photo.id, url) })} />
              <div className="ph-remove" onClick={(e) => { e.stopPropagation(); onRemovePhoto(photo.id); }}>×</div>
            </div>
          ))}
          {rForm.photos.length < 8 && (
            <div className="ph-add-tile" onClick={onAddPhoto} title="Ajouter une image"><I.PlusCircle /></div>
          )}
        </div>
      )}
    </div>

    <div className="field-wrap">
      <label className="lbl">Localisation</label>
      <input className="inp" placeholder="Ex: Entrée principale" value={rForm.localisation} onChange={(event) => onChangeLocalisation(event.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false} />
    </div>

    <div style={{ marginBottom: 16 }}>
      {!rForm.localisationPhoto ? (
        <div onClick={onPickLocalisationPhoto} style={{ border: "1.5px dashed #e5e7eb", borderRadius: 12, background: "#fafafa", padding: "22px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <CameraIcon />
          <span style={{ fontSize: 12, fontWeight: 800, color: "#D32F2F", letterSpacing: 0.8, textTransform: "uppercase" }}>Ajouter une image de localisation</span>
        </div>
      ) : (
        <div className="loc-upload-preview">
          <img
            src={rForm.localisationPhoto.url}
            alt="Localisation"
            onClick={() => onPhotoMenu({
              photo: rForm.localisationPhoto as Photo,
              onReplace: onPickLocalisationPhoto,
              onUpdate: (newUrl) => onUpdateLocalisationPhotoUrl(newUrl),
            })}
          />
          <div className="loc-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveLocalisationPhoto(); }}>×</div>
        </div>
      )}
    </div>

    <div className="field-wrap">
      <label className="lbl">Détail de la réserve et actions à mener <span className="req-star">*</span></label>
      <Dictaphone value={rForm.detail} onChange={onChangeDetail} hasError={detailErr} />
      {detailErr && <span className="err-msg">Ce champ est obligatoire</span>}
    </div>

    <button className="btn-red btn-full" style={{ marginBottom: 10 }} onClick={onSave}>Sauvegarder</button>

    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn-ghost" style={{ flex: 1 }} onClick={onBack}><I.Back /> Retour</button>
      {!editResId && (
        <button className="btn-gray" style={{ flex: 1 }} onClick={onSaveAndAddAnother}>+ Nouvelle réserve</button>
      )}
      {editResId && (
        <button className="btn-gray" style={{ flex: 1 }} onClick={onSave}><I.Check /> Enregistrer</button>
      )}
    </div>

    {onViewAll && (
      <button onClick={onViewAll} style={{ width: "100%", marginTop: 10, padding: "12px", background: "white", color: "#D32F2F", border: "1.5px solid #D32F2F", borderRadius: 999, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
        Voir toutes les réserves
      </button>
    )}

    <div style={{ height: 8 }} />
  </div>
);
