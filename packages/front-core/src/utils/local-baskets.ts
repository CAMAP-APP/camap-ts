import * as yup from 'yup';

interface LocalStorageBasket {
  id: number;
  multiDistribId: number;
  exp: number;
}

export const LOCAL_BASKET_LS_KEY = 'locals-baskets';

const localBasketSchema = yup.array().of(
  yup.object().shape({
    id: yup.number().required(),
    multiDistribId: yup.number().required(),
    exp: yup.number().required(),
  }),
);

const saveToLocalStorage = (localBaskets: LocalStorageBasket[]) => {
  const toSave = localBaskets.filter(
    (localBasket) => localBasket.exp > Date.now(),
  );
  localStorage.setItem(LOCAL_BASKET_LS_KEY, JSON.stringify(toSave));
  return toSave;
};

export const loadBasketsFromLocalStorage = () => {
  const str = localStorage.getItem(LOCAL_BASKET_LS_KEY);

  if (!str) return [];

  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch (error) {
    return [];
  }

  let localBaskets: LocalStorageBasket[];
  try {
    localBaskets = localBasketSchema.validateSync(parsed);
  } catch (error) {
    console.log(error);
    return [];
  }

  localBaskets = localBaskets.filter(
    (localBasket) => localBasket.exp > Date.now(),
  );
  saveToLocalStorage(localBaskets);

  return localBaskets;
};

export const saveBasketToLocalStorage = (localBasket: LocalStorageBasket) => {
  saveToLocalStorage([
    ...loadBasketsFromLocalStorage().filter((tb) => tb.id !== localBasket.id),
    localBasket,
  ]);
};

export const removeBasketFromLocalStorage = (basketId: number) => {
  saveToLocalStorage(
    loadBasketsFromLocalStorage().filter((tb) => tb.id !== basketId),
  );
};
