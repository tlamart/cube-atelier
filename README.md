# Cube Atelier

Tutoriel en français de résolution du Rubik’s Cube 3×3, méthode débutant,
avec représentation 3D interactive en CSS et JavaScript natifs.

## Consulter le site

Ouvrir `dist/index.html` dans un navigateur récent, ou servir le dossier `dist` :

```sh
python3 -m http.server 8000 --directory dist
```

Puis ouvrir `http://localhost:8000`.

## Publier

Déposer le **contenu** de `dist/` à la racine d’un hébergement statique :
`index.html`, `style.css` et `app.js`, dans le même dossier.
Aucune installation, compilation, clé API ou configuration serveur n’est nécessaire.
Les chemins relatifs permettent aussi une publication dans un sous-dossier.

L’archive `cube-atelier-publication.zip` contient ces trois fichiers à sa racine.
Aucun site distant n’a été créé ou déployé dans cette vérification.

## Fonctionnement

- Sept étapes avec objectifs, consignes et conseils.
- Cube composé de 54 facettes, rotations des six faces et changement de point de vue.
- Lecture, pause, mouvement suivant/précédent, réinitialisation et trois vitesses.
- Cas préparé propre à chaque étape : les démos sont des exemples indépendants,
  pas un solveur de cube personnalisé ni une résolution continue de l’étape 1 à 7.
- La dernière étape utilise la variante `R′ D′ R D`, avec le jaune au-dessus.
- Progression enregistrée uniquement dans le localStorage du navigateur.
- Fonctionne sans ressources externes. Les liens vers J Perm nécessitent Internet.
- Navigation clavier ; flèches pour tourner la vue du cube sélectionné ;
  réduction des animations si le système demande moins de mouvements.

## Contrôles

```sh
node --check dist/app.js
node checks/verify.cjs
```

Les tests vérifient les ressources et les éléments HTML, le moteur du cube,
les prérequis des démonstrations, leurs inverses, la navigation, la sauvegarde,
les commandes et les annulations pendant une animation.
L’interface est testée avec un DOM simulé : ces contrôles ne certifient pas
le rendu CSS, les interactions tactiles ou le comportement des API du navigateur.

La vérification visuelle n’a pas pu être effectuée dans l’environnement de travail,
car le service navigateur n’est pas disponible. Avant publication finale,
ouvrir le site sur ordinateur et mobile et vérifier l’affichage du cube,
la lecture et la pause, les sept étapes et la fenêtre des notations.

Inspiration : https://jperm.net/3x3 — adaptation pédagogique indépendante.
