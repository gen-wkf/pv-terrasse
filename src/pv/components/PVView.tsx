import { useState } from "react";
import { I } from "../icons";
import { SURFACE_FIELDS, RELEVES_FIELDS, POINT_FIELDS } from "../schema";
import VersionModal from "./VersionModal";
import type { Photo, PV } from "../types";

interface RowProps {
  label: string;
  value?: string;
  last?: boolean;
}

const Row = ({ label, value, last }: RowProps) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: last ? "none" : "1px solid #f3f4f6" }}>
    <span style={{ fontSize: 14, color: "#6b7280" }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
  </div>
);

interface StatusBadgeProps {
  value?: string;
}

const StatusBadge = ({ value }: StatusBadgeProps) => {
  const map: Record<string, { bg: string; color: string }> = {
    "Conforme": { bg: "#f0fdf4", color: "#16a34a" },
    "Non Conforme": { bg: "#fff0f0", color: "#D32F2F" },
  };
  const style = (value && map[value]) ? map[value] : { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: style.bg, color: style.color, whiteSpace: "nowrap" }}>
      {value || "SO"}
    </span>
  );
};

interface StatusRowProps {
  label: string;
  value?: string;
  last?: boolean;
}

const StatusRow = ({ label, value, last }: StatusRowProps) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: last ? "none" : "1px solid #f3f4f6" }}>
    <span style={{ fontSize: 14, color: "#6b7280", flex: 1, marginRight: 12 }}>{label}</span>
    <StatusBadge value={value} />
  </div>
);

interface CardProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const Card = ({ title, children, collapsible = false, defaultOpen = true }: CardProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #f0ece8", marginBottom: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {title && (
        <div onClick={collapsible ? () => setOpen((o) => !o) : undefined} style={{ padding: "12px 16px 10px", borderBottom: open ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: collapsible ? "pointer" : "default" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</span>
          {collapsible && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      )}
      {(!collapsible || open) && children}
    </div>
  );
};

interface LightboxProps {
  src: string;
  onClose: () => void;
}

function Lightbox({ src, onClose }: LightboxProps) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      <img src={src} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12, objectFit: "contain" }} />
    </div>
  );
}

interface PhotoStripProps {
  photos: Photo[];
  borderColor?: string;
}

function PhotoStrip({ photos, borderColor }: PhotoStripProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {photos.map((photo) => (
          <img key={photo.id} src={photo.url} alt="" onClick={() => setLightbox(photo.url)} style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: borderColor ? `1.5px solid ${borderColor}` : "1.5px solid #e5e7eb", flexShrink: 0 }} />
        ))}
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

interface PVViewProps {
  pv: PV;
  onBack: () => void;
  onPDF: () => void;
  onEdit: () => void;
}

