'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { etablissementsPenitentiaires } from '@/lib/data';
import { LienDetenu, Visiteur, Detenu, FichierJoint, Etablissement } from '@/lib/types';
import demandeService from '@/lib/demandeService';

export default function FormulaireDemandeComponent() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [etablissementsFiltres, setEtablissementsFiltres] = useState(etablissementsPenitentiaires);
  
  // État du formulaire
  const [visiteur, setVisiteur] = useState<Visiteur>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    adresse: '',
    codePostal: '',
    ville: '',
    email: '',
    telephone: ''
  });
  
  const [detenu, setDetenu] = useState<Detenu>({
    nom: '',
    prenom: '',
    numeroEcrou: '',
    etablissement: etablissementsPenitentiaires[0]
  });
  
  const [lienAvecDetenu, setLienAvecDetenu] = useState<LienDetenu>(LienDetenu.FAMILLE);
  const [precisionLien, setPrecisionLien] = useState('');
  const [fichiersJoints, setFichiersJoints] = useState<FichierJoint[]>([]);
  const [commentaires, setCommentaires] = useState('');
  
  // Gestion des erreurs
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  
  // Filtrer les établissements en fonction de la recherche
  const filtrerEtablissements = (terme: string) => {
    setRecherche(terme);
    if (!terme.trim()) {
      setEtablissementsFiltres(etablissementsPenitentiaires);
      return;
    }
    
    const termeRecherche = terme.toLowerCase();
    const resultats = etablissementsPenitentiaires.filter(
      etablissement => 
        etablissement.nom.toLowerCase().includes(termeRecherche) ||
        etablissement.ville.toLowerCase().includes(termeRecherche)
    );
    
    setEtablissementsFiltres(resultats);
  };
  
  // Sélectionner un établissement
  const selectionnerEtablissement = (etablissement: Etablissement) => {
    setDetenu({...detenu, etablissement});
    setRecherche('');
  };
  
  // Gérer le changement des champs du visiteur
  const handleVisiteurChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVisiteur(prev => ({...prev, [name]: value}));
    
    // Effacer l'erreur si le champ est rempli
    if (value.trim() && erreurs[name]) {
      setErreurs(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer le changement des champs du détenu
  const handleDetenuChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetenu(prev => ({...prev, [name]: value}));
    
    // Effacer l'erreur si le champ est rempli
    if (value.trim() && erreurs[name]) {
      setErreurs(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer le changement du lien avec le détenu
  const handleLienChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLienAvecDetenu(e.target.value as LienDetenu);
    
    // Réinitialiser la précision si le lien n'est pas "Autre"
    if (e.target.value !== LienDetenu.AUTRE) {
      setPrecisionLien('');
    }
  };
  
  // Gérer l'upload de fichiers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Convertir les fichiers en base64 pour le stockage
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const nouveauFichier: FichierJoint = {
            id: Date.now().toString(),
            nom: file.name,
            type: file.type,
            dateUpload: new Date().toISOString(),
            url: event.target.result as string
          };
          
          setFichiersJoints(prev => [...prev, nouveauFichier]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Supprimer un fichier joint
  const supprimerFichier = (id: string) => {
    setFichiersJoints(prev => prev.filter(fichier => fichier.id !== id));
  };
  
  // Valider l'étape 1 (informations du visiteur)
  const validerEtape1 = () => {
    const nouvellesErreurs: Record<string, string> = {};
    
    // Vérifier les champs obligatoires
    if (!visiteur.nom.trim()) nouvellesErreurs.nom = 'Le nom est obligatoire';
    if (!visiteur.prenom.trim()) nouvellesErreurs.prenom = 'Le prénom est obligatoire';
    if (!visiteur.dateNaissance) nouvellesErreurs.dateNaissance = 'La date de naissance est obligatoire';
    if (!visiteur.adresse.trim()) nouvellesErreurs.adresse = 'L\'adresse est obligatoire';
    if (!visiteur.codePostal.trim()) nouvellesErreurs.codePostal = 'Le code postal est obligatoire';
    if (!visiteur.ville.trim()) nouvellesErreurs.ville = 'La ville est obligatoire';
    if (!visiteur.email.trim()) nouvellesErreurs.email = 'L\'email est obligatoire';
    
    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (visiteur.email && !emailRegex.test(visiteur.email)) {
      nouvellesErreurs.email = 'Format d\'email invalide';
    }
    
    // Vérifier le format du code postal français
    const codePostalRegex = /^[0-9]{5}$/;
    if (visiteur.codePostal && !codePostalRegex.test(visiteur.codePostal)) {
      nouvellesErreurs.codePostal = 'Le code postal doit contenir 5 chiffres';
    }
    
    setErreurs(nouvellesErreurs);
    
    // Passer à l'étape suivante si aucune erreur
    if (Object.keys(nouvellesErreurs).length === 0) {
      setEtape(2);
    }
  };
  
  // Valider l'étape 2 (informations du détenu)
  const validerEtape2 = () => {
    const nouvellesErreurs: Record<string, string> = {};
    
    // Vérifier les champs obligatoires
    if (!detenu.nom.trim()) nouvellesErreurs.detenuNom = 'Le nom du détenu est obligatoire';
    if (!detenu.prenom.trim()) nouvellesErreurs.detenuPrenom = 'Le prénom du détenu est obligatoire';
    if (!detenu.numeroEcrou.trim()) nouvellesErreurs.numeroEcrou = 'Le numéro d\'écrou est obligatoire';
    if (!detenu.etablissement) nouvellesErreurs.etablissement = 'L\'établissement est obligatoire';
    
    // Vérifier si une précision est fournie pour le lien "Autre"
    if (lienAvecDetenu === LienDetenu.AUTRE && !precisionLien.trim()) {
      nouvellesErreurs.precisionLien = 'Veuillez préciser votre lien avec le détenu';
    }
    
    setErreurs(nouvellesErreurs);
    
    // Passer à l'étape suivante si aucune erreur
    if (Object.keys(nouvellesErreurs).length === 0) {
      setEtape(3);
    }
  };
  
  // Soumettre le formulaire
  const soumettreFormulaire = () => {
    try {
      // Créer la demande
      const nouvelleDemande = demandeService.create({
        visiteur,
        detenu,
        lienAvecDetenu,
        precisionLien,
        fichiersJoints,
        commentaires
      });
      
      // Rediriger vers la page de confirmation
      router.push(`/demande/${nouvelleDemande.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      setErreurs({
        soumission: 'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.'
      });
    }
  };
  
  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
          <div className="fr-mt-4w">
            <h1>Demande de permis de visite</h1>
            
            {/* Indicateur d'étape */}
            <div className="fr-stepper">
              <h2 className="fr-stepper__title">
                Étape {etape} sur 3
                <span className="fr-stepper__state">
                  {etape === 1 && 'Informations du visiteur'}
                  {etape === 2 && 'Informations du détenu'}
                  {etape === 3 && 'Pièces justificatives'}
                </span>
              </h2>
              <div className="fr-stepper__steps" data-fr-current-step={etape} data-fr-steps="3"></div>
            </div>
            
            {/* Erreur générale */}
            {erreurs.soumission && (
              <div className="fr-alert fr-alert--error fr-mt-2w">
                <p>{erreurs.soumission}</p>
              </div>
            )}
            
            {/* Étape 1: Informations du visiteur */}
            {etape === 1 && (
              <div className="fr-form-group">
                <fieldset className="fr-fieldset">
                  <legend className="fr-fieldset__legend">Informations du visiteur</legend>
                  
                  <div className="fr-fieldset__content">
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12 fr-col-md-6">
                        <div className={`fr-input-group ${erreurs.nom ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="nom">
                            Nom
                            <span className="fr-hint-text">Nom de famille</span>
                          </label>
                          {erreurs.nom && <p className="fr-error-text">{erreurs.nom}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="nom"
                            name="nom"
                            value={visiteur.nom}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                      
                      <div className="fr-col-12 fr-col-md-6">
                        <div className={`fr-input-group ${erreurs.prenom ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="prenom">
                            Prénom
                          </label>
                          {erreurs.prenom && <p className="fr-error-text">{erreurs.prenom}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="prenom"
                            name="prenom"
                            value={visiteur.prenom}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12">
                        <div className={`fr-input-group ${erreurs.dateNaissance ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="dateNaissance">
                            Date de naissance
                          </label>
                          {erreurs.dateNaissance && <p className="fr-error-text">{erreurs.dateNaissance}</p>}
                          <input
                            className="fr-input"
                            type="date"
                            id="dateNaissance"
                            name="dateNaissance"
                            value={visiteur.dateNaissance}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12">
                        <div className={`fr-input-group ${erreurs.adresse ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="adresse">
                            Adresse
                          </label>
                          {erreurs.adresse && <p className="fr-error-text">{erreurs.adresse}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="adresse"
                            name="adresse"
                            value={visiteur.adresse}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12 fr-col-md-4">
                        <div className={`fr-input-group ${erreurs.codePostal ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="codePostal">
                            Code postal
                          </label>
                          {erreurs.codePostal && <p className="fr-error-text">{erreurs.codePostal}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="codePostal"
                            name="codePostal"
                            value={visiteur.codePostal}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                      
                      <div className="fr-col-12 fr-col-md-8">
                        <div className={`fr-input-group ${erreurs.ville ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="ville">
                            Ville
                          </label>
                          {erreurs.ville && <p className="fr-error-text">{erreurs.ville}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="ville"
                            name="ville"
                            value={visiteur.ville}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12 fr-col-md-6">
                        <div className={`fr-input-group ${erreurs.email ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="email">
                            Email
                          </label>
                          {erreurs.email && <p className="fr-error-text">{erreurs.email}</p>}
                          <input
                            className="fr-input"
                            type="email"
                            id="email"
                            name="email"
                            value={visiteur.email}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                      
                      <div className="fr-col-12 fr-col-md-6">
                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="telephone">
                            Téléphone
                            <span className="fr-hint-text">Facultatif</span>
                          </label>
                          <input
                            className="fr-input"
                            type="tel"
                            id="telephone"
                            name="telephone"
                            value={visiteur.telephone}
                            onChange={handleVisiteurChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
                
                <div className="fr-grid-row fr-grid-row--right fr-mt-2w">
                  <button className="fr-btn" onClick={validerEtape1}>
                    Continuer
                  </button>
                </div>
              </div>
            )}
            
            {/* Étape 2: Informations du détenu */}
            {etape === 2 && (
              <div className="fr-form-group">
                <fieldset className="fr-fieldset">
                  <legend className="fr-fieldset__legend">Informations du détenu</legend>
                  
                  <div className="fr-fieldset__content">
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12 fr-col-md-6">
                        <div className={`fr-input-group ${erreurs.detenuNom ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="detenuNom">
                            Nom du détenu
                          </label>
                          {erreurs.detenuNom && <p className="fr-error-text">{erreurs.detenuNom}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="detenuNom"
                            name="nom"
                            value={detenu.nom}
                            onChange={handleDetenuChange}
                          />
                        </div>
                      </div>
                      
                      <div className="fr-col-12 fr-col-md-6">
                        <div className={`fr-input-group ${erreurs.detenuPrenom ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="detenuPrenom">
                            Prénom du détenu
                          </label>
                          {erreurs.detenuPrenom && <p className="fr-error-text">{erreurs.detenuPrenom}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="detenuPrenom"
                            name="prenom"
                            value={detenu.prenom}
                            onChange={handleDetenuChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12">
                        <div className={`fr-input-group ${erreurs.numeroEcrou ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="numeroEcrou">
                            Numéro d'écrou
                          </label>
                          {erreurs.numeroEcrou && <p className="fr-error-text">{erreurs.numeroEcrou}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="numeroEcrou"
                            name="numeroEcrou"
                            value={detenu.numeroEcrou}
                            onChange={handleDetenuChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12">
                        <div className={`fr-input-group ${erreurs.etablissement ? 'fr-input-group--error' : ''}`}>
                          <label className="fr-label" htmlFor="etablissement">
                            Établissement pénitentiaire
                          </label>
                          {erreurs.etablissement && <p className="fr-error-text">{erreurs.etablissement}</p>}
                          <input
                            className="fr-input"
                            type="text"
                            id="etablissement"
                            placeholder="Rechercher un établissement..."
                            value={recherche}
                            onChange={(e) => filtrerEtablissements(e.target.value)}
                          />
                          
                          {recherche && (
                            <div className="fr-dropdown__menu fr-dropdown__menu--open">
                              <ul className="fr-dropdown__list">
                                {etablissementsFiltres.length > 0 ? (
                                  etablissementsFiltres.map((etablissement) => (
                                    <li key={etablissement.id}>
                                      <button
                                        className="fr-dropdown__btn"
                                        type="button"
                                        onClick={() => selectionnerEtablissement(etablissement)}
                                      >
                                        {etablissement.nom} - {etablissement.ville}
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li>
                                    <span className="fr-dropdown__btn">Aucun établissement trouvé</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {detenu.etablissement && (
                            <div className="fr-mt-1w">
                              <span className="fr-badge fr-badge--info">
                                {detenu.etablissement.nom} - {detenu.etablissement.ville}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12">
                        <div className="fr-select-group">
                          <label className="fr-label" htmlFor="lienAvecDetenu">
                            Lien avec le détenu
                          </label>
                          <select
                            className="fr-select"
                            id="lienAvecDetenu"
                            name="lienAvecDetenu"
                            value={lienAvecDetenu}
                            onChange={handleLienChange}
                          >
                            <option value={LienDetenu.FAMILLE}>Famille</option>
                            <option value={LienDetenu.CONJOINT}>Conjoint</option>
                            <option value={LienDetenu.AMI}>Ami</option>
                            <option value={LienDetenu.AVOCAT}>Avocat</option>
                            <option value={LienDetenu.AUTRE}>Autre</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {lienAvecDetenu === LienDetenu.AUTRE && (
                      <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12">
                          <div className={`fr-input-group ${erreurs.precisionLien ? 'fr-input-group--error' : ''}`}>
                            <label className="fr-label" htmlFor="precisionLien">
                              Précisez votre lien avec le détenu
                            </label>
                            {erreurs.precisionLien && <p className="fr-error-text">{erreurs.precisionLien}</p>}
                            <input
                              className="fr-input"
                              type="text"
                              id="precisionLien"
                              name="precisionLien"
                              value={precisionLien}
                              onChange={(e) => setPrecisionLien(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </fieldset>
                
                <div className="fr-grid-row fr-grid-row--right fr-mt-2w">
                  <button className="fr-btn fr-btn--secondary fr-mr-2w" onClick={() => setEtape(1)}>
                    Retour
                  </button>
                  <button className="fr-btn" onClick={validerEtape2}>
                    Continuer
                  </button>
                </div>
              </div>
            )}
            
            {/* Étape 3: Pièces justificatives */}
            {etape === 3 && (
              <div className="fr-form-group">
                <fieldset className="fr-fieldset">
                  <legend className="fr-fieldset__legend">Pièces justificatives</legend>
                  
                  <div className="fr-fieldset__content">
                    <div className="fr-alert fr-alert--info fr-mb-2w">
                      <p>
                        Veuillez joindre les documents suivants (formats acceptés : PDF, JPG, PNG) :
                      </p>
                      <ul>
                        <li>Carte d'identité (obligatoire)</li>
                        <li>Justificatif de domicile (obligatoire)</li>
                        <li>Photo d'identité récente</li>
                        <li>Livret de famille (si lien familial)</li>
                      </ul>
                    </div>
                    
                    <div className="fr-upload-group">
                      <label className="fr-label" htmlFor="fichiers">
                        Ajouter des fichiers
                        <span className="fr-hint-text">Taille maximale : 5 Mo par fichier</span>
                      </label>
                      <input
                        className="fr-upload"
                        type="file"
                        id="fichiers"
                        name="fichiers"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </div>
                    
                    {fichiersJoints.length > 0 && (
                      <div className="fr-mt-2w">
                        <p className="fr-text--bold">Fichiers joints :</p>
                        <ul className="fr-list">
                          {fichiersJoints.map((fichier) => (
                            <li key={fichier.id} className="fr-mb-1w">
                              <span>{fichier.nom}</span>
                              <button
                                className="fr-btn fr-btn--sm fr-btn--tertiary fr-ml-1w"
                                onClick={() => supprimerFichier(fichier.id)}
                                type="button"
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="fr-input-group fr-mt-2w">
                      <label className="fr-label" htmlFor="commentaires">
                        Commentaires
                        <span className="fr-hint-text">Facultatif</span>
                      </label>
                      <textarea
                        className="fr-input"
                        id="commentaires"
                        name="commentaires"
                        rows={4}
                        value={commentaires}
                        onChange={(e) => setCommentaires(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </fieldset>
                
                <div className="fr-grid-row fr-grid-row--right fr-mt-2w">
                  <button className="fr-btn fr-btn--secondary fr-mr-2w" onClick={() => setEtape(2)}>
                    Retour
                  </button>
                  <button className="fr-btn" onClick={soumettreFormulaire}>
                    Soumettre la demande
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
