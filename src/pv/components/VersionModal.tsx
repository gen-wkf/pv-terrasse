import { I } from "../icons";
import { createPdfDataFromVersion, downloadPDF } from "../helpers";
import type { PV } from "../types";

interface VersionModalProps {
  pv: PV;
  onClose: () => void;
}

export default function VersionModal({ pv, onClose }: VersionModalProps) {
  const versions = pv.versions || [];

  return (
    <div className="ver-modal-bg" onClick={onClose}>
      <div className="ver-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ver-hdr">
          <div>
            <div className="ver-hdr-title">Historique des versions</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
              {pv.num} · {versions.length} version(s)
            </div>
          </div>
          <button className="ver-close" onClick={onClose}>
            <I.X />
          </button>
        </div>
        <div className="ver-list">
          {versions.length === 0 ? (
            <div className="ver-empty">Aucune version sauvegardée</div>
          ) : (
            [...versions].reverse().map((version, index) => (
              <div key={version.id || index} className="ver-item">
                <div className="ver-item-info">
                  <div className="ver-item-num">Version {versions.length - index}</div>
                  <div className="ver-item-date">{version.savedDate}</div>
                  <div className="ver-item-label">{version.chantier}</div>
                </div>
                <button className="ver-item-btn" onClick={() => downloadPDF(createPdfDataFromVersion(version))}>
                  <I.Download /> PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
