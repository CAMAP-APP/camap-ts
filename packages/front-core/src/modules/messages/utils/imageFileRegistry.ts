/** In-memory File storage keyed by cid — File is not JSON-serializable on Slate nodes. */
const registry = new Map<string, File>();

export const registerImageFile = (cid: string, file: File) => {
  if (!cid) return;
  registry.set(cid, file);
};

export const getImageFile = (cid: string | undefined): File | undefined => {
  if (!cid) return undefined;
  return registry.get(cid);
};

export const clearImageFiles = () => {
  registry.clear();
};
