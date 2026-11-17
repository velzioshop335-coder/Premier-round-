# Premier Round

Appli de boxe pour débutants, sans date de fin.

- Questionnaire de départ : sexe, poids, taille, durée de séance, jours d'entraînement, objectif (corps voulu), matériel.
- Programme généré semaine après semaine : technique et shadow, cardio (course, HIIT, corde), prépa physique, circuits boxe, gainage, récupération active. Les séances changent chaque semaine.
- Chrono guidé avec bip 5 secondes avant chaque changement.
- Suivi : séances terminées, temps d'entraînement, série de semaines, courbe de poids, historique.
- Fonctionne sur téléphone, s'installe comme une appli et s'ouvre sans connexion.

C'est un site statique : aucun serveur, aucune base de données, aucun compte. Tes réponses et ta progression sont enregistrées dans le navigateur de l'appareil (stockage local).

## Contenu du dossier

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page de l'appli |
| `style.css` | Styles (thème clair et sombre automatiques) |
| `app.js` | Tout le code : générateur de programme, questionnaire, chrono, suivi |
| `manifest.webmanifest` | Nom, couleurs et icônes pour l'installer sur le téléphone |
| `sw.js` | Permet d'ouvrir l'appli sans connexion |
| `icons/` | Icônes de l'appli |

## Mettre l'appli en ligne avec GitHub Pages

1. Crée un compte sur github.com, puis clique sur **New repository** (nom au choix, par exemple `premier-round`, dépôt **Public**).
2. Dans le dépôt, clique sur **Add file**, puis **Upload files**.
3. Glisse tout le contenu de ce dossier (`index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `README.md` et le dossier `icons`), puis clique sur **Commit changes**. Les fichiers doivent être à la racine du dépôt, pas dans un sous-dossier.
4. Va dans **Settings**, puis **Pages**. Sous **Build and deployment**, choisis **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
5. Attends une à deux minutes. L'adresse apparaît en haut de la page : `https://TON-PSEUDO.github.io/premier-round/`.

## Installer sur le téléphone

- **iPhone (Safari)** : bouton Partager, puis **Sur l'écran d'accueil**.
- **Android (Chrome)** : menu des trois points, puis **Installer l'application** ou **Ajouter à l'écran d'accueil**.

## Tester sur ton ordinateur

Le service worker et l'installation demandent une adresse `http://localhost` ou `https`. Dans le dossier :

```
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000.

## Publier une modification

1. Modifie les fichiers dans le dépôt (bouton crayon sur GitHub, ou nouvel envoi).
2. Dans `sw.js`, change `VERSION = "v1"` en `"v2"` pour que les téléphones récupèrent la mise à jour.

## Bon à savoir

- Les données restent sur l'appareil et le navigateur utilisés. Un autre téléphone, ou l'effacement des données du site, repart de zéro.
- Les polices viennent de Google Fonts. Sans connexion lors de la toute première ouverture, l'appli s'affiche avec des polices de secours.
- Les repères (IMC, protéines, eau) sont généraux et ne remplacent pas l'avis d'un médecin ou d'un coach.

## Où modifier quoi

- Exercices, combinaisons et échauffements : en haut de `app.js` (`DRILLS`, `AGIL`, `HIIT`, `POOL`, `COMBOS`, `WARM`, `COOL`).
- Durées d'effort et de repos par semaine : `shadowParams`, `hiitParams`, `runParams`.
- Objectifs corporels et enchaînement des séances : `GOALS` et `THEMES`.
- Couleurs et polices : début de `style.css`.
