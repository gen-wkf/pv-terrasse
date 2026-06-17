import { useEffect, useRef, useState } from "react";
import { I } from "../icons";

type Tool = "pen" | "arrow" | "rect" | "circle" | "text";

const TOOLS: { key: Tool; label: string; icon: React.ReactNode }[] = [
  {
    key: "pen", label: "Dessin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    key: "arrow", label: "Flèche",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="8 5 19 5 19 16"/></svg>,
  },
  {
    key: "rect", label: "Rect.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  },
  {
    key: "circle", label: "Cercle",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/></svg>,
  },
  {
    key: "text", label: "Texte",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  },
];

const COLORS = ["#D32F2F", "#F59E0B", "#16a34a", "#2563EB", "#ffffff", "#0f172a"];
const SIZES = [3, 7];

interface AnnotationModalProps {
  src: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export default function AnnotationModal({ src, onSave, onClose }: AnnotationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#D32F2F");
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState<Tool>("pen");
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const ratio = image.width / image.height;
      const maxWidth = Math.min(window.innerWidth, 420) - 16;
      const maxHeight = window.innerHeight - 210;
      let w = maxWidth;
      let h = maxWidth / ratio;
      if (h > maxHeight) { h = maxHeight; w = maxHeight * ratio; }
      canvas.width = w; canvas.height = h;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, w, h);
      setHistory([ctx.getImageData(0, 0, w, h)]);
    };
    image.src = src;
  }, [src]);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const saveState = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.putImageData(history[history.length - 2], 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    if (history.length < 1) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.putImageData(history[0], 0, 0);
    setHistory([history[0]]);
  };

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    startPos.current = pos;
    saveState();
    if (tool === "pen") { setDrawing(true); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); return; }
    if (["rect", "arrow", "circle"].includes(tool)) { snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height); setDrawing(true); return; }
    if (tool === "text") {
      const text = prompt("Entrez votre texte :");
      if (text) { ctx.font = `bold ${size * 3 + 12}px sans-serif`; ctx.fillStyle = color; ctx.fillText(text, pos.x, pos.y); }
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);

    if (tool === "pen") {
      ctx.lineWidth = size; ctx.lineCap = "round"; ctx.strokeStyle = color;
      ctx.lineTo(pos.x, pos.y); ctx.stroke(); return;
    }
    if (tool === "rect" && snapshotRef.current && startPos.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.strokeRect(startPos.current.x, startPos.current.y, pos.x - startPos.current.x, pos.y - startPos.current.y); return;
    }
    if (tool === "circle" && snapshotRef.current && startPos.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      const rx = Math.abs(pos.x - startPos.current.x) / 2;
      const ry = Math.abs(pos.y - startPos.current.y) / 2;
      const cx = startPos.current.x + (pos.x - startPos.current.x) / 2;
      const cy = startPos.current.y + (pos.y - startPos.current.y) / 2;
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke(); return;
    }
    if (tool === "arrow" && snapshotRef.current && startPos.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      const sx = startPos.current.x, sy = startPos.current.y, ex = pos.x, ey = pos.y;
      const angle = Math.atan2(ey - sy, ex - sx);
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      const head = 14 + size * 2;
      ctx.fillStyle = color; ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - head * Math.cos(angle - 0.4), ey - head * Math.sin(angle - 0.4));
      ctx.lineTo(ex - head * Math.cos(angle + 0.4), ey - head * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fill();  
    }
  };

  const handleUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => { e.preventDefault(); setDrawing(false); };

  const save = () => { if (canvasRef.current) onSave(canvasRef.current.toDataURL("image/png")); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#111", display: "flex", flexDirection: "column", position: "relative" }}>

        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <I.X />
        </button>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 8px 8px" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", touchAction: "none", borderRadius: 8 }}
            onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp}
            onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={handleUp}
          />
        </div>

        <div style={{ background: "#1a1a1a", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4, padding: "10px 10px 6px" }}>
            {TOOLS.map((t) => (
              <button key={t.key} onClick={() => setTool(t.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: tool === t.key ? "#D32F2F" : "transparent", color: tool === t.key ? "white" : "#9ca3af", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}>
                {t.icon}
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{t.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 10px", justifyContent: "center", borderTop: "1px solid #2a2a2a" }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} style={{ width: color === c ? 28 : 24, height: color === c ? 28 : 24, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: color === c ? "2.5px solid white" : "2px solid transparent", outlineOffset: 2, flexShrink: 0, transition: "all 0.15s" }} />
            ))}
            <div style={{ width: 1, height: 20, background: "#444", margin: "0 2px" }} />
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{ width: s === 3 ? 10 : 16, height: s === 3 ? 10 : 16, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0, background: size === s ? "#D32F2F" : "#555", transition: "background 0.15s" }} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 20px" }}>
            <button onClick={undo} style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: "#2a2a2a", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} title="Annuler">
              <I.Undo />
            </button>
            <button onClick={clearAll} style={{ width: 46, height: 46, borderRadius: 10, border: "none", background: "#3a1010", color: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} title="Tout effacer">
              <I.Trash />
            </button>
            <button onClick={save} style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: "#D32F2F", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