export default function PVView({ pv, onBack, onPDF, onEdit }: PVViewProps) {
  const [showVersions, setShowVersions] = useState(false);
  const versions = pv.versions || [];
  const reserves = pv.reserves || [];
  const participants = pv.participants || [];
  const etatSurface = pv.etatSurface || {};
  const releves = pv.releves || {};
  const points = pv.points || {};

  return (
    <div className="scr fade-in">
      <div className="step-hdr">
        <button className="step-back" onClick={onBack}><I.Back /></button>
        <div className="step-hdr-title">Détail du PV</div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {versions.length > 0 && (
            <button onClick={() => setShowVersions(true)} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555", position: "relative", flexShrink: 0 }}>
              <I.History />
              <span style={{ position: "absolute", top: -3, right: -3, background: "#D32F2F", color: "#fff", borderRadius: 50, fontSize: 9, fontWeight: 800, padding: "1px 5px", lineHeight: 1.4 }}>{versions.length}</span>
            </button>
          )}
          <button onClick={onEdit} style={{ background: "#fff0f0", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D32F2F", flexShrink: 0 }} title="Modifier">
            <I.Annotate />
          </button>
        </div>
      </div>

      <div className="cnt fade-in">
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #f0ece8", padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 3 }}>Référence PV</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>{pv.savedRef || pv.num || "—"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 3 }}>Créé le</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{pv.savedDate || pv.date || "—"}</div>
          </div>
        </div>

        <Card title="Informations générales" collapsible defaultOpen={false}>
          <Row label="Chantier" value={pv.name} />
          <Row label="Zone / Bâtiment" value={pv.zone} />
          <Row label="Agence" value={pv.agency} />
          <Row label="Établissement" value={pv.etablissement} />
          <Row label="Date d'inspection" value={pv.date} />
          <Row label="Responsable" value={pv.responsable} last />
        </Card>

        {reserves.length > 0 && (
          <Card title={`Réserves (${reserves.length})`}>
            {reserves.map((reserve, index) => (
              <div key={reserve.id || index} style={{ padding: "12px 16px", borderBottom: index < reserves.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#D32F2F", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Réserve #{String(index + 1).padStart(2, "0")}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: reserve.detail ? 4 : 0 }}>{reserve.localisation || "—"}</div>
                {reserve.detail && <div style={{ fontSize: 13, color: "#6b7280" }}>{reserve.detail}</div>}
                {(reserve.localisationPhoto || (reserve.photos || []).length > 0) && (
                  <div style={{ marginTop: 10 }}>
                    {reserve.localisationPhoto && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Localisation</div>
                        <PhotoStrip photos={[reserve.localisationPhoto]} borderColor="#D32F2F" />
                      </div>
                    )}
                    {(reserve.photos || []).length > 0 && <PhotoStrip photos={reserve.photos} />}
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}

        <Card title="État de surface">
          {SURFACE_FIELDS.map(([key, label], index) => (
            <div key={key}>
              <StatusRow label={label} value={etatSurface[key] as string} last={index === SURFACE_FIELDS.length - 1 && etatSurface[key] !== "Non Conforme"} />
              {etatSurface[key] === "Non Conforme" && (
                <div style={{ padding: "0 16px 12px", background: "#fff8f8" }}>
                  {((etatSurface[key + "Photos"] as Photo[]) || []).length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <PhotoStrip photos={etatSurface[key + "Photos"] as Photo[]} borderColor="#fdd" />
                    </div>
                  )}
                  {etatSurface[key + "Comment"] && (
                    <div style={{ fontSize: 13, color: "#555", fontStyle: "italic", lineHeight: 1.5 }}>{etatSurface[key + "Comment"] as string}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card title="Relevés d'étanchéité">
          {RELEVES_FIELDS.map(([key, label], index) => (
            <StatusRow key={key} label={label} value={releves[key]} last={index === RELEVES_FIELDS.length - 1} />
          ))}
        </Card>

        <Card title="Points singuliers">
          {POINT_FIELDS.map(([key, label], index) => (
            <StatusRow key={key} label={label} value={points[key]} last={index === POINT_FIELDS.length - 1 && !points.observations} />
          ))}
          {points.observations && (
            <div style={{ padding: "10px 16px 12px", borderTop: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Observations</div>
              <div style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.5 }}>{points.observations}</div>
            </div>
          )}
        </Card>

        <Card title="Participants & signatures">
          {participants.map((participant, index) => {
            const isSMAC = index === 0;
            return (
              <div key={participant.id || index} style={{ padding: "12px 16px", borderBottom: index < participants.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                  {isSMAC ? "Nom SMAC" : `Participant ${String(index + 1).padStart(2, "0")}`}
                </div>
                {!isSMAC && participant.titre && <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 2 }}>{participant.titre}</div>}
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>{participant.nom || "—"}</div>
                {participant.sigDataUrl ? (
                  <img src={participant.sigDataUrl} alt="Signature" style={{ width: "100%", maxHeight: 110, objectFit: "contain", border: "1px solid #f0ece8", borderRadius: 10, background: "#fafaf9" }} />
                ) : (
                  <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f0ece8", borderRadius: 10, background: "#fafaf9", color: participant.signed ? "#16a34a" : "#9ca3af", fontSize: 13, fontWeight: 600 }}>
                    {participant.signed ? "✓ Signé" : "Aucune signature"}
                  </div>
                )}
              </div>
            );
          })}
          {participants[0] && (
            <div style={{ padding: "10px 16px 12px", borderTop: "1px solid #f3f4f6" }}>
              <Row label="Réception acceptée ?" value={participants[0].reception || "—"} />
              {participants[0].miseEnConformite && <Row label="Mise en conformité le" value={participants[0].miseEnConformite} />}
              {participants[0].reporterAu && <Row label="Reporter au" value={participants[0].reporterAu} last />}
            </div>
          )}
        </Card>

        <button onClick={onPDF} style={{ width: "100%", padding: "14px", background: "#D32F2F", color: "white", border: "none", borderRadius: 999, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 24, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(211,47,47,0.35)" }}>
          <I.Download /> Télécharger le PDF
        </button>
      </div>

      {showVersions && <VersionModal pv={pv} onClose={() => setShowVersions(false)} />}
    </div>
  );
}
