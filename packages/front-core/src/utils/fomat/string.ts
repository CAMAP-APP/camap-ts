export const removeAccents = (string?: string): string => {
  if (!string) return '';
  return string?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const removeSpaces = (string?: string): string => {
  if (!string) return '';
  return string.replace(/\s/g, '');
};

const entitiesToCharMap = {
  '&amp;': '&',
  '&quot;': '"',
};

export const entityToChar = (string: string): string => {
  let convertedString = string;
  (Object.keys(entitiesToCharMap) as (keyof typeof entitiesToCharMap)[]).forEach((entity) => {
    if (convertedString.includes(entity)) {
      convertedString = convertedString.replace(new RegExp(entity, 'g'), entitiesToCharMap[entity]);
    }
  });
  return convertedString;
};
