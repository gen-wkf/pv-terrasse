import PVView from "./PVView";
import { I } from "../icons";
import type { PV, Toast, User } from "../types";

export const renderSplashScreen = (toasts: Toast[]): React.ReactElement => (
  <>
    <div className="shell">
      <div className="splash fade-in">
        <div className="splash-ring">
          <div className="splash-arc" />
          <div>
            <div className="splash-logo">
              <img src="/smac-logo.png" alt="SMAC" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="toast-wrap">
      {toasts.map((toastItem) => (
        <div key={toastItem.id} className={`toast ${toastItem.type}`}>{toastItem.msg}</div>
      ))}
    </div>
  </>
);

export const renderHomeScreen = (
  viewPV: PV | null,
  filteredPVs: PV[],
  search: string,
  onSearch: (val: string) => void,
  onViewPV: (pv: PV) => void,
  onOpenNewPV: () => void,
  onOpenEditPV: (pv: PV) => void,
  onOpenPDF: (pv: PV, event?: React.MouseEvent) => void,
  onGoHome: () => void,
  toasts: Toast[],
  CURRENT_USER: User,
): React.ReactElement => {
  const userInitials = CURRENT_USER.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="shell">
        {viewPV ? (
          <PVView pv={viewPV} onBack={() => onGoHome()} onPDF={() => onOpenPDF(viewPV)} onEdit={() => onOpenEditPV(viewPV)} />
        ) : (
          <div className="scr fade-in">
            <div className="topbar">
              <img src="/smac-logo.png" alt="SMAC" className="tb-logo" />
              <div className="tb-title">PV de Réception<br />Support Terrasse</div>
              <div className="tb-avatar" style={{ background: "#1a1a3e" }}>{userInitials}</div>
            </div>

            <div className="cnt fade-in">
              <div className="search-bar">
                <I.Search />
                <input type="text" placeholder=" Rechercher un PV ou un chantier..." value={search} onChange={(event) => onSearch(event.target.value)} autoComplete="off" />
              </div>

              {filteredPVs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><I.EmptyDoc /></div>
                  <div className="empty-title">Aucun PV trouvé</div>
                  <div className="empty-desc">Commencez votre première inspection dès maintenant pour générer votre premier procès-verbal.</div>
                  <button className="btn-red" onClick={onOpenNewPV}><I.Plus /> Créer un nouveau PV</button>
                </div>
              ) : (
                <>
                  <div className="list-hdr">
                    <span className="list-t">Liste des PV</span>
                    <span className="list-cnt">{filteredPVs.length} rapport{filteredPVs.length > 1 ? "s" : ""}</span>
                  </div>
                  {filteredPVs.map((pv) => (
                    <div key={pv.id} className="pv-card" onClick={() => onViewPV(pv)}>
                      <div className="pv-card-inner">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="pv-num">{pv.num}</div>
                          <div className="pv-name">{pv.name}</div>
                          <div className="pv-meta">
                            <span className="pv-meta-item"><I.Agency /> {pv.agency}</span>
                            <span className="pv-meta-item"><I.Cal /> {pv.date}</span>
                          </div>
                          {pv.etablissement && (
                            <div className="pv-meta">
                              <span className="pv-meta-item"><I.Building /> {pv.etablissement}</span>
                            </div>
                          )}
                        </div>
                        <button className="pv-pdf" onClick={(e) => { e.stopPropagation(); onOpenPDF(pv, e); }}><I.PDF /></button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <button className="fab" onClick={onOpenNewPV}><I.Plus /></button>
          </div>
        )}
      </div>

      <div className="toast-wrap">
        {toasts.map((toastItem) => (
          <div key={toastItem.id} className={`toast ${toastItem.type}`}>{toastItem.msg}</div>
        ))}
      </div>
    </>
  );
};
