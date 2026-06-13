# Contributing to Camap

Merci de l'intérêt que vous portez à Camap ! Ce guide décrit la procédure à suivre pour contribuer au projet.

## Architecture du projet

Camap est composé de deux dépôts complémentaires :

- **[camap-hx](https://github.com/CAMAP-APP/camap-hx)** — module backend/frontend en Haxe (Neko/Templo/Apache2)
- **[camap-ts](https://github.com/CAMAP-APP/camap-ts)** — module en TypeScript (Node.js)

La documentation fonctionnelle et technique se trouve dans `camap-ts/docs`.

---

## Prérequis

- Avoir un compte GitHub
- Avoir été ajouté comme collaborateur sur le ou les dépôts concernés (contacter les mainteneurs)
- Avoir lu la documentation dans `camap-ts/docs` avant de commencer

---

## Workflow de contribution

### 1. Créer une branche depuis `staging`

La branche `staging` est la branche d'intégration. **Ne jamais travailler directement sur `staging` ou `master`.**

```bash
git checkout staging
git pull origin staging
git checkout -b <nom-de-branche>
```

### Convention de nommage des branches

| Type de contribution | Préfixe | Exemple |
|---|---|---|
| Nouvelle fonctionnalité | `feature-` | `feature-export-csv-commandes` |
| Correction de bug référencé sur Mantis | `mantis-` | `mantis-1234` |

Le nom doit être en minuscules, avec des tirets, et suffisamment explicite.

---

### 2. Développer et commiter

Travaillez sur votre branche locale. Quelques règles générales :

- **Un commit = une intention claire** : préférez des commits atomiques avec un message explicite
- Testez votre modification avant de soumettre
- Respectez les conventions de code propres à chaque module (voir ci-dessous)

#### camap-hx (Haxe)
- Haxe 4.0.5 — ne pas utiliser d'APIs dépréciées
- Typage explicite obligatoire pour les APIs publiques, champs, paramètres et valeurs de retour
- Maximum 2–3 niveaux d'imbrication, privilégier les early returns
- `Null<T>` uniquement si la valeur est légitimement optionnelle
- Un seul type par fichier ; nom du fichier = nom du type
- Packages en minuscules, alignés sur la structure de répertoires
- Formatage selon `hxformat.json` (présent à la racine)
- Fichiers `.mtt` : utiliser la macro `$$neoModule`

#### camap-ts (TypeScript)
- Respecter la configuration ESLint et Prettier du projet
- Typage strict, pas de `any` sans justification

---

### 3. Pousser la branche et ouvrir une Pull Request

```bash
git push origin <nom-de-branche>
```

Depuis GitHub, ouvrir une **Pull Request vers la branche `staging`** (et non `master`).

#### Checklist avant soumission

- [ ] La branche est créée depuis `staging` (et à jour avec `staging`)
- [ ] Le code compile sans erreur
- [ ] Les fonctionnalités existantes ne sont pas régressées
- [ ] Le titre de la PR est explicite (`[mantis-1234] Correction du calcul de TVA` ou `[feature] Export CSV des commandes`)
- [ ] La description explique le contexte, la solution choisie, et comment tester

---

### 4. Revue et merge

Un mainteneur relira votre PR. Des demandes de modifications peuvent être faites directement via les commentaires GitHub. Une fois approuvée, la PR sera mergée dans `staging` par un mainteneur.

Le passage de `staging` vers `master` (mise en production) est géré exclusivement par l'équipe Camap.

---

## Signaler un bug

Les bugs sont tracés sur le tracker Mantis du projet. Merci de vérifier qu'un ticket n'existe pas déjà avant d'en ouvrir un nouveau.

## Questions

Pour toute question sur le projet ou la procédure de contribution, ouvrez une [discussion GitHub](https://github.com/CAMAP-APP/camap-hx/discussions) ou contactez les mainteneurs via le tracker [Mantis](https://mantisbt.amap44.org).