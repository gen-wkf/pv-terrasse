import { I } from "../icons";
import { POINT_FIELDS, RELEVES_FIELDS, SURFACE_FIELDS } from "../schema";
import { downloadPDF } from "../helpers";
import type { PdfData, Photo } from "../types";

interface BadgeProps {
  value?: string;
}

const Badge = ({ value = "SO" }: BadgeProps) => {
  const bg = value === "Conforme" ? "#e8f5e9" : value === "Non Conforme" ? "#ffebee" : "#fff3e0";
  const color = value === "Conforme" ? "#1a7a3f" : value === "Non Conforme" ? "#D32F2F" : "#e65100";
  return (
    <span className="pdf-badge" style={{ background: bg, color }}>
      {value}
    </span>
  );
};

interface PDFViewerProps {
  pvData: PdfData;
  onClose: () => void;
}

export default function PDFViewer({ pvData, onClose }: PDFViewerProps) {
  const { form, reserves, etatSurface, releves, points, participants, savedPV } = pvData;

  return (
    <div className="pdf-overlay" onClick={onClose}>
      <div className="pdf-doc" onClick={(event) => event.stopPropagation()}>
        <div className="pdf-toolbar">
          <div className="pdf-toolbar-title">Document PV</div>
          <button className="pdf-dl" onClick={() => downloadPDF(pvData)}>
            <I.Download /> Télécharger
          </button>
          <button className="pdf-close" onClick={onClose}>
            <I.X />
          </button>
        </div>

        <div className="pdf-body">
          <div className="pdf-header">
            <div>
              <div className="pdf-logo">SMAC</div>
              <div className="pdf-title">PV de Réception Support Terrasse</div>
            </div>
            <div>
              <div className="pdf-ref">{savedPV?.ref || "—"}</div>
              <div className="pdf-date">{savedPV?.date || "—"}</div>
            </div>
          </div>

          <div className="pdf-section">
            <div className="pdf-sec-hdr">Informations Générales</div>
            {[
              ["Chantier", form.chantier || "—"],
              ["Agence", form.agence || "—"],
              ["Établissement", form.etablissement || "—"],
              ["Zone / Bâtiment", form.zone || "—"],
              ["Date d'inspection", form.date || "—"],
              ["Responsable", form.responsable || "—"],
            ].map(([label, value]) => (
              <div key={label} className="pdf-row">
                <span className="pdf-row-key">{label}</span>
                <span className="pdf-row-val">{value}</span>
              </div>
            ))}
          </div>

          {reserves.length > 0 && (
            <div className="pdf-section">
              <div className="pdf-sec-hdr">Réserves ({reserves.length})</div>
              {reserves.map((reserve, index) => (
                <div key={reserve.id || index} style={{ padding: "12px 14px", borderTop: index > 0 ? "1px solid #f5f0eb" : "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#D32F2F", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                    Réserve #{String(index + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{reserve.localisation || "—"}</div>
                  {reserve.detail && <div style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{reserve.detail}</div>}
                  {(reserve.photos || []).length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#D32F2F", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Photos ({reserve.photos.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {reserve.photos.map((photo) => (
                          <img key={photo.id} src={photo.url} alt="" style={{ width: "100%", borderRadius: 10, border: "2px solid #e0dcd8", objectFit: "cover", display: "block" }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pdf-section">
            <div className="pdf-sec-hdr">État de Surface</div>
            {SURFACE_FIELDS.map(([key, label]) => (
              <div key={key}>
                <div className="pdf-row">
                  <span className="pdf-row-key">{label}</span>
                  <Badge value={etatSurface[key] as string} />
                </div>
                {etatSurface[key] === "Non Conforme" && (
                  <div style={{ padding: "10px 14px 14px", background: "#fff8f8", borderBottom: "1px solid #f5f0eb" }}>
                    {((etatSurface[key + "Photos"] as Photo[]) || []).length > 0 && (
                      <div style={{ marginBottom: etatSurface[key + "Comment"] ? 10 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#D32F2F", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Photos ({(etatSurface[key + "Photos"] as Photo[]).length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(etatSurface[key + "Photos"] as Photo[]).map((photo) => (
                            <img key={photo.id} src={photo.url} alt="" style={{ width: "100%", borderRadius: 10, border: "2px solid #D32F2F", objectFit: "cover", display: "block" }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {etatSurface[key + "Comment"] && (
                      <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", background: "white", border: "1px solid #fdd", borderRadius: 8, padding: "8px 10px", lineHeight: 1.5 }}>
                        {etatSurface[key + "Comment"] as string}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pdf-section">
            <div className="pdf-sec-hdr">Relevés d'Étanchéité</div>
            {RELEVES_FIELDS.map(([key, label]) => (
              <div key={key} className="pdf-row">
                <span className="pdf-row-key">{label}</span>
                <Badge value={releves[key]} />
              </div>
            ))}
          </div>

          <div className="pdf-section">
            <div className="pdf-sec-hdr">Points Singuliers</div>
            {POINT_FIELDS.map(([key, label]) => (
              <div key={key} className="pdf-row">
                <span className="pdf-row-key">{label}</span>
                <Badge value={points[key]} />
              </div>
            ))}
            {points.observations && (
              <div className="pdf-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <span className="pdf-row-key">Observations</span>
                <span style={{ fontSize: 13, color: "#333" }}>{points.observations}</span>
              </div>
            )}
          </div>

          <div className="pdf-section">
            <div className="pdf-sec-hdr">Participants & Signatures</div>
            {participants.map((participant, index) => (
              <div key={participant.id || index} className="pdf-sig-block">
                <div className="pdf-sig-name">
                  <span>{participant.nom || `Participant ${index + 1}`}</span>
                  <span className="pdf-sig-status" style={{ background: participant.signed ? "#e8f5e9" : "#f5f5f5", color: participant.signed ? "#1a7a3f" : "#bbb" }}>
                    {participant.signed ? "✓ Signé" : "Non signé"}
                  </span>
                </div>
                {participant.titre && <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{participant.titre}</div>}
                <div className="pdf-sig-img-wrap">
                  {participant.sigDataUrl ? (
                    <img src={participant.sigDataUrl} alt="signature" />
                  ) : (
                    <span className="pdf-sig-unsigned">Aucune signature enregistrée</span>
                  )}
                </div>
              </div>
            ))}
            <div className="pdf-row">
              <span className="pdf-row-key">Réception acceptée</span>
              <Badge value={participants[0]?.reception === "OUI" ? "Conforme" : "Non Conforme"} />
            </div>
            {participants[0]?.miseEnConformite && (
              <div className="pdf-row">
                <span className="pdf-row-key">Mise en conformité</span>
                <span className="pdf-row-val">{participants[0].miseEnConformite}</span>
              </div>
            )}
          </div>

          <div className="pdf-footer">Document généré par SMAC • {savedPV?.date || "—"}</div>
        </div>
      </div>
    </div>
  );
}
