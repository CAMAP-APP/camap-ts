# Traductions

La kook `useCamapTranslation` permet la gestion des traductions.

## Usage

```JSON
// <trans-dir>/foo.json

{
  "hello": "bonjour"
}

// <trans-dir>/nested/bar.json

{
  "world": "monde"
}
```

```TSX

const MyComponent = () => {
  const { tFoo, tBar } = useCamapTranslation({
    tFoo: "foo",
    tBar: "nested/bar"
  })

  return (
    <div>
      <span>{tFoo("hello")}</span>
      <span>{tBar("world")}</span>
    </div>
  );
}

// Affiche : bonjour monde

```

## Tips

`useCamapTranslation` retourne une fonction `t` qui permet de retourner la traduction de la clé de n'importe quelle namespace !

```TSX

const MyComponent = () => {
  const { t } = useCamapTranslation({
    tFoo: "foo",
    tBar: "nested/bar"
  })

  return (
    <div>
      <span>{t("hello")}</span>
      <span>{t("world")}</span>
    </div>
  );
}

// Affiche : bonjour monde

```

## API

```TS

useCamapTranslation({
  [k: string]: string
}) => {
  _t: TFunction; // fonction original
  t: TFunction;
  [k: string]: TFunction
}

```
