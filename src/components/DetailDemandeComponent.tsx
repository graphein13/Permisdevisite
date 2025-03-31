'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import demandeService from '@/lib/demandeService';
import { DemandePermanente, StatutDemande } from '@/lib/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface DetailDemandeComponentProps {
  id: string;
}

export default function DetailDemandeComponent({ id }: DetailDemandeComponentProps) {
  const router = useRouter();
  const [demande, setDemande] = useState<DemandePermanente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateValidite, setDateValidite] = useState<string>('');
  const [motifRefus, setMotifRefus] = useState<string>('');
  const [showAccepterModal, setShowAccepterModal] = useState(false);
  const [showRefuserModal, setShowRefuserModal] = useState(false);

  // Charger les détails de la demande
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demandeFound = demandeService.getById(id);
      
      if (demandeFound) {
        setDemande(demandeFound);
        
        // Initialiser la date de validité à 1 an par défaut
        const dateActuelle = new Date();
        dateActuelle.setFullYear(dateActuelle.getFullYear() + 1);
        setDateValidite(dateActuelle.toISOString().split('T')[0]);
      } else {
        setError('Demande non trouvée');
      }
      
      setLoading(false);
    }
  }, [id]);

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

  // Accepter la demande
  const accepterDemande = () => {
    if (!demande) return;
    
    try {
      const demandeUpdated = demandeService.accepterDemande(demande.id, dateValidite);
      
      if (demandeUpdated) {
        setDemande(demandeUpdated);
        setShowAccepterModal(false);
        genererPDF(demandeUpdated);
      } else {
        setError('Erreur lors de l\'acceptation de la demande');
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      setError('Une erreur est survenue lors de l\'acceptation de la demande');
    }
  };

  // Refuser la demande
  const refuserDemande = () => {
    if (!demande) return;
    
    try {
      const demandeUpdated = demandeService.refuserDemande(demande.id, motifRefus);
      
      if (demandeUpdated) {
        setDemande(demandeUpdated);
        setShowRefuserModal(false);
      } else {
        setError('Erreur lors du refus de la demande');
      }
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      setError('Une erreur est survenue lors du refus de la demande');
    }
  };

  // Générer un PDF pour le permis de visite
  const genererPDF = (demande: DemandePermanente) => {
    // @ts-ignore
    const doc = new jsPDF();
    
    // Ajouter le logo République Française
    doc.setFontSize(12);
    doc.text('RÉPUBLIQUE FRANÇAISE', 105, 15, { align: 'center' });
    doc.text('Liberté - Égalité - Fraternité', 105, 20, { align: 'center' });
    
    // Titre
    doc.setFontSize(18);
    doc.text('PERMIS DE VISITE', 105, 40, { align: 'center' });
    
    // Informations sur le permis
    doc.setFontSize(12);
    doc.text(`Permis N° ${demande.id}`, 20, 60);
    doc.text(`Date de délivrance : ${formaterDate(demande.dateModification)}`, 20, 70);
    doc.text(`Valable jusqu'au : ${formaterDate(demande.dateValidite || '')}`, 20, 80);
    
    // Informations sur le visiteur
    doc.setFontSize(14);
    doc.text('Visiteur', 20, 100);
    doc.setFontSize(12);
    doc.text(`Nom : ${demande.visiteur.nom}`, 30, 110);
    doc.text(`Prénom : ${demande.visiteur.prenom}`, 30, 120);
    doc.text(`Date de naissance : ${formaterDate(demande.visiteur.dateNaissance)}`, 30, 130);
    doc.text(`Adresse : ${demande.visiteur.adresse}`, 30, 140);
    doc.text(`${demande.visiteur.codePostal} ${demande.visiteur.ville}`, 30, 150);
    
    // Informations sur le détenu
    doc.setFontSize(14);
    doc.text('Détenu', 20, 170);
    doc.setFontSize(12);
    doc.text(`Nom : ${demande.detenu.nom}`, 30, 180);
    doc.text(`Prénom : ${demande.detenu.prenom}`, 30, 190);
    doc.text(`Numéro d'écrou : ${demande.detenu.numeroEcrou}`, 30, 200);
    doc.text(`Établissement : ${demande.detenu.etablissement.nom}`, 30, 210);
    
    // Lien avec le détenu
    doc.text(`Lien avec le détenu : ${demande.lienAvecDetenu}${demande.precisionLien ? ` (${demande.precisionLien})` : ''}`, 20, 230);
    
    // Mention légale
    doc.setFontSize(10);
    doc.text('Ce permis doit être présenté à chaque visite avec une pièce d\'identité en cours de validité.', 20, 250);
    doc.text('L\'administration pénitentiaire se réserve le droit de suspendre ou de retirer ce permis à tout moment.', 20, 260);
    
    // Enregistrer le PDF
    doc.save(`permis_visite_${demande.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8">
            <div className="fr-mt-4w">
              <p>Chargement en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8">
            <div className="fr-mt-4w">
              <div className="fr-alert fr-alert--error">
                <p>{error || 'Demande non trouvée'}</p>
              </div>
              <div className="fr-mt-2w">
                <Link href="/tableau-bord" className="fr-btn fr-btn--secondary">
                  Retour au tableau de bord
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-10">
          <div className="fr-mt-4w">
            <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
              <div className="fr-col">
                <h1>Détail de la demande</h1>
              </div>
              <div className="fr-col-auto">
                <Link href="/tableau-bord" className="fr-btn fr-btn--secondary">
                  Retour au tableau de bord
                </Link>
              </div>
            </div>

            <div className="fr-card fr-mb-4w">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-6">
                      <h3>Informations générales</h3>
                      <ul className="fr-list">
                        <li>
                          <strong>Date de création :</strong> {formaterDate(demande.dateCreation)}
                        </li>
                        <li>
                          <strong>Dernière modification :</strong> {formaterDate(demande.dateModification)}
                        </li>
                        <li>
                          <strong>Statut :</strong>{' '}
                          <span className={getBadgeClass(demande.statut)}>
                            {demande.statut}
                          </span>
                        </li>
                        {demande.statut === StatutDemande.ACCEPTE && demande.dateValidite && (
                          <li>
                            <strong>Valable jusqu'au :</strong> {formaterDate(demande.dateValidite)}
                          </li>
                        )}
                        {demande.statut === StatutDemande.REFUSE && demande.motifRefus && (
                          <li>
                            <strong>Motif du refus :</strong> {demande.motifRefus}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="fr-col-12 fr-col-md-6">
                      <h3>Lien avec le détenu</h3>
                      <p>
                        {demande.lienAvecDetenu}
                        {demande.precisionLien && ` (${demande.precisionLien})`}
                      </p>

                      {demande.commentaires && (
                        <>
                          <h3>Commentaires</h3>
                          <p>{demande.commentaires}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-card">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h3>Informations du visiteur</h3>
                      <ul className="fr-list">
                        <li>
                          <strong>Nom :</strong> {demande.visiteur.nom}
                        </li>
                        <li>
                          <strong>Prénom :</strong> {demande.visiteur.prenom}
                        </li>
                        <li>
                          <strong>Date de naissance :</strong> {formaterDate(demande.visiteur.dateNaissance)}
                        </li>
                        <li>
                          <strong>Adresse :</strong> {demande.visiteur.adresse}
                        </li>
                        <li>
                          <strong>Code postal :</strong> {demande.visiteur.codePostal}
                        </li>
                        <li>
                          <strong>Ville :</strong> {demande.visiteur.ville}
                        </li>
                        <li>
                          <strong>Email :</strong> {demande.visiteur.email}
                        </li>
                        {demande.visiteur.telephone && (
                          <li>
                            <strong>Téléphone :</strong> {demande.visiteur.telephone}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-card">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h3>Informations du détenu</h3>
                      <ul className="fr-list">
                        <li>
                          <strong>Nom :</strong> {demande.detenu.nom}
                        </li>
                        <li>
                          <strong>Prénom :</strong> {demande.detenu.prenom}
                        </li>
                        <li>
                          <strong>Numéro d'écrou :</strong> {demande.detenu.numeroEcrou}
                        </li>
                        <li>
                          <strong>Établissement :</strong> {demande.detenu.etablissement.nom}
                        </li>
                        <li>
                          <strong>Type d'établissement :</strong> {demande.detenu.etablissement.type}
                        </li>
                        <li>
                          <strong>Adresse :</strong> {demande.detenu.etablissement.adresse}
                        </li>
                        <li>
                          <strong>Code postal :</strong> {demande.detenu.etablissement.codePostal}
                        </li>
                        <li>
                          <strong>Ville :</strong> {demande.detenu.etablissement.ville}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {demande.fichiersJoints.length > 0 && (
              <div className="fr-card fr-mt-4w">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h3>Pièces jointes</h3>
                    <ul className="fr-list">
                      {demande.fichiersJoints.map((fichier) => (
                        <li key={fichier.id}>
                          <a
                            href={fichier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fr-link"
                          >
                            {fichier.nom}
                          </a>
                          <span className="fr-ml-1w">
                            ({new Date(fichier.dateUpload).toLocaleDateString('fr-FR')})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {demande.statut === StatutDemande.EN_ATTENTE && (
              <div className="fr-grid-row fr-grid-row--right fr-mt-4w">
                <button
                  className="fr-btn fr-btn--secondary fr-mr-2w"
                  onClick={() => setShowRefuserModal(true)}
                >
                  Refuser la demande
                </button>
                <button
                  className="fr-btn"
                  onClick={() => setShowAccepterModal(true)}
                >
                  Accepter la demande
                </button>
              </div>
            )}

            {demande.statut === StatutDemande.ACCEPTE && (
              <div className="fr-grid-row fr-grid-row--right fr-mt-4w">
                <button
                  className="fr-btn"
                  onClick={() => genererPDF(demande)}
                >
                  Télécharger le permis (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour accepter la demande */}
      {showAccepterModal && (
        <div className="fr-modal fr-modal--opened" id="modal-accepter" aria-labelledby="modal-accepter-title">
          <div className="fr-modal__backdrop"></div>
          <div className="fr-modal__body">
            <div className="fr-modal__header">
              <button
                className="fr-btn--close fr-btn"
                title="Fermer la fenêtre modale"
                onClick={() => setShowAccepterModal(false)}
              >
                Fermer
              </button>
            </div>
            <div className="fr-modal__content">
              <h1 id="modal-accepter-title" className="fr-modal__title">
                Accepter la demande
              </h1>
              <div className="fr-input-group">
                <label className="fr-label" htmlFor="date-validite">
                  Date de validité du permis
                </label>
                <input
                  className="fr-input"
                  type="date"
                  id="date-validite"
                  name="date-validite"
                  value={dateValidite}
                  onChange={(e) => setDateValidite(e.target.value)}
                />
              </div>
              <div className="fr-alert fr-alert--info fr-mt-2w">
                <p>
                  En acceptant cette demande, un permis de visite sera généré et pourra être téléchargé au format PDF.
                </p>
              </div>
            </div>
            <div className="fr-modal__footer">
              <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg">
                <li>
                  <button className="fr-btn" onClick={accepterDemande}>
                    Accepter la demande
                  </button>
                </li>
                <li>
                  <button className="fr-btn fr-btn--secondary" onClick={() => setShowAccepterModal(false)}>
                    Annuler
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour refuser la demande */}
      {showRefuserModal && (
        <div className="fr-modal fr-modal--opened" id="modal-refuser" aria-labelledby="modal-refuser-title">
          <div className="fr-modal__backdrop"></div>
          <div className="fr-modal__body">
            <div className="fr-modal__header">
              <button
                className="fr-btn--close fr-btn"
                title="Fermer la fenêtre modale"
                onClick={() => setShowRefuserModal(false)}
              >
                Fermer
              </button>
            </div>
            <div className="fr-modal__content">
              <h1 id="modal-refuser-title" className="fr-modal__title">
                Refuser la demande
              </h1>
              <div className="fr-input-group">
                <label className="fr-label" htmlFor="motif-refus">
                  Motif du refus
                </label>
                <textarea
                  className="fr-input"
                  id="motif-refus"
                  name="motif-refus"
                  rows={4}
                  value={motifRefus}
                  onChange={(e) => setMotifRefus(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="fr-modal__footer">
              <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg">
                <li>
                  <button className="fr-btn" onClick={refuserDemande}>
                    Refuser la demande
                  </button>
                </li>
                <li>
                  <button className="fr-btn fr-btn--secondary" onClick={() => setShowRefuserModal(false)}>
                    Annuler
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
