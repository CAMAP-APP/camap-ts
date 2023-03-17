export const aIntId = () => {
  return parseInt(`${Date.now()}${Math.round(Math.random() * 1000)}`, 10);
};

export const aStringId = () => {
  return `${Date.now()}${Math.round(Math.random() * 1000)}`;
};

export const randomItem = (items: any[]) =>
  items[Math.floor(Math.random() * items.length)];
