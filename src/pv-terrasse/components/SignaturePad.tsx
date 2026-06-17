import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  label?: string;
  onSign: (signed: boolean) => void;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  extraAction?: React.ReactNode;
}

export default function SignaturePad({ label, onSign, onCanvasReady, extraAction }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const source = "touches" in event ? event.touches[0] : event;
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
    };
  };

  const onCanvasReadyRef = useRef(onCanvasReady);
  onCanvasReadyRef.current = onCanvasReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    onCanvasReadyRef.current?.(canvas);
  }, []);

  const start = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDrawing(true);
    const pos = getPos(event, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const move = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    const pos = getPos(event, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
    onSign?.(true);
  };

  const end = () => {
    setDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSign?.(false);
  };

  return (
    <div>
      {label && <div className="lbl">{label}</div>}
      <div className="sig-wrap">
        <canvas
          ref={canvasRef}
          className="sig-canvas"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {!hasSignature && <div className="sig-placeholder">Signer ici</div>}
      </div>

      {hasSignature && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <button className="sig-clear-ext" onClick={clear}>Effacer</button>
          {extraAction && extraAction}
        </div>
      )}
    </div>
  );
}
