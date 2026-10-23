# 01 — Présentation du projet

## 1. Informations générales

| Élément               | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| **Nom du projet**     | Plateforme web professionnelle pour architecte                         |
| **Type**              | Site vitrine, éditorial et plateforme de gestion                       |
| **Frontend**          | Next.js                                                                |
| **Backend**           | NestJS                                                                 |
| **Langage principal** | TypeScript                                                             |
| **Style / UI**        | Tailwind CSS                                                           |
| **Architecture**      | Frontend découplé + API Backend                                        |
| **Public cible**      | Clients, partenaires, professionnels, porteurs de projets et visiteurs |
| **Administration**    | Interface privée d'administration                                      |
| **Statut**            | En cours de conception et de développement                             |

---

## 2. Contexte du projet

Le projet consiste à développer une plateforme web professionnelle destinée à un architecte ou à une agence d'architecture.

La plateforme ne doit pas être limitée à une simple présentation de l'architecte. Elle doit constituer un véritable espace numérique permettant de :

* présenter le profil professionnel de l'architecte ;
* présenter ses domaines d'expertise ;
* présenter ses réalisations et projets ;
* publier des articles et contenus liés à l'architecture ;
* partager des connaissances et réflexions professionnelles ;
* permettre aux visiteurs de contacter l'architecte ;
* recevoir des demandes concernant de nouveaux projets ou opportunités de marché ;
* gérer les contenus du site depuis une interface d'administration.

L'objectif est donc de construire une plateforme évolutive pouvant être utilisée à la fois comme **portfolio professionnel**, **plateforme éditoriale** et **outil de réception et de gestion des opportunités professionnelles**.

---

## 3. Objectifs du projet

### 3.1 Objectif général

Développer une plateforme web moderne permettant à un architecte de valoriser son expertise, présenter ses réalisations, partager ses connaissances et recevoir de nouvelles opportunités professionnelles.

### 3.2 Objectifs spécifiques

La plateforme doit permettre de :

1. présenter l'identité et le parcours professionnel de l'architecte ;
2. présenter ses compétences et domaines d'intervention ;
3. présenter les projets réalisés ou en cours ;
4. publier et gérer des articles ;
5. organiser les articles par catégories ;
6. permettre aux visiteurs de consulter les contenus de manière dynamique ;
7. recevoir des messages via un formulaire de contact ;
8. recevoir des demandes de projets ou de prestations ;
9. permettre l'ajout de pièces jointes aux demandes lorsque nécessaire ;
10. gérer les projets et articles depuis une interface privée ;
11. gérer les messages reçus ;
12. gérer les demandes de marché ou de projets ;
13. gérer les médias utilisés sur la plateforme ;
14. gérer les utilisateurs et leurs rôles ;
15. permettre l'évolution future de la plateforme sans devoir reconstruire toute l'application.

---

# 4. Public cible

La plateforme s'adresse principalement aux catégories d'utilisateurs suivantes.

## 4.1 Visiteurs

Les visiteurs peuvent consulter librement les contenus publics du site.

Ils peuvent notamment :

* consulter la page d'accueil ;
* découvrir l'architecte ;
* consulter les projets ;
* consulter les articles ;
* lire un article complet ;
* consulter les informations de contact ;
* envoyer un message ;
* soumettre une demande de projet ou de prestation.

---

## 4.2 Clients potentiels

Les clients potentiels peuvent utiliser la plateforme pour :

* découvrir les réalisations ;
* comprendre les domaines d'expertise ;
* consulter les informations professionnelles ;
* prendre contact avec l'architecte ;
* soumettre une idée ou un besoin de projet ;
* transmettre les premières informations nécessaires à l'étude d'un projet.

---

## 4.3 Partenaires et professionnels

Les partenaires, entreprises, bureaux d'études, organisations ou autres professionnels peuvent :

* consulter le portfolio ;
* consulter les domaines d'expertise ;
* prendre connaissance des publications ;
* proposer une collaboration ;
* soumettre une opportunité professionnelle.

---

## 4.4 Administrateurs

Les administrateurs disposent d'un espace privé permettant de gérer le contenu et les données de la plateforme.

Ils peuvent notamment :

* gérer les articles ;
* gérer les projets ;
* gérer les catégories ;
* consulter les messages ;
* consulter les demandes de projets ;
* gérer les médias ;
* gérer les utilisateurs ;
* gérer certains paramètres de la plateforme.

---

# 5. Périmètre fonctionnel

La plateforme est organisée autour de plusieurs grands modules.

## 5.1 Module Présentation

Ce module permet de présenter :

