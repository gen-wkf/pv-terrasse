import SignaturePad from "./SignaturePad";
import { I } from "../icons";
import type { Participant, Reserve, SavedPVRef, Step5Errors } from "../types";

export const renderStep6 = (
  participants: Participant[],
  reserves: Reserve[],
  step5Errors: Step5Errors,
  canvasElements: React.MutableRefObject<(HTMLCanvasElement | undefined)[]>,
  onAddParticipant: () => void,
  onUpdateParticipant: (id: number, key: string, value: string | boolean) => void,
  onRemoveParticipant: (id: number) => void,
  _onSignCanvas?: (canvas: HTMLCanvasElement, index: number) => void,
): React.ReactElement => (
  <div className="cnt fade-in">
    {participants.map((participant, index) => {
      const isSMAC = index === 0;
      const showNom = isSMAC ? true : (participant.titre || "").trim().length > 0;
      const showSig = participant.nom.trim().length > 0;

      return (
        <div key={participant.id} className="participant-block">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="participant-num">{isSMAC ? "Participants " : `Participant ${String(index + 1).padStart(2, "0")}`}</div>
            {!isSMAC && (
              <button style={{ background: "none", border: "none", color: "#D32F2F", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }} onClick={() => onRemoveParticipant(participant.id)}>
                Supprimer
              </button>
            )}
          </div>

          {!isSMAC && (
            <div className="field-wrap">
              <label className="lbl">Titre</label>
              <input className="inp" placeholder="Ex: Conducteur de Travaux" value={participant.titre || ""} onChange={(event) => onUpdateParticipant(participant.id, "titre", event.target.value)} autoComplete="off" />
            </div>
          )}

          {showNom && (
            <div className="field-wrap">
              <label className="lbl">
                {isSMAC ? "Participant SMAC" : "Nom du participant"} <span className="req-star">*</span>
              </label>
              <input
                className={`inp${isSMAC && step5Errors.nom ? " inp-err" : ""}`}
                placeholder={isSMAC ? "Nom complet du représentant SMAC" : "Nom du participant"}
                value={participant.nom}
                onChange={(event) => onUpdateParticipant(participant.id, "nom", event.target.value)}
                autoComplete="off"
              />
              {isSMAC && step5Errors.nom && <span className="err-msg">Ce champ est obligatoire</span>}
            </div>
          )}

          {showSig && (
            <div>
              <SignaturePad
                label={isSMAC ? "Signature SMAC *" : "Signature *"}
                onSign={(value) => onUpdateParticipant(participant.id, "signed", value)}
                onCanvasReady={(canvas) => { canvasElements.current[index] = canvas; }}
                extraAction={
                  index === participants.length - 1 && participants.length < 4 ? (
                    <button onClick={onAddParticipant} style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff0f0", border: "none", color: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} title={`Ajouter un participant (${participants.length - 1}/3)`}>
                      <I.AddPerson />
                    </button>
                  ) : null
                }
              />
              {isSMAC && step5Errors.sig && <span className="err-msg" style={{ marginTop: 6, display: "block" }}>La signature est obligatoire</span>}
            </div>
          )}
        </div>
      );
    })}

    <div className="sec">
      <div className="inline-row">
        <div>
          <div className="inline-lbl">Réception acceptée ?</div>
        </div>
        <div className="yn-group">
          <button className={`yn-btn ${participants[0]?.reception === "OUI" ? "active-oui" : ""}`} disabled style={{ cursor: "default", opacity: participants[0]?.reception === "OUI" ? 1 : 0.4 }}>OUI</button>
          <button className={`yn-btn ${participants[0]?.reception === "NON" ? "active-non" : ""}`} disabled style={{ cursor: "default", opacity: participants[0]?.reception === "NON" ? 1 : 0.4 }}>NON</button>
        </div>
      </div>

      {participants[0]?.reception === "OUI" && (
        <div className="inline-row">
          <div className="inline-lbl">Mise en conformité le :</div>
          <div className="inline-val" style={{ background: "#f5f5f5", color: "#555", display: "flex", alignItems: "center" }}>
            {participants[0]?.miseEnConformite ? participants[0].miseEnConformite.split("-").reverse().join("/") : "—"}
          </div>
        </div>
      )}

      {participants[0]?.reception === "NON" && (
        <div className="inline-row">
          <div className="inline-lbl">Reporter au :</div>
          <input className="inline-val" type="date" value={participants[0]?.reporterAu || ""} min={new Date().toISOString().split("T")[0]} onChange={(event) => onUpdateParticipant(participants[0].id, "reporterAu", event.target.value)} />
        </div>
      )}
    </div>
    <div style={{ height: 8 }} />
  </div>
);

export const renderStep7 = (
  editPvId: number | null,
  savedPV: SavedPVRef | null,
  onViewPDF: () => void,
  onGoHome: () => void,
  email: string,
  onSendEmail: () => void,
  isSending: boolean,
): React.ReactElement => (
  <div className="cnt fade-in">
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 8 }}>
      <div className="success-icon">
        <I.Shield />
        <div className="success-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <div className="success-title">{editPvId ? "PV Mis à Jour !" : "PV Enregistré avec Succès !"}</div>
      <div className="success-sub">
        {editPvId ? "Les modifications du procès-verbal pour le chantier" : "Le procès-verbal pour le chantier"} <strong>{savedPV?.chantier || "—"}</strong>{" "}
        {editPvId ? "ont été sauvegardées." : "a été généré et sauvegardé en toute sécurité."}
      </div>
    </div>

    <div className="success-info">
      <div className="success-row">
        <div className="success-ico"><I.Doc /></div>
        <div>
          <div className="success-meta-lbl">Référence PV</div>
          <div className="success-meta-val">{savedPV?.ref || "—"}</div>
        </div>
      </div>
      <div style={{ height: 1, background: "#f0ece8" }} />
      <div className="success-row">
        <div className="success-ico"><I.Cal /></div>
        <div>
          <div className="success-meta-lbl">{editPvId ? "Dernière modification" : "Horodatage"}</div>
          <div className="success-meta-val">{savedPV?.date || "—"}</div>
        </div>
      </div>
      {email && (
        <>
          <div style={{ height: 1, background: "#f0ece8" }} />
          <div className="success-row">
            <div className="success-ico"><I.Mail /></div>
            <div>
              <div className="success-meta-lbl">Destinataire</div>
              <div className="success-meta-val" style={{ fontSize: 13 }}>{email}</div>
            </div>
          </div>
        </>
      )}
    </div>

    <button className="btn-red btn-full" onClick={onViewPDF}>
      <I.PDF /> Voir le document PDF
    </button>

    {email && (
      <button className="btn-full" onClick={onSendEmail} disabled={isSending} style={{ marginTop: 10, padding: "10px 16px", background: isSending ? "#555" : "#1a1a3e", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: isSending ? "not-allowed" : "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif", opacity: isSending ? 0.7 : 1, transition: "background 0.2s, opacity 0.2s" }}>
        <I.Mail /> {isSending ? "Envoi en cours…" : "Envoyer par email"}
      </button>
    )}

    <div className="back-link" onClick={onGoHome}>RETOUR SUR LA LISTE DE PV</div>
    <div style={{ height: 8 }} />
  </div>
);
