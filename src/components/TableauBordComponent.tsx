'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import demandeService from '@/lib/demandeService';
import { DemandePermanente, StatutDemande } from '@/lib/types';

export default function TableauBordComponent() {
  const [demandes, setDemandes] = useState<DemandePermanente[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<StatutDemande | 'TOUS'>('TOUS');
  const [triPar, setTriPar] = useState<'dateCreation' | 'nom'>('dateCreation');
  const [triOrdre, setTriOrdre] = useState<'asc' | 'desc'>('desc');
  const [recherche, setRecherche] = useState('');

  // Charger les demandes au chargement du composant
  useEffect(() => {
    const toutesLesDemandes = demandeService.getAll();
    setDemandes(toutesLesDemandes);
  }, []);

  // Filtrer les demandes en fonction des critères
  const demandesFiltrees = demandes
    .filter(demande => {
      // Filtre par statut
      if (filtreStatut !== 'TOUS' && demande.statut !== filtreStatut) {
        return false;
      }
      
      // Filtre par recherche (nom du visiteur ou du détenu)
      if (recherche) {
        const termeRecherche = recherche.toLowerCase();
        const nomVisiteur = `${demande.visiteur.nom} ${demande.visiteur.prenom}`.toLowerCase();
        const nomDetenu = `${demande.detenu.nom} ${demande.detenu.prenom}`.toLowerCase();
        
        return nomVisiteur.includes(termeRecherche) || nomDetenu.includes(termeRecherche);
      }
      
      return true;
    })
    .sort((a, b) => {
      // Tri par date de création
      if (triPar === 'dateCreation') {
        const dateA = new Date(a.dateCreation).getTime();
        const dateB = new Date(b.dateCreation).getTime();
        
        return triOrdre === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Tri par nom du visiteur
      if (triPar === 'nom') {
        const nomA = a.visiteur.nom.toLowerCase();
        const nomB = b.visiteur.nom.toLowerCase();
        
        return triOrdre === 'asc'
          ? nomA.localeCompare(nomB, 'fr')
          : nomB.localeCompare(nomA, 'fr');
      }
      
      return 0;
    });

  // Formater la date pour l'affichage
  const formaterDate = (dateIso: string) => {
    const date = new Date(dateIso);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir la classe CSS pour le badge de statut
  const getBadgeClass = (statut: StatutDemande) => {
    switch (statut) {
      case StatutDemande.ACCEPTE:
        return 'fr-badge fr-badge--success';
      case StatutDemande.REFUSE:
        return 'fr-badge fr-badge--error';
      case StatutDemande.EN_ATTENTE:
      default:
        return 'fr-badge fr-badge--info';
    }
  };

  // Inverser l'ordre de tri
  const toggleTriOrdre = () => {
    setTriOrdre(triOrdre === 'asc' ? 'desc' : 'asc');
  };

  // Changer le critère de tri
  const changerTri = (critere: 'dateCreation' | 'nom') => {
    if (triPar === critere) {
      toggleTriOrdre();
    } else {
      setTriPar(critere);
      setTriOrdre('asc');
    }
  };

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h1>Tableau de bord des demandes</h1>
        </div>
        <div className="fr-col-auto">
          <Link href="/formulaire" className="fr-btn">
            Nouvelle demande
          </Link>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-md-4">
          <div className="fr-select-group">
            <label className="fr-label" htmlFor="filtre-statut">
              Filtrer par statut
            </label>
            <select
              className="fr-select"
              id="filtre-statut"
              name="filtre-statut"
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as StatutDemande | 'TOUS')}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value={StatutDemande.EN_ATTENTE}>{StatutDemande.EN_ATTENTE}</option>
              <option value={StatutDemande.ACCEPTE}>{StatutDemande.ACCEPTE}</option>
              <option value={StatutDemande.REFUSE}>{StatutDemande.REFUSE}</option>
            </select>
          </div>
        </div>

        <div className="fr-col-12 fr-col-md-8">
          <div className="fr-search-bar">
            <label className="fr-label" htmlFor="recherche">
              Rechercher une demande
            </label>
            <input
              className="fr-input"
              type="search"
              id="recherche"
              name="recherche"
              placeholder="Nom du visiteur ou du détenu"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <button className="fr-btn" title="Rechercher">
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {demandesFiltrees.length === 0 ? (
        <div className="fr-alert fr-alert--info">
          <p>Aucune demande ne correspond aux critères de recherche.</p>
        </div>
      ) : (
        <div className="fr-table fr-table--bordered">
          <table>
            <caption>Liste des demandes de permis de visite</caption>
            <thead>
              <tr>
                <th scope="col">
                  <button
                    className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                    onClick={() => changerTri('dateCreation')}
                  >
                    Date de demande
                    {triPar === 'dateCreation' && (
                      <span className="fr-ml-1w">
                        {triOrdre === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col">
                  <button
                    className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                    onClick={() => changerTri('nom')}
                  >
                    Visiteur
                    {triPar === 'nom' && (
                      <span className="fr-ml-1w">
                        {triOrdre === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
                <th scope="col">Détenu</th>
                <th scope="col">Établissement</th>
                <th scope="col">Statut</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandesFiltrees.map((demande) => (
                <tr key={demande.id}>
                  <td>{formaterDate(demande.dateCreation)}</td>
                  <td>
                    {demande.visiteur.nom} {demande.visiteur.prenom}
                  </td>
                  <td>
                    {demande.detenu.nom} {demande.detenu.prenom}
                  </td>
                  <td>{demande.detenu.etablissement.nom}</td>
                  <td>
                    <span className={getBadgeClass(demande.statut)}>
                      {demande.statut}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/demande/${demande.id}`}
                      className="fr-btn fr-btn--secondary fr-btn--sm"
                    >
                      Voir la demande
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="fr-grid-row fr-mt-4w">
        <div className="fr-col">
          <div className="fr-alert fr-alert--info">
            <h3 className="fr-alert__title">Statistiques</h3>
            <p>
              Total des demandes : {demandes.length}
              <br />
              En attente : {demandes.filter(d => d.statut === StatutDemande.EN_ATTENTE).length}
              <br />
              Acceptées : {demandes.filter(d => d.statut === StatutDemande.ACCEPTE).length}
              <br />
              Refusées : {demandes.filter(d => d.statut === StatutDemande.REFUSE).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
