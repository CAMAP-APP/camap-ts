/* eslint-disable import/prefer-default-export */
export const encodeFileToBase64String = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const dataURI = reader.result as string;
      const b64 = dataURI.replace(/^data:.+;base64,/, '');
      return resolve(b64);
    };
    reader.readAsDataURL(file);
  });
};
