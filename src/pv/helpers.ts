import { useCallback, useState } from "react";
import emailjs from "@emailjs/browser";
import html2pdf from "html2pdf.js";
import {
  AVATAR_COLORS,
  INITIAL_ETAT_SURFACE,
  INITIAL_FORM,
  INITIAL_PARTICIPANT,
  INITIAL_POINTS,
  INITIAL_RELEVES,
  SURFACE_FIELDS,
  RELEVES_FIELDS,
  POINT_FIELDS,
} from "./schema";
import type { EtatSurface, Form, Participant, PdfData, Photo, Points, Releves, Toast } from "./types";

let _id = 300;

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export const uid = (): number => ++_id;

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve((event.target?.result as string) ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export async function pickImages(): Promise<Photo[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const images = await Promise.all(
        files.map(async (file) => ({
          id: uid(),
          url: await readFile(file),
        })),
      );
      resolve(images);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

export function useToast(): { toasts: Toast[]; push: (msg: string, type?: string) => void } {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, type = "") => {
    const id = uid();
    setToasts((prev) => [...prev, { id, msg, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  return { toasts, push };
}

export function genPVRef(): string {
  const year = new Date().getFullYear();
  const suffix = String(uid()).slice(-4);
  return `PV-${year}-${suffix}-SMAC`;
}

export const avatarColor = (name: string): string =>
  AVATAR_COLORS[(name || "").charCodeAt(0) % AVATAR_COLORS.length];

export const initials = (name: string): string => {
  const value = (name || "?").trim();
  if (!value) return "?";
  return (
    value
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
};

export const createInitialForm = (): Form => ({ ...INITIAL_FORM });
export const createInitialEtatSurface = (): EtatSurface => ({ ...INITIAL_ETAT_SURFACE });
export const createInitialReleves = (): Releves => ({ ...INITIAL_RELEVES });
export const createInitialPoints = (): Points => ({ ...INITIAL_POINTS });

export const createParticipant = (overrides: Partial<Omit<Participant, "id">> = {}): Participant => ({
  id: uid(),
  ...INITIAL_PARTICIPANT,
  reporterAu: "",
  ...overrides,
});

export const createParticipants = (): Participant[] => [createParticipant()];

export function formatPVTimestamp(date: Date = new Date()): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} • ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export const createPdfDataFromPV = (pv: {
  agency?: string;
  etablissement?: string;
  name?: string;
  zone?: string;
  date?: string;
  responsable?: string;
  reserves?: PdfData["reserves"];
  etatSurface?: EtatSurface;
  releves?: Releves;
  points?: Points;
  participants?: Participant[];
  savedRef?: string;
  num?: string;
  savedDate?: string;
}): PdfData => ({
  form: {
    agence: pv.agency || "",
    etablissement: pv.etablissement || "",
    chantier: pv.name || "",
    zone: pv.zone || "—",
    date: pv.date || "",
    responsable: pv.responsable || "—",
  },
  reserves: pv.reserves || [],
  etatSurface: pv.etatSurface || { reg1: "SO", reg1Photos: [], reg1Comment: "", prop1: "SO", prop1Photos: [], prop1Comment: "", reg2: "SO", reg2Photos: [], reg2Comment: "", prop2: "SO", prop2Photos: [], prop2Comment: "" },
  releves: pv.releves || { trous: "SO", remplissage: "SO", hauteur: "SO", profondeur: "SO", protection: "SO", niveaux: "SO" },
  points: pv.points || { tremies: "SO", eaux: "SO", deversoirs: "SO", trop: "SO", reservations: "SO", joints: "SO", observations: "" },
  participants: pv.participants || [],
  savedPV: {
    ref: pv.savedRef || pv.num || "—",
    date: pv.savedDate || pv.date || "—",
  },
});

export const createPdfDataFromVersion = (version: {
  agency?: string;
  etablissement?: string;
  chantier?: string;
  zone?: string;
  date?: string;
  responsable?: string;
  reserves?: PdfData["reserves"];
  etatSurface?: EtatSurface;
  releves?: Releves;
  points?: Points;
  participants?: Participant[];
  ref?: string;
  savedDate?: string;
}): PdfData => ({
  form: {
    agence: version.agency || "",
    etablissement: version.etablissement || "",
    chantier: version.chantier || "",
    zone: version.zone || "—",
    date: version.date || "",
    responsable: version.responsable || "—",
  },
  reserves: version.reserves || [],
  etatSurface: version.etatSurface || { reg1: "SO", reg1Photos: [], reg1Comment: "", prop1: "SO", prop1Photos: [], prop1Comment: "", reg2: "SO", reg2Photos: [], reg2Comment: "", prop2: "SO", prop2Photos: [], prop2Comment: "" },
  releves: version.releves || { trous: "SO", remplissage: "SO", hauteur: "SO", profondeur: "SO", protection: "SO", niveaux: "SO" },
  points: version.points || { tremies: "SO", eaux: "SO", deversoirs: "SO", trop: "SO", reservations: "SO", joints: "SO", observations: "" },
  participants: version.participants || [],
  savedPV: {
    ref: version.ref || "—",
    date: version.savedDate || "—",
  },
});

export function downloadPDF(pvData: PdfData): void {
  const { form, reserves, etatSurface, releves, points, participants, savedPV } = pvData;

  const fmtDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

  const badge = (value: string) => {
    const v = value || "SO";
    const color = v === "Conforme" ? "#1a7a3f" : v === "Non Conforme" ? "#D32F2F" : "#e65100";
    const bg = v === "Conforme" ? "#e8f5e9" : v === "Non Conforme" ? "#ffebee" : "#fff3e0";
    return `<span style="background:${bg};color:${color};padding:5px 14px;border-radius:20px;font-weight:800;font-size:12px;white-space:nowrap">${v}</span>`;
  };

  const fieldRow = (label: string, value: string) =>
    `<tr>
      <td style="padding:11px 8px;font-size:13px;color:#666;border-bottom:1px solid #f0ece8;width:45%">${label}</td>
      <td style="padding:11px 8px;font-size:14px;font-weight:600;color:#1a1a1a;border-bottom:1px solid #f0ece8;text-align:right">${value || "—"}</td>
    </tr>`;

  const toggleRow = (label: string, value: string) =>
    `<tr>
      <td style="padding:11px 8px;font-size:13px;color:#444;border-bottom:1px solid #f0ece8;width:65%">${label}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #f0ece8;text-align:right">${badge(value)}</td>
    </tr>`;

  const section = (title: string, content: string) =>
    `<div style="background:#fff;border-radius:14px;padding:22px;margin-bottom:22px;border:1.5px solid #f0ece8;page-break-inside:avoid">
      <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#D32F2F;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #fce4e4">${title}</div>
      ${content}
    </div>`;

  const reserveHtml = reserves.map((reserve, i) => {
    const locPhoto = reserve.localisationPhoto?.url
      ? `<div style="margin-top:14px">
           <div style="font-size:11px;font-weight:700;color:#888;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px">Photo de localisation</div>
           <img src="${reserve.localisationPhoto.url}" style="width:100%;height:auto;min-height:160px;object-fit:cover;border-radius:8px;border:2px solid #D32F2F;display:block"/>
         </div>`
      : "";
    const photos =
      (reserve.photos || []).length > 0
        ? `<div style="margin-top:16px">
           <div style="font-size:11px;font-weight:800;color:#D32F2F;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Photos (${reserve.photos.length})</div>
           <div style="display:flex;flex-direction:column;gap:16px">
             ${reserve.photos.map((p) => `<img src="${p.url}" style="width:100%;height:auto;min-height:220px;object-fit:cover;border-radius:10px;border:2px solid #D32F2F;display:block"/>`).join("")}
           </div>
         </div>`
        : "";
    return `<div style="border:2px solid #D32F2F;border-radius:14px;padding:20px;margin-bottom:20px;page-break-inside:avoid">
      <div style="background:#D32F2F;color:#fff;display:inline-block;border-radius:8px;padding:4px 14px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">
        Réserve ${String(i + 1).padStart(2, "0")}
      </div>
      <div style="font-size:18px;font-weight:800;color:#1a1a1a;margin-bottom:8px">${reserve.localisation || "—"}</div>
      ${reserve.detail ? `<div style="font-size:14px;color:#555;line-height:1.6;padding:10px 14px;background:#fafaf9;border-radius:8px;border-left:3px solid #D32F2F">${reserve.detail}</div>` : ""}
      ${locPhoto}
      ${photos}
    </div>`;
  }).join("");

  const participantHtml = participants.map((p, i) => {
    const isSMAC = i === 0;
    const roleLabel = isSMAC ? "Participant SMAC" : `Participant ${String(i + 1).padStart(2, "0")}`;
    const sigBlock = p.sigDataUrl
      ? `<img src="${p.sigDataUrl}" style="width:100%;height:180px;object-fit:contain;border:2px solid #e0dcd8;border-radius:12px;background:#fff;display:block;margin-top:10px"/>`
      : p.signed
        ? `<div style="height:90px;border:2px solid #c8e6c9;border-radius:12px;background:#f1f8e9;display:flex;align-items:center;justify-content:center;color:#2e7d32;font-size:16px;font-weight:800;margin-top:10px;gap:8px">✓ Signé</div>`
        : `<div style="height:90px;border:2px dashed #e0dcd8;border-radius:12px;background:#fafafa;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:14px;margin-top:10px">Aucune signature</div>`;
    return `<div style="border:1.5px solid #e8e4df;border-radius:14px;padding:18px;margin-bottom:18px;page-break-inside:avoid">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#D32F2F;margin-bottom:6px">${roleLabel}</div>
      <div style="font-size:17px;font-weight:800;color:#1a1a1a">${p.nom || "—"}</div>
      ${!isSMAC && p.titre ? `<div style="font-size:13px;color:#888;margin-top:3px">${p.titre}</div>` : ""}
      <div style="font-size:12px;font-weight:700;color:#555;margin-top:14px;margin-bottom:2px">${isSMAC ? "Signature SMAC" : "Signature"}</div>
      ${sigBlock}
    </div>`;
  }).join("");

  const rec = participants[0]?.reception || "—";
  const recColor = rec === "OUI" ? "#1a7a3f" : "#D32F2F";
  const recBg = rec === "OUI" ? "#e8f5e9" : "#ffebee";
  const conformiteDate = fmtDate(participants[0]?.miseEnConformite || "");
  const reporterDate = fmtDate(participants[0]?.reporterAu || "");

  const receptionBlock = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0">
      <div style="font-size:14px;color:#444;font-weight:600">Réception acceptée</div>
      <span style="background:${recBg};color:${recColor};padding:6px 18px;border-radius:20px;font-weight:800;font-size:14px">${rec}</span>
    </div>
    ${conformiteDate ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #f0ece8"><div style="font-size:13px;color:#666">Mise en conformité le</div><div style="font-size:14px;font-weight:700;color:#1a1a1a">${conformiteDate}</div></div>` : ""}
    ${reporterDate ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #f0ece8"><div style="font-size:13px;color:#666">Reporter au</div><div style="font-size:14px;font-weight:700;color:#1a1a1a">${reporterDate}</div></div>` : ""}`;

  const content = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;background:#f5f5f5;padding:24px;box-sizing:border-box">

  <div style="background:#D32F2F;color:#fff;border-radius:12px;padding:22px 26px;margin-bottom:20px;overflow:hidden">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="vertical-align:middle;padding:0">
          <div style="font-size:26px;font-weight:800;letter-spacing:1px;margin:0;padding:0">SMAC</div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:.85;margin-top:4px">PV de Réception Support Terrasse</div>
        </td>
        <td style="text-align:right;vertical-align:middle;padding:0">
          <div style="font-size:16px;font-weight:800">${savedPV?.ref || "—"}</div>
          <div style="font-size:11px;opacity:.75;margin-top:4px">${savedPV?.date || "—"}</div>
        </td>
      </tr>
    </table>
  </div>

  ${section(
    "Informations Générales",
    `<table style="width:100%;border-collapse:collapse">
      ${fieldRow("Chantier", form.chantier)}
      ${fieldRow("Agence", form.agence)}
      ${fieldRow("Établissement", form.etablissement)}
      ${fieldRow("Zone / Bâtiment", form.zone)}
      ${fieldRow("Date d'inspection", form.date)}
      ${fieldRow("Responsable chantier", form.responsable)}
    </table>`,
  )}

  ${reserves.length > 0 ? section(`Réserves (${reserves.length})`, reserveHtml) : ""}

  ${section(
    "État de Surface",
    `<table style="width:100%;border-collapse:collapse">${SURFACE_FIELDS.map(([key, label]) => {
      const val = etatSurface[key] as string;
      const photos = val === "Non Conforme" ? (etatSurface[key + "Photos"] as Photo[]) || [] : [];
      const comment = val === "Non Conforme" ? (etatSurface[key + "Comment"] as string) || "" : "";
      const photosHtml =
        photos.length > 0
          ? `<tr><td colspan="2" style="padding:8px 8px 14px;background:#fff8f8">
            <div style="font-size:11px;font-weight:800;color:#D32F2F;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Photos (${photos.length})</div>
            <div style="display:flex;flex-direction:column;gap:14px">${photos.map((p) => `<img src="${p.url}" style="width:100%;height:auto;min-height:180px;object-fit:cover;border-radius:10px;border:2px solid #D32F2F;display:block"/>`).join("")}</div>
          </td></tr>`
          : "";
      const commentHtml = comment
        ? `<tr><td colspan="2" style="padding:0 8px 14px;background:#fff8f8;font-size:13px;color:#555;font-style:italic;border-bottom:1px solid #f0ece8;line-height:1.6">${comment}</td></tr>`
        : "";
      return toggleRow(label, val) + photosHtml + commentHtml;
    }).join("")}</table>`,
  )}

  ${section(
    "Relevés d'Étanchéité",
    `<table style="width:100%;border-collapse:collapse">${RELEVES_FIELDS.map(([key, label]) => toggleRow(label, releves[key])).join("")}</table>`,
  )}

  ${section(
    "Points Singuliers",
    `<table style="width:100%;border-collapse:collapse">
      ${POINT_FIELDS.map(([key, label]) => toggleRow(label, points[key])).join("")}
      ${points.observations ? `<tr><td colspan="2" style="padding:14px 8px;font-size:13px;border-top:1px solid #f0ece8"><div style="font-weight:700;color:#444;margin-bottom:6px">Autres écarts &amp; observations</div><div style="color:#1a1a1a;font-size:14px;line-height:1.6">${points.observations}</div></td></tr>` : ""}
    </table>`,
  )}

  ${section("Participants &amp; Signatures", participantHtml + `<div style="border:1.5px solid #e8e4df;border-radius:10px;padding:4px 16px;margin-top:8px">${receptionBlock}</div>`)}

  <div style="text-align:center;font-size:11px;color:#bbb;padding:12px 0 4px">
    Document généré par SMAC &bull; ${savedPV?.date || "—"}
  </div>

</div>`;

  const filename = `${(savedPV?.ref || "PV_SMAC").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

  html2pdf()
    .set({
      margin: [0, 0, 0, 0],
      filename,
      image: { type: "jpeg", quality: 0.97 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#f5f5f5",
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "avoid-all" },
    })
    .from(content, "string")
    .save();
}

export async function sendPVEmail(pvData: PdfData, recipientEmail: string): Promise<unknown> {
  const { form, reserves, savedPV } = pvData;

  const reserveLines =
    reserves.length > 0
      ? reserves.map((r, i) => `  ${i + 1}. ${r.localisation || "—"}${r.detail ? " — " + r.detail : ""}`).join("\n")
      : "  Aucune réserve";

  const message = [
    `Procès-Verbal de Réception — ${savedPV?.ref || "—"}`,
    ``,
    `Chantier         : ${form.chantier || "—"}`,
    `Agence           : ${form.agence || "—"}`,
    `Établissement    : ${form.etablissement || "—"}`,
    `Zone / Bâtiment  : ${form.zone || "—"}`,
    `Date inspection  : ${form.date || "—"}`,
    `Responsable      : ${form.responsable || "—"}`,
    `Horodatage       : ${savedPV?.date || "—"}`,
    ``,
    `Réserves (${reserves.length}) :`,
    reserveLines,
    ``,
    `Ce document a été généré automatiquement par l'application SMAC.`,
  ].join("\n");

  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email: recipientEmail,
      subject: `PV de Réception SMAC — ${savedPV?.ref || "—"} — ${form.chantier || "—"}`,
      message,
      pv_ref: savedPV?.ref || "—",
      chantier: form.chantier || "—",
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}
