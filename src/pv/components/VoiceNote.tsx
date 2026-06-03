import { useState, useRef, useEffect } from "react";
import { I } from "../icons";

interface VoiceNoteProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export default function VoiceNote({ value, onChange, readOnly = false }: VoiceNoteProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mrRef.current?.state === "recording") mrRef.current.stop();
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);

      mr.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => onChange(reader.result as string);
        reader.readAsDataURL(blob);
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsed(0);
      };

      mr.start();
      mrRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((d) => d + 1), 1000);
    } catch {
      alert("Microphone non disponible ou accès refusé.");
    }
  };

  const stop = () => {
    mrRef.current?.stop();
    mrRef.current = null;
    setRecording(false);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  const remove = () => {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrentTime(0);
    onChange("");
  };

  if (readOnly && !value) return null;

  return (
    <div style={{ marginTop: 10 }}>
      {!readOnly && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="lbl" style={{ margin: 0 }}>Note vocale</span>
          {!value && !recording && (
            <button onClick={start} style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff0f0", border: "none", color: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Ajouter une note vocale">
              <I.Mic />
            </button>
          )}
        </div>
      )}

      {recording && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff0f0", borderRadius: 12, padding: "10px 14px", border: "1.5px solid #fdd" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#D32F2F", display: "inline-block", animation: "vn-pulse 1s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#D32F2F" }}>Enregistrement… {fmt(elapsed)}</span>
          </div>
          <button onClick={stop} style={{ display: "flex", alignItems: "center", gap: 6, background: "#D32F2F", border: "none", borderRadius: 999, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <I.Stop /> Arrêter
          </button>
        </div>
      )}

      {value && !recording && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f3f4f6", borderRadius: 12, padding: "10px 14px" }}>
          <button onClick={togglePlay} style={{ width: 34, height: 34, borderRadius: "50%", background: "#D32F2F", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {playing ? <I.Pause /> : <I.Play />}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
              Note vocale · {fmt(Math.round(audioDuration))}
            </div>
            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#D32F2F", borderRadius: 999, width: audioDuration > 0 ? `${(currentTime / audioDuration) * 100}%` : "0%", transition: "width 0.25s linear" }} />
            </div>
          </div>
          {!readOnly && (
            <button onClick={remove} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }} title="Supprimer la note vocale">
              <I.X />
            </button>
          )}
          <audio
            ref={audioRef}
            src={value}
            onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onEnded={() => { setPlaying(false); setCurrentTime(0); }}
            style={{ display: "none" }}
          />
        </div>
      )}

      <style>{`@keyframes vn-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}`}</style>
    </div>
  );
}
