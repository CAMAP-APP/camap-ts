import sharp = require('sharp');

export const compressImage = async (
  imageData: Buffer,
  mimeType: string,
  maxWidth: number,
) => {
  try {
    let sharped = sharp(imageData);
    if (mimeType === 'image/png') {
      sharped = sharped.png({ quality: 80 });
    } else {
      sharped = sharped.jpeg({ mozjpeg: true });
    }
    return sharped.resize(maxWidth, null, { withoutEnlargement: true }).toBuffer();
  } catch (e) {
    throw e;
  }
};
