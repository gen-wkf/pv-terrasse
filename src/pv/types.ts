export interface Photo {
  id: number;
  url: string;
}

export interface Reserve {
  id: number;
  localisation: string;
  detail: string;
  photos: Photo[];
  localisationPhoto?: Photo | null;
}

export interface ReserveForm {
  localisation: string;
  detail: string;
  photos: Photo[];
  localisationPhoto: Photo | null;
}

export interface Form {
  agence: string;
  etablissement: string;
  chantier: string;
  zone: string;
  date: string;
  responsable: string;
}

export interface EtatSurface {
  [key: string]: string | Photo[];
  reg1: string; reg1Photos: Photo[]; reg1Comment: string;
  prop1: string; prop1Photos: Photo[]; prop1Comment: string;
  reg2: string; reg2Photos: Photo[]; reg2Comment: string;
  prop2: string; prop2Photos: Photo[]; prop2Comment: string;
}

export interface PartieCourante {
  [key: string]: string | Photo[];
  pente: string; pentePhotos: Photo[]; penteComment: string;
  planeite: string; planeitePhotos: Photo[]; planeiteComment: string;
}

export interface Releves {
  [key: string]: string | Photo[];
  trous: string; trousPhotos: Photo[]; trousComment: string;
  remplissage: string; remplissagePhotos: Photo[]; remplissageComment: string;
  hauteur: string; hauteurPhotos: Photo[]; hauteurComment: string;
  profondeur: string; profondeurPhotos: Photo[]; profondeurComment: string;
  protection: string; protectionPhotos: Photo[]; protectionComment: string;
  niveaux: string; niveauxPhotos: Photo[]; niveauxComment: string;
}

export interface Points {
  [key: string]: string | Photo[];
  tremies: string; tremiesPhotos: Photo[]; tremiesComment: string;
  eaux: string; eauxPhotos: Photo[]; eauxComment: string;
  deversoirs: string; deversoirsPhotos: Photo[]; deversoirsComment: string;
  trop: string; tropPhotos: Photo[]; tropComment: string;
  reservations: string; reservationsPhotos: Photo[]; reservationsComment: string;
  joints: string; jointsPhotos: Photo[]; jointsComment: string;
  observations: string;
}

export interface Participant {
  id: number;
  nom: string;
  titre: string;
  signed: boolean;
  sigDataUrl: string | null;
  reception: string;
  miseEnConformite: string;
  email: string;
  autoEmail: boolean;
  reporterAu?: string;
}

export interface SavedPVRef {
  ref: string;
  date: string;
  chantier?: string;
  dateStr?: string;
  isEdit?: boolean;
}

export interface PVVersion {
  id: number;
  savedDate: string;
  ref: string;
  chantier: string;
  agency: string;
  etablissement: string;
  zone: string;
  date: string;
  responsable: string;
  reserves: Reserve[];
  etatSurface: EtatSurface;
  partieCourante: PartieCourante;
  releves: Releves;
  points: Points;
  participants: Participant[];
}

export interface PV {
  id: number;
  num: string;
  name: string;
  agency: string;
  date: string;
  etablissement: string;
  zone?: string;
  responsable: string;
  reserves: Reserve[];
  etatSurface: EtatSurface;
  partieCourante: PartieCourante;
  releves: Releves;
  points: Points;
  participants: Participant[];
  savedRef?: string;
  savedDate?: string;
  versions?: PVVersion[];
}

export interface User {
  name: string;
  role: string;
  email: string;
  agence: string;
}

export interface Toast {
  id: number;
  msg: string;
  type: string;
}

export interface PdfData {
  form: Form;
  reserves: Reserve[];
  etatSurface: EtatSurface;
  partieCourante: PartieCourante;
  releves: Releves;
  points: Points;
  participants: Participant[];
  savedPV: { ref: string; date: string };
}

export interface PhotoMenuState {
  photo: Photo;
  onReplace: () => void;
  onUpdate: (url: string) => void;
}

export interface AnnotPhotoState {
  url: string;
  onSave: (newUrl: string) => void;
}

export interface GalleryState {
  photos: Photo[];
  title: string;
  key?: string;
  stateSource?: "etatSurface" | "partieCourante" | "releves" | "points";
}

export interface SavePVResult {
  ref: string;
  dateStr: string;
  chantier: string;
  isEdit: boolean;
  pv: PV;
}

export interface Step2Errors {
  [key: string]: { photo: boolean; comment: boolean } | undefined;
}

export interface Step5Errors {
  nom: boolean;
  sig: boolean;
}
