# Produits

## Fonctionnalité

Un produit représente un produit vendu par un producteur dans une AMAP.

Il ne peut exister seul et fait forcément partie d'un catalogue ( aussi appelé "contrat" dans CAMAP ). Ce catalogue est forcément relié à un producteur.

Les entités sont structurées comme ceci :

```
Groupe A :
 - Producteur A
   - Catalogue 1
     - Produit 1
     - Produit 2
     - Produit 3
   - Catalogue 2
     - Produit 4
     - Produit 5
     - ...etc
 - Producteur B
   ...etc
```

Note : Même si un producteur vend le même produit dans plusieurs AMAP, les catalogues et les produits sont dupliqués pour chaque AMAP.

## BDD

Les produits sont dans la table `Product` et ont obligatoirement une relation vers `Catalog.id`

`name` donne le nom du produit sans notion de quantité, par exemple "Tomate marmande"

`ref` est une ID utile au producteur pour identifier rapidement un produit (_SKU_ dans les sytèmes de e-commerce)

`vat` définit le pourcentage de TVA inclue dans le prix du produit. Il est en général à 5.5 pour les produits alimentaires en France.

`unitType` définit l'unité de poids ou de volume du produit : Litres, unités, Kilogrammes...etc

`qt` définit le nbre de produits vendus ensemble. Par exemple une douzaine d'oeufs est un produit vendu comme un tout, et se saisi avec `name="Oeufs", qt=12, unitType=Unit`. Un sac de 5kg de farine se saisi avec `name="Farine blé T110", qt=5, unitType=Kg`

`organic` précise si le produit est labelisé agriculture biologique

`variablePrice` indique que le prix de ce produit varie en fonction du poids ( _Fromages à la coupe, volailles, caissettes de viande_... )

`multiWeight` en combinaison avec `variablePrice`, il indique que CAMAP doit enregistrer une ligne par produit commandé, alors que le comportement par défaut fusionne les quantités si on achète plusieurs fois le même produit. Le cas le plus courant est pour des volailles, si on achète 2 poulets, on préferera avoir le détail du poids de chaque poulet et pas une seule ligne avec le poids total.

`bulk` indique que le produit est vendu en vrac, sans contenant.

## Code

Quantités : les flags `bulk` et `variablePrice` autorisent une saisie de quantité non entière (_float_) lors de la commande ou après. [On voit ici le code](https://github.com/CAMAP-APP/camap-hx/blob/master/src/service/OrderService.hx#L43) lorsqu'on enregistre une commande avec le `OrderService`.
