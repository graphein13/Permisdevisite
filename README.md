# Documentation d'installation et d'utilisation

## Application de gestion des demandes de permis de visite

Cette application est un prototype permettant de gérer les demandes de permis de visite pour les établissements pénitentiaires. Elle utilise le Design Système de l'État Français (DSFR) pour une interface conforme aux standards visuels de l'administration française.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm ou pnpm (selon votre préférence)

## Installation

1. Clonez le dépôt ou téléchargez les fichiers source
   ```
   git clone <url-du-depot>
   ```

2. Accédez au répertoire du projet
   ```
   cd permis-visite-app
   ```

3. Installez les dépendances
   ```
   npm install
   ```
   ou avec pnpm
   ```
   pnpm install
   ```

4. Installez les dépendances pour la génération de PDF
   ```
   npm install jspdf jspdf-autotable
   ```
   ou avec pnpm
   ```
   pnpm add jspdf jspdf-autotable
   ```

## Démarrage de l'application

### Mode développement

Pour lancer l'application en mode développement avec rechargement à chaud :

```
npm run dev
```
ou
```
pnpm dev
```

Accédez ensuite à l'application dans votre navigateur à l'adresse : http://localhost:3000

### Mode production

Pour un déploiement en production :

1. Construisez l'application
   ```
   npm run build
   ```
   ou
   ```
   pnpm build
   ```

2. Démarrez le serveur de production
   ```
   npm start
   ```
   ou
   ```
   pnpm start
   ```

## Fonctionnalités

L'application comprend les fonctionnalités suivantes :

1. **Tableau de bord** - Vue d'ensemble des demandes avec filtres et tri
2. **Formulaire de demande** - Création de nouvelles demandes en plusieurs étapes
3. **Détail des demandes** - Visualisation et gestion des demandes individuelles
4. **Acceptation/Refus** - Traitement des demandes avec motifs
5. **Génération de PDF** - Création de permis de visite au format PDF
6. **Stockage local** - Persistance des données dans le navigateur via localStorage

## Structure du projet

- `src/app` - Pages et routes de l'application
- `src/components` - Composants réutilisables
- `src/lib` - Services, types et utilitaires
- `public` - Ressources statiques

## Personnalisation

### Établissements pénitentiaires

La liste des établissements pénitentiaires peut être modifiée dans le fichier `src/lib/data.ts`.

### Apparence

Les styles DSFR peuvent être personnalisés dans le fichier `src/app/globals.css`.

## Notes importantes

- Cette application est un prototype et n'est pas destinée à un usage en production sans revue de sécurité
- Les données sont stockées localement dans le navigateur (localStorage) et seront perdues si le cache du navigateur est effacé
- Pour une utilisation en production, il faudrait remplacer le stockage localStorage par une base de données

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.
