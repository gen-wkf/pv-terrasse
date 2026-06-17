import { useState, useRef, useEffect } from "react";
import { I } from "../icons";

interface DictaphoneProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export default function Dictaphone({ value, onChange, hasError }: DictaphoneProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        const current = valueRef.current || "";
        onChange(current ? current + " " + transcript : transcript);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        className={`inp${hasError ? " inp-err" : ""}`}
        placeholder="Décrivez la non-conformité..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: 44, resize: "vertical" }}
      />
      <button
        type="button"
        onClick={toggle}
        title={listening ? "Arrêter la dictée" : "Dicter"}
        style={{
          position: "absolute", bottom: 10, right: 10, width: 30, height: 30,
          borderRadius: "50%", border: "none",
          background: listening ? "#D32F2F" : "#e5e7eb",
          color: listening ? "white" : "#6b7280",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "background 0.2s, color 0.2s", flexShrink: 0,
        }}
      >
        <I.Mic />
      </button>
      {listening && (
        <div style={{ fontSize: 11, color: "#D32F2F", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D32F2F", display: "inline-block", animation: "dictPulse 1s ease-in-out infinite" }} />
          Dictée en cours…
        </div>
      )}
      <style>{`@keyframes dictPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}`}</style>
    </div>
  );
}
