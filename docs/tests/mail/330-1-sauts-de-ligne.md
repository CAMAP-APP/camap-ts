# Use case


# Test Scenario

1 Copier/coller source dans l'interface de messagerie
2 vérifier que le contenu collé correspond au contenu copié
3 envoyer le mail
4 vérifier que le mail reçu correspond au mail copié

Source

```
Lorem Ipsum
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.


Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.



Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<br>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
```

there should be respecitvely 0, 1, 2, 3 and 0 with `<br>` empty lines between each line

si le collage est fait avec ctrl+V le formattage (couleur du texte) doit etre conservé
si le collage est fait avec ctrl+shift+v le formattage ne doit pas etre conservé et une seule copie du texte doit être collée

## Résultats

1 OK
2 OK
3 OK
4 OK