* l'architecte ;
* son parcours ;
* son expertise ;
* ses domaines d'intervention ;
* ses valeurs professionnelles ;
* ses coordonnées.

---

## 5.2 Module Projets

Ce module permet de présenter les réalisations architecturales.

Chaque projet peut contenir notamment :

* un titre ;
* une description ;
* une image principale ;
* plusieurs images ;
* une localisation ;
* une année ;
* un type de projet ;
* une superficie ;
* un statut ;
* un concept architectural ;
* une galerie multimédia.

Les projets sont accessibles publiquement sous forme de pages dynamiques.

---

## 5.3 Module Articles

Ce module constitue la partie éditoriale de la plateforme.

Il permet à l'architecte de partager :

* des connaissances ;
* des analyses ;
* des réflexions ;
* des conseils ;
* des actualités ;
* des contenus techniques ;
* des publications liées à l'architecture.

Les articles peuvent être organisés par catégories.

Chaque article possède une URL dynamique basée sur son slug.

Exemple :

```text
/articles/architecture-durable-en-afrique
```

---

## 5.4 Module Contact

Le module contact permet aux visiteurs d'envoyer un message.

Le formulaire pourra contenir notamment :

* prénom ;
* nom ;
* adresse e-mail ;
* téléphone ;
* sujet ;
* message.

Les messages reçus sont accessibles depuis l'administration.

---

## 5.5 Module Marchés / Demandes de projets

Ce module permet à un visiteur, une entreprise ou une organisation de soumettre une opportunité ou une demande de projet.

Les informations peuvent notamment comprendre :

* nom du demandeur ;
* organisation ;
* adresse e-mail ;
* téléphone ;
* type de projet ;
* localisation ;
* budget indicatif ;
* délai souhaité ;
* description du besoin ;
* pièce jointe éventuelle.

Les demandes peuvent être suivies selon différents états :

```text
Nouveau
   ↓
En étude
   ↓
Contacté
   ↓
Proposition envoyée
   ↓
Accepté / Refusé
```

---

# 6. Module d'authentification

La plateforme comprend un espace d'authentification destiné principalement aux utilisateurs autorisés de l'administration.

Les fonctionnalités prévues sont :

* connexion ;
* déconnexion ;
* récupération du mot de passe ;
* réinitialisation du mot de passe ;
* contrôle des accès ;
* gestion des rôles.

Les visiteurs n'ont pas besoin de créer un compte pour consulter les contenus publics.

---

# 7. Module Administration

L'administration constitue l'espace privé de gestion de la plateforme.

Elle permettra notamment de gérer :

```text
Tableau de bord
│
├── Articles
├── Projets
├── Catégories
├── Messages
├── Demandes de projets / Marchés
├── Médias
├── Utilisateurs
└── Paramètres
```

Le tableau de bord pourra également présenter des indicateurs tels que :

* nombre d'articles ;
* nombre de projets ;
* nombre de messages ;
* nombre de demandes reçues ;
* demandes récentes ;
* contenus récemment publiés.

---

# 8. Architecture technique générale

L'application sera organisée selon une architecture séparant clairement l'interface utilisateur et la logique métier.

```text
                    VISITEUR
                       │
                       ▼
              ┌─────────────────┐
              │     NEXT.JS     │
              │    FRONTEND     │
              └────────┬────────┘
                       │
                       │ API HTTP
                       ▼
              ┌─────────────────┐
              │     NESTJS      │
              │     BACKEND     │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Base de données     Stockage médias
```

### Frontend

Le frontend est développé avec **Next.js** et **TypeScript**.

Il est responsable notamment de :

* l'affichage des pages ;
* la navigation ;
* les composants d'interface ;
* les formulaires ;
* l'affichage des projets ;
* l'affichage des articles ;
* l'interface d'administration.

### Backend

Le backend est développé avec **NestJS**.

Il est responsable notamment de :

* l'API ;
* l'authentification ;
* l'autorisation ;
* la logique métier ;
* la gestion des articles ;
* la gestion des projets ;
* la gestion des messages ;
* la gestion des demandes ;
* l'accès aux données ;
* la gestion des fichiers et médias.

---

# 9. Principes d'architecture

Le développement du projet suivra plusieurs principes.

## 9.1 Séparation des responsabilités

Le frontend et le backend sont séparés.

Le frontend ne doit pas contenir directement la logique métier ou les accès directs non contrôlés aux données sensibles.

Le backend constitue la couche responsable de la logique métier et de l'accès aux données.

---

## 9.2 Architecture modulaire

Le backend sera organisé par domaines fonctionnels.

