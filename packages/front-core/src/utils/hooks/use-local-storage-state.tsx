import React from 'react';

export const loadFromLs = <T,>(key: string): T | undefined => {
  const value = window.localStorage.getItem(key);

  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return undefined;
  }
};

export const saveToLs = <T,>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const useLocalStorageState = <T,>(
  key: string,
  initValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [innerValue, _setValue] = React.useState(
    loadFromLs<T>(key) || initValue,
  );

  const setValue = (value: T) => {
    saveToLs(key, value);
    _setValue(value);
  };

  /** */
  return [innerValue, setValue];
};
