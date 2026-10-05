# 🚀 Level Up DZ — Plateforme E-Learning Algérienne

> **Slogan :** *"Développez vos compétences, construisez votre avenir."*  
> **Repository GitHub :** [https://github.com/yacinesaheb/levelup](https://github.com/yacinesaheb/levelup)  
> **Auteur / Propriétaire :** [@yacinesaheb](https://github.com/yacinesaheb)

---

## 🌟 Bienvenue dans l'équipe ! (Welcome Collaborators)

Ce fichier **README** a été conçu pour donner à tout nouvel ami ou développeur rejoignant le projet une **vision complète, claire et sans aucun angle mort** :
1. **POURQUOI (Why) :** Quelle est l'ambition de Level Up DZ et pourquoi ce projet est crucial pour l'Algérie.
2. **COMMENT (How) :** La stack technologique, l'architecture du code, et comment installer et lancer le projet en 3 minutes.
3. **OÙ EN SOMMES-NOUS (How Far Are We) :** L'état d'avancement exact — ce qui est terminé, ce qui est en cours, et les tâches précises qui restent à coder.
4. **COMMENT CONTRIBUER :** Le workflow Git, les règles de développement et les tâches disponibles à assigner.

---

## 📑 Sommaire

- [1. Pourquoi ce Projet ? (Vision & Marché)](#1-pourquoi-ce-projet--vision--marché)
- [2. Stack Technologique & Architecture](#2-stack-technologique--architecture)
- [3. Démarrage Rapide (Installation en 5 minutes)](#3-démarrage-rapide-installation-en-5-minutes)
- [4. Identifiants & Astuces pour Développer en Local](#4-identifiants--astuces-pour-développer-en-local)
- [5. Où en Sommes-Nous ? (État d'Avancement Précis)](#5-où-en-sommes-nous--état-davancement-précis)
- [6. Roadmap & Tâches Restantes à Réaliser](#6-roadmap--tâches-restantes-à-réaliser)
- [7. Arborescence du Projet](#7-arborescence-du-projet)
- [8. Workflow Git & Bonnes Pratiques de Collaboration](#8-workflow-git--bonnes-pratiques-de-collaboration)

---

## 1. Pourquoi ce Projet ? (Vision & Marché)

### Le Problème en Algérie
- Les plateformes internationales comme **Udemy**, **Coursera** ou **Skillshare** sont inaccessibles pour plus de 90% des Algériens car elles exigent une carte bancaire internationale (Visa / MasterCard) en devises étrangères (EUR / USD).
- Des milliers d'élèves préparant le **BAC** ou le **BEM**, ainsi que des étudiants universitaires et des artisans (Pâtisserie moderne, Cake Design, Métiers manuels, Programmation), cherchent des formations de haute qualité dispensées par des formateurs locaux.
- **Le fléau du piratage :** En Algérie, les cours vidéo sont systématiquement enregistrés avec des téléphones ou des logiciels de capture puis revendus illégalement sur des canaux Telegram ou des groupes Facebook.

### La Solution : Level Up DZ
**Level Up DZ** est la première plateforme e-learning conçue sur mesure pour les réalités du marché algérien :
- 💳 **Moyens de Paiement 100% Locaux :**
  - Paiement en ligne immédiat par carte bancaire **EDAHABIA** et **CIB** en Dinars Algériens (DZD) via **Chargily Pay V2**.
  - Paiement manuel par virement **BaridiMob** et versement **CCP** avec téléversement du reçu et validation par l'administration.
- 🛡️ **Technologie Anti-Piratage par Filigrane Dynamique :**
  - Un lecteur vidéo personnalisé incruste le **Nom, Email et Téléphone** de l'étudiant connecté directement sur l'image.
  - Ce filigrane **rebondit en continu de manière aléatoire** pendant la lecture. Si un étudiant filme son écran pour diffuser la vidéo sur les réseaux sociaux, son identité est affichée en plein milieu, permettant son bannissement immédiat.
- 🎓 **Organisation par Cycles Algériens :**
  - Catégorisation intelligente par niveau académique (Lycée/BAC, CEM/BEM, Université) et filières pratiques (Pâtisserie, Salés modernes, Informatique, Artisanat).
- 🌐 **Prévue Bilingue (Arabe RTL & Français) :**
  - Adaptée aux programmes scolaires arabophones et aux formations techniques francophones.

---

## 2. Stack Technologique & Architecture

| Domaine | Technologie | Justification / Détails |
|---|---|---|
| **Framework Fullstack** | **Next.js 16** (App Router) | Server Components (RSC) pour le SEO, Server Actions pour les mutations rapides, et rendu optimisé. |
| **Interface & Rendu** | **React 19** & **TypeScript 5** | Typage strict pour éviter les erreurs d'exécution. |
| **Design & Styles** | **Vanilla CSS Moderne** | Design système complet avec variables CSS (`globals.css`), esthétique épurée inspirée d'Apple, glassmorphism, mode sombre/clair, et micro-animations. |
| **Base de Données & ORM** | **Prisma ORM (v5.22)** | Actuellement **SQLite** (`dev.db`) pour un développement local ultra-rapide sans installer de serveur lourd. Migration prévue vers **PostgreSQL Cloud (Neon / Supabase)** pour la production. |
| **Authentification** | **NextAuth.js v4** | Authentification par Email/Mot de passe sécurisé (bcrypt), support Google OAuth, sessions persistées, tokens de vérification. |
| **Double Facturation (2FA) & Sécurité** | Chiffrement par code OTP à 6 chiffres | 2FA optionnel activable/désactivable par l'utilisateur depuis son profil. |
| **Envoi d'Emails** | **Resend** | Envoi de codes d'activation, réinitialisation de mot de passe et codes 2FA. *En local, les codes sont également imprimés dans la console.* |
| **Paiements Algérie** | **Chargily Pay V2** | API officielle pour cartes EDAHABIA & CIB avec mode simulation intégré pour les tests locaux sans clé API réelle. |
| **Lecteur Vidéo** | Custom React Player | Lecteur HTML5 anti-téléchargement avec protection par clic droit désactivé et filigrane dynamique anti-leak. |

---

## 3. Démarrage Rapide (Installation en 5 minutes)

### Prérequis
- **Node.js** (version 18.x ou 20.x recommandée)
- **npm** (inclus avec Node.js) ou **pnpm** / **yarn**
- **Git**

### Étapes d'Installation

```bash
# 1. Cloner le repository
git clone https://github.com/yacinesaheb/levelup.git
cd levelup

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement .env
# (Vous pouvez copier le template .env.example fourni)
cp .env.example .env

# 4. Initialiser la base de données locale (SQLite)
npm run db:push

# 5. Créer le compte Administrateur par défaut
npm run seed:admin

# 6. (Optionnel) Générer des avis et notes fictifs sur les cours
npm run seed:reviews

# 7. Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite votre navigateur sur : **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 4. Identifiants & Astuces pour Développer en Local

### Compte Administrateur Pré-configuré
Après avoir exécuté `npm run seed:admin`, vous disposez d'un compte Super-Admin prêt à l'emploi :
- **Email :** `admin@levelupdz.com`
- **Mot de passe :** `password123`
- **Accès Backoffice :** [http://localhost:3000/admin](http://localhost:3000/admin)

---

### 💡 Astuces Indispensables pour les Collaborateurs

#### 1. Comment fonctionne la vérification par email en local ?
Vous n'avez **pas besoin de configurer Resend** pour tester la création de compte !  
Lorsque vous vous inscrivez ou activez le 2FA, le code OTP à 6 chiffres est **directement affiché dans votre terminal** :
```text
✉️ [EMAIL OTP] Verification Code for test@example.com: 489201
```
Il suffit de copier ce code depuis le terminal et de le coller dans l'écran de vérification du navigateur.

#### 2. Comment fonctionne le paiement Chargily en local ?
Si aucune clé `CHARGILY_SECRET_KEY` réelle n'est renseignée dans votre `.env`, l'application active automatiquement le **mode simulation**.  
Lors de l'achat d'un cours payant avec une carte EDAHABIA / CIB, l'application simule un paiement réussi instantané et débloque le cours sans prélever d'argent réel !

#### 3. Explorer et modifier la base de données facilement
Pour visualiser toutes les tables, les utilisateurs et les cours avec une interface graphique moderne :
```bash
npm run db:studio
```
Prisma Studio s'ouvre sur `http://localhost:5555`.

---

## 5. Où en Sommes-Nous ? (État d'Avancement Précis)

Voici la cartographie exacte de ce qui a été développé et validé :

### 🟢 Ce qui est 100% Terminé & Fonctionnel

#### Authentification & Profil Utilisateur
- [x] Inscription complète avec sélection des **58 wilayas d'Algérie** (liste déroulante officielle).
- [x] Upload et prévisualisation interactive de la photo de profil.
- [x] Vérification obligatoire du compte par code OTP à 6 chiffres (Resend + affichage console).
- [x] Connexion sécurisée (NextAuth + hachage bcrypt).
- [x] **Double Authentification (2FA) sécurisée :** activable en 1 clic dans le profil, avec vérification stricte du code jeton.
- [x] **Récupération de mot de passe ("Mot de passe oublié") :** envoi d'un email avec jeton cryptographique temporaire (1h) et formulaire de redéfinition.
- [x] Page profil avec mise à jour du nom, téléphone, wilaya et photo.

#### Découverte & Catalogue de Cours
- [x] Catalogue public (`/courses`) avec recherche en temps réel par mot-clé.
- [x] Filtres multicritères dynamiques : par Catégorie, par Prix (Tous / Gratuit / Payant), et par Ordre de tri (Plus récent / Prix croissant / Prix décroissant).
- [x] Synchronisation bidirectionnelle des filtres avec l'URL (permet de partager un lien de recherche).
- [x] Fiche détaillée de cours (`/courses/[courseId]`) avec programme complet (modules & leçons), fiche formateur, durée, et avis.

#### Système d'Avis & Notations
- [x] Système complet de notation de 1 à 5 étoiles avec commentaire textuel.
- [x] Calcul automatique de la moyenne et du volume total d'avis par cours.
- [x] Affichage de la répartition détaillée des étoiles (barres de progression de 5★ à 1★).
- [x] Formulaire interactif pour déposer ou modifier son avis si l'étudiant est inscrit.

#### Salle de Classe & Visionnage Sécurisé
- [x] Interface d'apprentissage (`/courses/[courseId]/learn/[lessonId]`) avec vue cinéma ("Theater View").
- [x] Barre latérale interactive affichant tous les modules, leçons et durées.
- [x] Case à cocher pour marquer les leçons terminées avec calcul automatique du pourcentage de progression.
- [x] **Lecteur vidéo avec filigrane dynamique anti-piratage** qui fait rebondir aléatoirement le Nom, l'Email et le Numéro de téléphone de l'étudiant sur la vidéo.
- [x] Désactivation du clic droit sur la vidéo et suppression de l'option de téléchargement natif.

#### Espace Formateur (Instructor Portal)
- [x] Formulaire de candidature pour devenir formateur (`TeacherApplicationSection`) : spécialité, bio, téléphone, wilaya, portfolio.
- [x] Tableau de bord formateur (`/instructor`) : vue d'ensemble des ventes, des revenus nets (80%), et du nombre d'étudiants inscrits.
- [x] Constructeur complet de cours (`/instructor/courses/[courseId]`) : ajout/modification de modules, chapitres, leçons, vidéos, prix et description.
- [x] Soumission d'un cours pour modération administrative (statuts : `DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`).
- [x] Module de demande de retrait de fonds (`/instructor/payouts`) avec calcul en temps réel du solde retirable et saisie des coordonnées BaridiMob / CCP.

#### Panneau d'Administration (Admin Backoffice)
- [x] Tableau de bord analytique (`/admin`) : calcul automatique du volume d'affaires brut (GMV), de la commission plateforme (20%), et du nombre d'utilisateurs.
- [x] **Modération des Cours (`/admin/courses`) :** examen des cours soumis, approbation en un clic, ou rejet avec motif d'explication renvoyé au formateur.
- [x] **Gestion des Candidatures Enseignants (`/admin/users`) :** approbation ou refus des dossiers d'instructeurs avec bascule automatique du rôle utilisateur.
- [x] **Gestion Financière & Retraits (`/admin/finance`) :** tableau récapitulatif des cours avec calcul des commissions, et validation/rejet des demandes de virements formateurs avec saisie du numéro de transaction bancaire.

#### Paiements & Inscription
- [x] Inscription gratuite en 1 clic pour les cours à 0 DZD.
- [x] Intégration de **Chargily Pay V2** pour le paiement par cartes EDAHABIA & CIB.
- [x] Route webhook sécurisée (`/api/webhooks/chargily`) avec vérification cryptographique de signature et déblocage automatique de l'inscription à la confirmation du paiement.
- [x] Page de félicitations et confirmation de paiement (`/enroll/success`).

---

### 🟡 Ce qui est Partiellement Développé (En Cours)

1. **Page d'Accueil (`src/app/page.tsx`) :**
   - Le héros principal et le conteneur en verre sont en place, mais la page a besoin d'être enrichie avec les sections commerciales réelles (formations vedettes, grille des pôles BAC/BEM/Métiers, logos de confiance EDAHABIA/CIB/BaridiMob, section formateurs).
2. **Hébergement Vidéo Haute Sécurité :**
   - Le lecteur utilise actuellement des fichiers `.mp4` avec le filigrane anti-vol. Pour une protection maximale contre les extensions de téléchargement de navigateur, il reste à brancher un flux découpé et chiffré **HLS** (`.m3u8`) avec URLs signées temporaires (via Cloudflare Stream, Bunny.net ou Mux).
3. **Certificats de Réussite :**
   - La détection de complétion d'un cours à 100% et l'affichage visuel existent déjà dans `/dashboard/certificates`, mais le bouton de téléchargement de certificat en PDF haute résolution et la page de vérification par QR code (`/verify-certificate/[id]`) restent à finaliser.
4. **Stockage des Fichiers (Images & Vidéos) :**
   - Actuellement stockés dans le dossier local `public/uploads`. Avant la mise en ligne sur Vercel (dont le système de fichiers est en lecture seule), il faut connecter un bucket compatible S3 (Cloudflare R2 ou Supabase Storage).

---

## 6. Roadmap & Tâches Restantes à Réaliser

Voici la liste des chantiers prioritaires où vous pouvez apporter votre aide :

### 🎯 Tâche 1 : Créer les Pages Légales & Régler les Liens du Footer (Priorité Haute)
- **Objectif :** Résoudre les erreurs 404 du pied de page (`src/components/Footer.tsx`).
- **Fichiers à créer :**
  - `src/app/cgu/page.tsx` : Conditions Générales d'Utilisation (règles de la plateforme, interdiction stricte de partage de compte et de capture d'écran).
  - `src/app/privacy/page.tsx` : Politique de Confidentialité (protection des données personnelles, explication du filigrane vidéo).
  - `src/app/refund/page.tsx` : Politique de Remboursement conforme au brief (aucun remboursement si le visionnage vidéo a commencé, sauf incident technique vérifié).
  - `src/app/categories/page.tsx` : Page répertoire des grandes filières (BAC, BEM, Pâtisserie, Informatique).

### 💳 Tâche 2 : Module de Paiement Manuel BaridiMob & CCP (Priorité Haute)
- **Objectif :** Permettre aux étudiants qui n'ont pas de carte EDAHABIA de payer par virement BaridiMob ou au bureau de poste CCP.
- **Détails techniques :**
  - Ajouter un onglet "Paiement Manuel" dans `src/components/EnrollmentForm.tsx` affichant le RIP BaridiMob et le compte CCP.
  - Champ d'upload pour la capture d'écran du reçu + champ texte pour le numéro de référence.
  - Créer le modèle Prisma `PaymentTransaction` avec statut `PENDING`.
  - Créer l'interface administrateur (`/admin/payments`) pour valider ou refuser les reçus en un clic.

### 🎨 Tâche 3 : Refonte & Dynamisation de la Page d'Accueil (Priorité Moyenne)
- **Objectif :** Transformer `src/app/page.tsx` en une page d'atterrissage ultra-moderne et vendeuse.
- **Composants à ajouter :**
  - Bannière de confiance avec les logos officiels : EDAHABIA, CIB, BaridiMob, Algérie Poste (CCP).
  - Grille des cours populaires avec cartes interactives et notes en étoiles.
  - Navigation par pôles d'études (Lycée/BAC, CEM/BEM, Cuisine & Pâtisserie, Formations Pro).
  - Section d'incitation pour les futurs formateurs avec lien vers `/register`.
  - Bouton flottant officiel WhatsApp pour l'assistance en direct.

### 📄 Tâche 4 : Génération de Certificat PDF Téléchargeable (Priorité Moyenne)
- **Objectif :** Permettre aux étudiants ayant complété un cours à 100% de télécharger un certificat officiel.
- **Détails techniques :**
  - Intégrer une librairie de génération PDF client (`jspdf` ou `html2canvas`) dans `src/app/dashboard/certificates/page.tsx`.
  - Inclure le logo Level Up DZ, le nom complet de l'étudiant, la date de fin, le titre de la formation, et un identifiant unique vérifiable.

### 🌐 Tâche 5 : Préparation au Bilinguisme Arabe & Français (RTL) (Priorité Moyenne)
- **Objectif :** Rendre la plateforme accessible aux élèves arabophones.
- **Détails techniques :**
  - Créer les dictionnaires de traduction par clés (`src/locales/fr.json` et `src/locales/ar.json`).
  - Ajouter le sélecteur de langue `FR | العربية` dans la Navbar.
  - Mettre en place la prise en charge du sens de lecture droite-à-gauche (`dir="rtl"`) avec des propriétés logiques CSS.

### ☁️ Tâche 6 : Migration Base de Données Cloud & Stockage S3 (Pré-lancement)
- **Objectif :** Préparer le déploiement sur Vercel.
- **Détails techniques :**
  - Basculer `schema.prisma` de `provider = "sqlite"` vers `provider = "postgresql"` avec Neon.tech ou Supabase.
  - Remplacer le système d'upload local (`src/app/api/upload/route.ts`) par un client S3 SDK vers **Cloudflare R2** (sans frais de bande passante sortante).

---

## 7. Arborescence du Projet

```text
levelup/
├── docs/                                # Documentation métier et plans d'action originaux
│   ├── LevelUpDZ_Project_Brief.md       # Cahier des charges complet validé
│   └── PUBLISHING_ACTION_PLAN_DETAILS.md# Roadmap technique détaillée
├── prisma/
│   ├── schema.prisma                    # Modèles de données (User, Course, Lesson, Reviews, etc.)
│   └── dev.db                          # Base SQLite locale de développement
├── public/
│   └── uploads/                         # Fichiers médias téléversés en local
├── scripts/
│   ├── seed_admin.js                    # Script de création du Super Admin
│   ├── seed_reviews.js                  # Script d'injection des avis de démonstration
│   └── init_db_extensions.js            # Initialisation des extensions de tables
├── src/
│   ├── actions/                         # Next.js Server Actions (mutations backend)
│   │   ├── courseModeration.ts          # Validation/rejet des cours par l'admin
│   │   ├── instructorApplication.ts     # Dépôt & examen des candidatures formateurs
│   │   └── reviews.ts                   # Dépôt des avis sur les cours
│   ├── app/                             # Pages & Routes Next.js (App Router)
│   │   ├── admin/                       # Espace Super-Admin (cours, users, finance)
│   │   ├── api/                         # Routes API (NextAuth, Webhooks, Chargily, Upload)
│   │   ├── courses/                     # Catalogue public & Fiches détaillées de cours
│   │   │   └── [courseId]/learn/        # Salle de visionnage des cours (Classroom)
│   │   ├── dashboard/                   # Espace étudiant (cours suivis, profil, certificats)
│   │   ├── instructor/                  # Espace formateur (gestion des cours, retraits)
│   │   ├── login/ & register/           # Authentification & vérification OTP
│   │   ├── forgot-password/             # Récupération de mot de passe
│   │   └── page.tsx                     # Page d'accueil du site
│   ├── components/                      # Composants réutilisables (Navbar, VideoPlayer, Filtres...)
│   └── lib/                             # Utilitaires (Prisma client, Chargily, Tokens, Mailer)
├── .env.example                         # Template officiel des variables d'environnement
├── package.json                         # Dépendances et scripts de démarrage
└── tsconfig.json                        # Configuration TypeScript
```

---

## 8. Workflow Git & Bonnes Pratiques de Collaboration

Pour que nous puissions coder ensemble sans conflits et garder un code propre :

### 1. Règle d'or : Ne jamais pousser directement sur `main`
La branche `main` est réservée aux versions stables et testées.

### 2. Comment créer une nouvelle fonctionnalité ?
```bash
# 1. Toujours synchroniser votre branche locale avec le dépôt distant
git checkout main
git pull origin main

# 2. Créer une nouvelle branche pour votre tâche
# Exemples : feature/cgu-pages, feature/baridimob-payment, fix/navbar-mobile
git checkout -b feature/nom-de-votre-tache

# 3. Codez et testez votre fonctionnalité localement
npm run dev

# 4. Enregistrez vos modifications
git add .
git commit -m "feat: ajout des pages légales CGU et politique de remboursement"

# 5. Envoyez votre branche sur GitHub
git push -u origin feature/nom-de-votre-tache
```

### 3. Ouvrir une Pull Request (PR)
1. Rendez-vous sur [https://github.com/yacinesaheb/levelup](https://github.com/yacinesaheb/levelup).
2. Cliquez sur le bouton vert **Compare & pull request**.
3. Décrivez succinctement ce que vous avez ajouté ou corrigé.
4. Demandez une relecture (Review) à un coéquipier avant de fusionner (Merge).

### 4. Conventions de Code
- **Composants Client vs Serveur :** Par défaut dans Next.js App Router, tous les composants sont des **Server Components**. N'ajoutez `"use client";` au tout début du fichier que si le composant a besoin d'états React (`useState`, `useEffect`), de gestionnaires d'événements (`onClick`), ou de hooks de navigation (`useRouter`, `useSearchParams`).
- **Design System :** Utilisez les variables CSS définies dans `src/app/globals.css` (ex: `var(--brand-orange)`, `var(--brand-blue)`, `var(--surface)`, `var(--border)`). Évitez les couleurs brutes écrites en dur.
- **Sécurité :** Ne commitez **jamais** de fichiers `.env` contenant de vraies clés secrètes sur GitHub.

---

## 💬 Des Questions ou Besoin d'Aide ?

Si vous rencontrez le moindre blocage lors de l'installation ou avez un doute sur la logique métier, contactez **Yacine** ou ouvrez une **Issue** directement sur le repository GitHub.

**Bon dev à tous, et faisons de Level Up DZ la meilleure plateforme d'apprentissage d'Algérie ! 🇩🇿🔥**
