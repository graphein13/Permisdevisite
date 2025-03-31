import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fr-footer" role="contentinfo" id="footer">
      <div className="fr-container">
        <div className="fr-footer__body">
          <div className="fr-footer__brand fr-enlarge-link">
            <p className="fr-logo">
              République<br />Française
            </p>
            <p className="fr-footer__content">
              <span>Prototype de gestion des permis de visite</span>
            </p>
          </div>
          <div className="fr-footer__content">
            <p className="fr-footer__content-desc">
              Ce site est un prototype pour la gestion des demandes de permis de visite pour les établissements pénitentiaires.
            </p>
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <a className="fr-footer__content-link" href="https://www.systeme-de-design.gouv.fr/">
                  Système de Design de l'État
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fr-footer__bottom">
          <ul className="fr-footer__bottom-list">
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Mentions légales</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Politique de confidentialité</a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="#">Accessibilité : non conforme</a>
            </li>
          </ul>
          <div className="fr-footer__bottom-copy">
            <p>© République Française 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
