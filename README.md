# Cube Atelier

Tutoriel en français de résolution du Rubik’s Cube 3×3, méthode débutant,
avec représentation 3D interactive en CSS et JavaScript natifs.

## Consulter le site

Ouvrir `index.html` dans un navigateur récent, ou servir le dossier du dépôt :

```sh
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Publier sur GitHub Pages

Les fichiers du site sont à la racine du dépôt. Aucune installation ou compilation
n’est nécessaire, et aucun workflow personnalisé n’est à ajouter.

1. Ouvrir [Settings → Pages](https://github.com/tlamart/cube-atelier/settings/pages).
2. Dans **Build and deployment**, choisir **Deploy from a branch** comme source.
3. Sélectionner la branche **main** et le dossier **/ (root)**.
4. Cliquer sur **Save** et attendre la fin du déploiement GitHub Pages.

L’adresse attendue après activation est : https://tlamart.github.io/cube-atelier/

Les prochains commits sur `main` seront publiés automatiquement.
Le fichier `.nojekyll` évite le traitement du site par Jekyll.
Les chemins relatifs des ressources conviennent au sous-dossier `/cube-atelier/`.

Pour un autre hébergement statique, déposer `index.html`, `style.css` et `app.js`
dans le même dossier. Aucune clé API ni configuration serveur n’est requise.

## Fonctionnement

- Sept étapes avec objectifs, consignes et conseils.
- Cube composé de 54 facettes, rotations des six faces et changement de point de vue.
- Mode Focus actif par défaut : les cases utiles restent en couleur et les autres
  deviennent noires, sans modifier l’état du cube. La croix blanche terminée
  n’affiche que son centre et ses quatre branches ; la croix jaune est aussi isolée.
- Bouton « Toutes les couleurs » pour retrouver l’ensemble du cube ; choix mémorisé.
- Repère A sur les deux faces de l’arête suivie, B sur sa destination, avec trajet
  expliqué sous le cube. Disponible pour la croix blanche, la deuxième couronne,
  la croix jaune et l’alignement des arêtes. Les repères suivent les mouvements,
  disparaissent à la fin et reviennent en reculant. Tourner la vue si un repère
  est caché. Les cas d’exemple restent propres à chaque étape.
- Lecture, pause, mouvement suivant/précédent, réinitialisation et trois vitesses.
- Cas préparé propre à chaque étape : les démos sont des exemples indépendants,
  pas un solveur de cube personnalisé ni une résolution continue de l’étape 1 à 7.
- À l’étape 2, explication des sexy moves main droite (`R U R′ U′`) et main
  gauche (`L′ U′ L U`) avec quatre gestes détaillés et deux démonstrations au choix.
- Repère pour les arêtes du milieu : « à gauche, je commence à droite (U′) ;
  à droite, je commence à gauche (U) », introduit à l’étape 2 et détaillé à l’étape 3.
- L’étape 3 montre l’insertion à gauche en quatre temps : U′ (éloigner à droite),
  sexy move main gauche, rotation du cube pour regarder l’ancienne face gauche
  (y′), puis sexy move main droite. Les repères A/B restent attachés à la pièce
  et à son emplacement pendant la rotation. Le conseil donne aussi le cas miroir.
- La dernière étape retourne réellement le cube (`x2`), jaune en bas et blanc
  en haut, puis oriente le coin en bas devant à droite avec le sexy move main
  droite (`R U R′ U′`). Entre les coins, seule D tourne. L’exemple traite deux
  coins avec deux puis quatre répétitions, et aligne D à la fin. La vue montre
  le dessous après le retournement ; la lecture arrière annule aussi ce retournement.
- Progression enregistrée uniquement dans le localStorage du navigateur.
- Fonctionne sans ressources externes. Les liens vers J Perm nécessitent Internet.
- Navigation clavier ; flèches pour tourner la vue du cube sélectionné ;
  réduction des animations si le système demande moins de mouvements.

## Contrôles

```sh
node --check app.js
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
