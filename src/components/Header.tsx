import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header role="banner" className="fr-header">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <p className="fr-logo">
                    République<br />Française
                  </p>
                </div>
                <div className="fr-header__navbar">
                  <button className="fr-btn--menu fr-btn" data-fr-opened="false" aria-controls="modal-menu" aria-haspopup="menu" title="Menu">
                    Menu
                  </button>
                </div>
              </div>
              <div className="fr-header__service">
                <Link className="fr-header__service-title" href="/">
                  Gestion des permis de visite
                </Link>
                <p className="fr-header__service-tagline">Système de gestion des demandes de permis de visite</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fr-header__menu fr-modal" id="modal-menu" aria-labelledby="modal-menu-title">
        <div className="fr-container">
          <button className="fr-btn--close fr-btn" aria-controls="modal-menu" title="Fermer">
            Fermer
          </button>
          <div className="fr-header__menu-links">
          </div>
          <nav className="fr-nav" id="navigation-menu" role="navigation" aria-label="Menu principal">
            <ul className="fr-nav__list">
              <li className="fr-nav__item">
                <Link className="fr-nav__link" href="/" target="_self">
                  Accueil
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link className="fr-nav__link" href="/formulaire" target="_self">
                  Nouvelle demande
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
