const BASE64_IMAGE_REGEX = /^data:(image\/.+);base64,/;

export const getContentAndTypeFromBase64EncodedImage = (base64EncodedImage: string) => {
  const content = base64EncodedImage.replace(BASE64_IMAGE_REGEX, '');
  const contentTypeMatch = base64EncodedImage.match(BASE64_IMAGE_REGEX);
  const contentType = contentTypeMatch && contentTypeMatch.length > 1 ? contentTypeMatch[1] : 'image/*';

  return [content, contentType];
};

export const getBase64EncodedImage = (content: string, contentType = 'image/*') => {
  return `data:${contentType};base64,${content}`;
};
