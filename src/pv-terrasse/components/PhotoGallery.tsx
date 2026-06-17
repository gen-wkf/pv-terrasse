import { I } from "../icons";
import type { Photo } from "../types";

interface PhotoGalleryProps {
  photos: Photo[];
  title?: string;
  onClose: () => void;
  onPhotoClick?: (photo: Photo) => void;
}

export default function PhotoGallery({ photos, title, onClose, onPhotoClick }: PhotoGalleryProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#f4f6fb", zIndex: 55, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(15,23,42,0.12)", flexShrink: 0,
          position: "sticky", top: 0, zIndex: 1,
        }}
      >
        <button
          onClick={onClose}
          style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", cursor: "pointer", flexShrink: 0 }}
        >
          <I.Back />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{title || "Photos"}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, marginTop: 1 }}>
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px", display: "flex", flexDirection: "column", gap: 16 }}>
        {photos.map((photo, i) => (
          <div
            key={photo.id || i}
            style={{ cursor: onPhotoClick ? "pointer" : "default" }}
            onClick={() => onPhotoClick && onPhotoClick(photo)}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#D32F2F", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Photo {i + 1} / {photos.length}
            </div>
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid rgba(15,23,42,0.10)", overflow: "hidden", boxShadow: "0 4px 16px rgba(15,23,42,0.08)" }}>
              <img src={photo.url} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
