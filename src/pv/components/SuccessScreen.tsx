import { I } from "../icons";
import type { SavedPVRef } from "../types";

interface SuccessScreenProps {
  savedResult: SavedPVRef | null;
  reserveCount: number;
  onDownloadPDF: () => void;
  onViewPV: () => void;
  onGoHome: () => void;
  onShareEmail: () => void;
}

export default function SuccessScreen({ savedResult, reserveCount, onDownloadPDF, onViewPV, onGoHome, onShareEmail }: SuccessScreenProps) {
  const isEdit = savedResult?.isEdit;

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px 60px" }}>

        <div style={{ position: "relative", marginBottom: 14, flexShrink: 0 }}>
          <div style={{ width: 66, height: 66, background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 22px rgba(211,47,47,0.38)" }}>
            <I.Shield />
          </div>
          <div style={{ position: "absolute", bottom: -5, right: -5, width: 22, height: 22, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid white" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", textAlign: "center", lineHeight: 1.3, marginBottom: 6, flexShrink: 0 }}>
          {isEdit ? "PV Mis à Jour !" : "PV Enregistré avec Succès !"}
        </div>

        <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.55, marginBottom: 16, maxWidth: 280, flexShrink: 0 }}>
          {isEdit
            ? "Les modifications du procès-verbal ont été sauvegardées en toute sécurité."
            : "Le procès-verbal pour le chantier a été généré et sauvegardé en toute sécurité."}
        </div>

        <div style={{ width: "100%", background: "white", borderRadius: 14, border: "1px solid #f0ece8", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "1px solid #f3f4f6", background: "#f3f4f6" }}>
            <div style={{ width: 32, height: 32, background: "#fff0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#D32F2F", flexShrink: 0 }}>
              <I.Doc />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500, marginBottom: 2 }}>Référence PV</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3a5f" }}>{savedResult?.ref || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f3f4f6" }}>
            <div style={{ width: 32, height: 32, background: "#fff0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#D32F2F", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 1 }}>Horodatage</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{savedResult?.dateStr || "—"}</div>
            </div>
          </div>
        </div>

        <button onClick={onDownloadPDF} style={{ width: "100%", padding: "12px", background: "#D32F2F", color: "white", border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 8, flexShrink: 0, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(211,47,47,0.35)" }}>
          <I.Download /> Télécharger le PDF
        </button>

        <button onClick={onShareEmail} style={{ width: "100%", padding: "11px", background: "#f3f4f6", color: "#1a1a1a", border: "1.5px solid #e5e7eb", borderRadius: 999, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 12, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
          <I.Mail /> Partager par email
        </button>

        <div onClick={onViewPV} style={{ width: "100%", background: "white", borderRadius: 14, border: "1px solid #f0ece8", padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "#fff0f0", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#D32F2F", flexShrink: 0 }}>
            <I.Doc />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>Aperçu rapide du PV</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {reserveCount} réserve{reserveCount !== 1 ? "s" : ""}
            </div>
          </div>
          <I.ChevronRight />
        </div>

        <div onClick={onGoHome} style={{ textAlign: "center", color: "#D32F2F", fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: 1.1, textTransform: "uppercase", padding: "6px 0", flexShrink: 0 }}>
          RETOUR SUR LA LISTE DES PV
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 30 }}>
        <div onClick={onGoHome} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 32px 10px", cursor: "pointer", color: "#D32F2F" }}>
          <I.Home />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>Accueil PSA</span>
        </div>
      </div>
    </div>
  );
}