Exemple :

```text
src/
├── auth/
├── users/
├── articles/
├── projets/
├── categories/
├── messages/
├── marches/
├── medias/
└── settings/
```

Cette organisation permet de faire évoluer chaque fonctionnalité indépendamment.

---

## 9.3 Évolutivité

La plateforme doit pouvoir évoluer ultérieurement vers de nouvelles fonctionnalités telles que :

* gestion avancée des clients ;
* espace client ;
* gestion des devis ;
* gestion des demandes de prestations ;
* notifications ;
* statistiques ;
* référencement avancé ;
* multilingue ;
* intégration de services externes ;
* gestion avancée des médias.

Ces fonctionnalités ne font pas nécessairement partie de la première version mais l'architecture doit permettre leur intégration future.

---

# 10. Organisation générale des interfaces

## Interfaces publiques

Les principales pages publiques prévues sont :

```text
/
├── a-propos
├── projets
│   └── [slug]
├── articles
│   └── [slug]
├── contact
└── marche
```

---

## Interfaces d'authentification

```text
/login
/forgot-password
/reset-password
```

---

## Interfaces d'administration

```text
/admin
├── articles
│   ├── nouveau
│   └── [id]
├── projets
│   ├── nouveau
│   └── [id]
├── categories
├── messages
├── marches
├── medias
├── utilisateurs
└── parametres
```

---

# 11. Technologies prévues

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* NestJS
* TypeScript

## Communication

* API HTTP/REST

## Gestion du code

Le projet sera organisé en deux applications distinctes :

```text
D:\Projets\Pierre\
│
├── archi-fronted\
│
├── archi-backend\
│
└── documentation\
```

---

# 12. Organisation de la documentation

La documentation du projet sera construite progressivement.

```text
documentation/
│
├── 01-presentation-projet.md
├── 02-besoins-fonctionnels.md
├── 03-besoins-non-fonctionnels.md
├── 04-architecture-generale.md
├── 05-architecture-frontend.md
├── 06-architecture-backend.md
├── 07-systeme-routage.md
├── 08-authentification-autorisation.md
├── 09-modele-donnees.md
├── 10-api.md
├── 11-interface-utilisateur.md
├── 12-module-articles.md
├── 13-module-projets.md
├── 14-module-contact.md
├── 15-module-marches.md
├── 16-module-administration.md
├── 17-medias-et-fichiers.md
├── 18-securite.md
├── 19-deploiement.md
└── 20-guide-maintenance.md
```

Chaque document sera mis à jour au fur et à mesure de l'implémentation.

---

# 13. Méthode de développement

Le projet sera développé selon le cycle suivant :

```text
DOCUMENTATION
      ↓
CONCEPTION
      ↓
DÉVELOPPEMENT
      ↓
TEST
      ↓
VALIDATION
      ↓
MISE À JOUR DE LA DOCUMENTATION
```

Pour chaque fonctionnalité importante, la documentation correspondante sera créée ou mise à jour avant ou pendant son implémentation.

Cela permet de conserver une correspondance entre :

```text
Besoin
   ↓
Architecture
   ↓
Code
   ↓
API
   ↓
Interface
   ↓
Test
```

---

# 14. État actuel du projet

Le projet se trouve dans sa phase de conception et de structuration.

Les éléments déjà définis sont notamment :

* séparation frontend/backend ;
* utilisation de Next.js pour le frontend ;
* utilisation de NestJS pour le backend ;
* utilisation de TypeScript ;
* utilisation de Tailwind CSS ;
* organisation des routes publiques ;
* organisation des routes d'authentification ;
* organisation des routes d'administration ;
* définition des principaux modules fonctionnels ;
* création d'une documentation technique séparée.

Les choix techniques qui ne sont pas encore définitivement arrêtés seront documentés dans les étapes correspondantes.

---

# 15. Historique des versions

| Version | Date | Modification                                   |
| ------- | ---- | ---------------------------------------------- |
| 1.0     | 2026 | Création de la présentation générale du projet |

---

## 16. Conclusion

La plateforme a pour objectif de constituer un environnement numérique professionnel regroupant :

* présentation de l'architecte ;
* portfolio de projets ;
* publication de connaissances ;
* communication avec les visiteurs ;
* réception d'opportunités professionnelles ;
* administration centralisée des contenus.

L'architecture technique repose sur une séparation entre **Next.js**, utilisé pour le frontend, et **NestJS**, utilisé pour le backend.

Les prochaines étapes de conception permettront de transformer cette vision générale en exigences fonctionnelles et techniques précises.