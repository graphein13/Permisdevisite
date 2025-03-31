import { DemandePermanente, StatutDemande } from './types';

// Clé pour le stockage des demandes dans localStorage
const STORAGE_KEY = 'permis-visite-demandes';

/**
 * Service pour gérer les demandes de permis de visite avec localStorage
 */
export const demandeService = {
  /**
   * Récupère toutes les demandes de permis
   * @returns Tableau de toutes les demandes
   */
  getAll: (): DemandePermanente[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const demandes = localStorage.getItem(STORAGE_KEY);
    return demandes ? JSON.parse(demandes) : [];
  },

  /**
   * Récupère une demande par son ID
   * @param id ID de la demande à récupérer
   * @returns La demande trouvée ou undefined
   */
  getById: (id: string): DemandePermanente | undefined => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    const demandes = demandeService.getAll();
    return demandes.find(demande => demande.id === id);
  },

  /**
   * Crée une nouvelle demande
   * @param demande Demande à créer (sans ID)
   * @returns La demande créée avec un ID généré
   */
  create: (demande: Omit<DemandePermanente, 'id' | 'dateCreation' | 'dateModification' | 'statut'>): DemandePermanente => {
    if (typeof window === 'undefined') {
      throw new Error('Cette fonction ne peut être utilisée que côté client');
    }
    
    const demandes = demandeService.getAll();
    
    // Génération d'un ID unique
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    // Création de la nouvelle demande
    const nouvelleDemande: DemandePermanente = {
      ...demande as any,
      id,
      dateCreation: now,
      dateModification: now,
      statut: StatutDemande.EN_ATTENTE,
      fichiersJoints: demande.fichiersJoints || []
    };
    
    // Ajout de la demande à la liste
    demandes.push(nouvelleDemande);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes));
    
    return nouvelleDemande;
  },

  /**
   * Met à jour une demande existante
   * @param id ID de la demande à mettre à jour
   * @param demande Données de mise à jour
   * @returns La demande mise à jour ou undefined si non trouvée
   */
  update: (id: string, demande: Partial<DemandePermanente>): DemandePermanente | undefined => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    const demandes = demandeService.getAll();
    const index = demandes.findIndex(d => d.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    // Mise à jour de la demande
    const demandeUpdated: DemandePermanente = {
      ...demandes[index],
      ...demande,
      id, // Garantit que l'ID ne change pas
      dateModification: new Date().toISOString()
    };
    
    demandes[index] = demandeUpdated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes));
    
    return demandeUpdated;
  },

  /**
   * Supprime une demande
   * @param id ID de la demande à supprimer
   * @returns true si supprimée, false sinon
   */
  delete: (id: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const demandes = demandeService.getAll();
    const filteredDemandes = demandes.filter(demande => demande.id !== id);
    
    if (filteredDemandes.length === demandes.length) {
      return false; // Aucune demande n'a été supprimée
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDemandes));
    return true;
  },

  /**
   * Filtre les demandes par statut
   * @param statut Statut à filtrer
   * @returns Demandes filtrées
   */
  filterByStatut: (statut: StatutDemande): DemandePermanente[] => {
    const demandes = demandeService.getAll();
    return demandes.filter(demande => demande.statut === statut);
  },

  /**
   * Accepte une demande de permis
   * @param id ID de la demande à accepter
   * @param dateValidite Date de validité du permis
   * @returns La demande mise à jour ou undefined si non trouvée
   */
  accepterDemande: (id: string, dateValidite: string): DemandePermanente | undefined => {
    return demandeService.update(id, {
      statut: StatutDemande.ACCEPTE,
      dateValidite
    });
  },

  /**
   * Refuse une demande de permis
   * @param id ID de la demande à refuser
   * @param motifRefus Motif du refus
   * @returns La demande mise à jour ou undefined si non trouvée
   */
  refuserDemande: (id: string, motifRefus: string): DemandePermanente | undefined => {
    return demandeService.update(id, {
      statut: StatutDemande.REFUSE,
      motifRefus
    });
  }
};

export default demandeService;
