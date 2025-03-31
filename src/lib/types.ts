// Types pour l'application de gestion des permis de visite

// Statut d'une demande de permis de visite
export enum StatutDemande {
  EN_ATTENTE = "En attente",
  ACCEPTE = "Accepté",
  REFUSE = "Refusé"
}

// Type d'établissement pénitentiaire
export enum TypeEtablissement {
  MAISON_ARRET = "Maison d'arrêt",
  CENTRE_DETENTION = "Centre de détention",
  MAISON_CENTRALE = "Maison centrale",
  CENTRE_PENITENTIAIRE = "Centre pénitentiaire",
  ETABLISSEMENT_MINEURS = "Établissement pour mineurs"
}

// Lien avec le détenu
export enum LienDetenu {
  FAMILLE = "Famille",
  CONJOINT = "Conjoint",
  AMI = "Ami",
  AVOCAT = "Avocat",
  AUTRE = "Autre"
}

// Interface pour un établissement pénitentiaire
export interface Etablissement {
  id: string;
  nom: string;
  type: TypeEtablissement;
  adresse: string;
  codePostal: string;
  ville: string;
}

// Interface pour un visiteur
export interface Visiteur {
  nom: string;
  prenom: string;
  dateNaissance: string; // Format YYYY-MM-DD
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone?: string;
}

// Interface pour un détenu
export interface Detenu {
  nom: string;
  prenom: string;
  numeroEcrou: string;
  etablissement: Etablissement;
}

// Interface pour les fichiers joints
export interface FichierJoint {
  id: string;
  nom: string;
  type: string;
  dateUpload: string; // Format ISO
  url: string; // URL locale ou base64
}

// Interface pour une demande de permis de visite
export interface DemandePermanente {
  id: string;
  dateCreation: string; // Format ISO
  dateModification: string; // Format ISO
  statut: StatutDemande;
  visiteur: Visiteur;
  detenu: Detenu;
  lienAvecDetenu: LienDetenu;
  precisionLien?: string; // Si lien est "Autre"
  fichiersJoints: FichierJoint[];
  commentaires?: string;
  dateValidite?: string; // Format ISO, uniquement si statut est ACCEPTE
  motifRefus?: string; // Uniquement si statut est REFUSE
}
