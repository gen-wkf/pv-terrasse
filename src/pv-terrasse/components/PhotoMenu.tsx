import { I } from "../icons";
import type { Photo } from "../types";

interface PhotoMenuProps {
  photo: Photo;
  onAnnotate: () => void;
  onReplace: () => void;
  onClose: () => void;
}

export default function PhotoMenu({ photo, onAnnotate, onReplace, onClose }: PhotoMenuProps) {
  return (
    <div className="photo-menu-bg" onClick={onClose}>
      <div className="photo-menu" onClick={(event) => event.stopPropagation()}>
        <div style={{ width: 80, height: 64, borderRadius: 10, overflow: "hidden", margin: "0 auto 12px" }}>
          <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="photo-menu-title">Options de la photo</div>
        <div className="photo-menu-sub">Que souhaitez-vous faire ?</div>
        <button className="photo-menu-btn primary" onClick={onAnnotate}>
          <I.Annotate /> Annoter l'image
        </button>
        <button className="photo-menu-btn secondary" onClick={onReplace}>
          <I.Swap /> Changer l'image
        </button>
        <button className="photo-menu-btn cancel" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}
